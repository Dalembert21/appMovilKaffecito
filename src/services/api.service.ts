import axios from 'axios';
import { API_URL } from '../config';

// Interfaces
export interface ProductoPedido {
  id_producto: number;
  id_detalle_pedido?: number;
  nombre_producto: string;
  precio_producto: number | string;
  cantidad: number | string;
  notas?: string;
  subtotal?: number | string;
  imagen_url?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DetallePedido {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad_producto: number;
  precio_unitario_producto: number | string;
  subtotal: number | string;
  nota_producto?: string;
  id_grupo_pedido?: string;
  producto?: ProductoPedido;
  created_at?: string;
  updated_at?: string;
}

export interface Pedido {
  id_pedido: number;
  usuario_id: number | { id_usuario: number } | null;
  total_pedido: number | string;
  estado_pedido: string;
  numero_mesa: number | string;
  id_grupo_pedido?: string;
  notas_pedido?: string;
  created_at?: string;
  updated_at?: string;
  usuario?: {
    id_usuario: number;
    nombre_usuario: string;
    apellido_usuario: string;
    cedula_usuario: string;
  } | null;
  detalles_pedido: DetallePedido[];
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (cedula: string, password: string) => {
    const response = await api.post('/auth/login', { cedula, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Product services
export const productService = {
  getProducts: async () => {
    const response = await api.get('/productos');
    return response.data;
  },
  getProductsByCategory: async (categoryId: number) => {
    const response = await api.get(`/productos/categoria/${categoryId}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },
};

// Order services
export const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post('/pedidos', orderData);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/pedidos');
    return response.data;
  },
  getOrderDetails: async (orderId: number) => {
    const response = await api.get(`/pedidos/${orderId}`);
    return response.data;
  },
  getOrderById: async (id: number) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },
  getOrdersByStatus: async (estado: string) => {
    const response = await api.get(`/pedidos/estado/${estado}`);
    return response.data;
  },
  updateEstadoPedido: async (id: number, estado: string) => {
    const response = await api.put(`/pedidos/${id}`, { estado_pedido: estado });
    return response.data;
  },
  getOrdersByTable: async (numeroMesa: number) => {
    const response = await api.get(`/pedidos/mesa/${numeroMesa}`);
    return response.data;
  },
  getMisPedidos: async () => {
    const response = await api.get('/pedidos');
    return response.data;
  },
};

// Custom Order Services - Servicios personalizados con mejor manejo
export const customOrderService = {
  // Crear pedido con validación y manejo de errores mejorado
  createOrderWithValidation: async (carritoItems: any[], userId: number) => {
    try {
      // Validar que el usuario esté autenticado
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      // Validar que el carrito no esté vacío
      if (!carritoItems || carritoItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Preparar los detalles del pedido
      const detalles_pedido = carritoItems.map(item => ({
        id_producto: Number(item.producto.id_producto),
        cantidad_producto: Number(item.cantidad),
        nota_producto: item.notas || undefined
      }));

      // Estructura del pedido según el backend
      const pedidoData = {
        id_usuario: userId,
        detalles_pedido: detalles_pedido
      };

      console.log('Enviando pedido al backend:', pedidoData);

      const response = await api.post('/pedidos', pedidoData);
      console.log('Pedido creado exitosamente:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error en createOrderWithValidation:', error);
      
      // Manejo específico de errores
      if (error.response?.status === 500) {
        throw new Error('Error interno del servidor. Verifica que el backend esté funcionando correctamente.');
      } else if (error.response?.status === 400) {
        throw new Error(`Error de validación: ${error.response.data?.message || 'Datos inválidos'}`);
      } else if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error desconocido al crear el pedido');
      }
    }
  },

  // Crear pedido paso a paso (crear pedido primero, luego detalles)
  createOrderStepByStep: async (carritoItems: any[], userId: number) => {
    try {
      // Paso 1: Crear el pedido principal
      const pedidoData = {
        id_usuario: userId,
        total_pedido: carritoItems.reduce((total, item) => 
          total + (Number(item.producto.precio_producto) * Number(item.cantidad)), 0
        ),
        estado_pedido: 'pendiente'
      };

      console.log('Creando pedido principal:', pedidoData);
      const pedidoResponse = await api.post('/pedidos', pedidoData);
      const pedido = pedidoResponse.data;

      console.log('Pedido principal creado:', pedido);

      // Paso 2: Crear cada detalle del pedido
      const detallesCreados = [];
      for (const item of carritoItems) {
        const detalleData = {
          id_pedido: pedido.id_pedido,
          id_producto: Number(item.producto.id_producto),
          cantidad_producto: Number(item.cantidad),
          precio_unitario_producto: Number(item.producto.precio_producto),
          nota_producto: item.notas || undefined
        };

        console.log('Creando detalle:', detalleData);
        const detalleResponse = await api.post('/detalle-pedido', detalleData);
        detallesCreados.push(detalleResponse.data);
      }

      console.log('Todos los detalles creados:', detallesCreados);

      // Retornar el pedido completo con sus detalles
      return {
        ...pedido,
        detalles_pedido: detallesCreados
      };

    } catch (error: any) {
      console.error('Error en createOrderStepByStep:', error);
      throw new Error(`Error al crear pedido paso a paso: ${error.message}`);
    }
  },

  // Crear pedido con cliente por defecto
  createOrderWithDefaultClient: async (carritoItems: any[], userId: number) => {
    try {
      // Crear cliente por defecto primero
      const clienteData = {
        nombre_cliente: 'Consumidor Final',
        tipo_cliente: 'final'
      };

      console.log('Creando cliente por defecto:', clienteData);
      const clienteResponse = await api.post('/clientes', clienteData);
      const cliente = clienteResponse.data;

      console.log('Cliente creado:', cliente);

      // Crear pedido con el cliente
      const pedidoData = {
        id_usuario: userId,
        id_cliente: cliente.id_cliente,
        detalles_pedido: carritoItems.map(item => ({
          id_producto: Number(item.producto.id_producto),
          cantidad_producto: Number(item.cantidad),
          nota_producto: item.notas || undefined
        }))
      };

      console.log('Creando pedido con cliente:', pedidoData);
      const pedidoResponse = await api.post('/pedidos', pedidoData);
      
      return pedidoResponse.data;

    } catch (error: any) {
      console.error('Error en createOrderWithDefaultClient:', error);
      throw new Error(`Error al crear pedido con cliente: ${error.message}`);
    }
  },

  // Validar carrito antes de crear pedido
  validateCart: (carritoItems: any[]) => {
    const errors = [];

    if (!carritoItems || carritoItems.length === 0) {
      errors.push('El carrito está vacío');
    }

    for (let i = 0; i < carritoItems.length; i++) {
      const item = carritoItems[i];
      
      if (!item.producto || !item.producto.id_producto) {
        errors.push(`Producto ${i + 1}: ID de producto inválido`);
      }
      
      if (!item.cantidad || item.cantidad < 1) {
        errors.push(`Producto ${i + 1}: Cantidad inválida`);
      }
      
      if (!item.producto.precio_producto || Number(item.producto.precio_producto) <= 0) {
        errors.push(`Producto ${i + 1}: Precio inválido`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Detail Order services
export const detailOrderService = {
  createDetailOrder: async (detailOrderData: any) => {
    const response = await api.post('/detalle-pedido', detailOrderData);
    return response.data;
  },
  getDetailsByOrderId: async (pedidoId: number) => {
    const response = await api.get(`/pedidos/${pedidoId}/detalles`);
    return response.data;
  },
};

// Payment services
export const paymentService = {
  processPayment: async (paymentData: any) => {
    const response = await api.post('/pagos', paymentData);
    return response.data;
  },
  getPaymentHistory: async () => {
    const response = await api.get('/pagos/historial');
    return response.data;
  },
};

// Category services
export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },
  getCategoryById: async (id: number) => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },
};

export default api; 