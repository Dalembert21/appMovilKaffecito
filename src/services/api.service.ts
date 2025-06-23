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

// Order services - ESTA SECCIÓN SERÁ REEMPLAZADA
export const pedidoService = {
  /**
   * Crea un nuevo pedido con sus detalles en una sola llamada a la API.
   * Este método es más robusto y se alinea con la lógica del backend.
   * @param carritoItems - Array de productos en el carrito.
   * @returns El pedido creado por el backend.
   */
  crearPedido: async (carritoItems: any[]): Promise<Pedido> => {
    try {
      if (!carritoItems || carritoItems.length === 0) {
        throw new Error('No se puede crear un pedido con un carrito vacío.');
      }

      // Prepara los detalles del pedido según el formato que espera el backend
      const detalles_pedido = carritoItems.map(item => {
        if (!item.producto?.id_producto || !item.cantidad) {
          throw new Error(`Producto inválido en el carrito: ${item.producto?.nombre_producto || 'Desconocido'}`);
        }
        return {
          id_producto: Number(item.producto.id_producto),
          cantidad_producto: Number(item.cantidad),
          nota_producto: item.notas || undefined,
        };
      });

      // Construye el payload final para la API
      const payload = {
        detalles_pedido,
      };

      console.log('Enviando payload para crear pedido:', payload);

      const response = await api.post('/pedidos', payload);
      
      console.log('Pedido creado exitosamente:', response.data);
      return response.data as Pedido;

    } catch (error: any) {
      console.error('Error al crear el pedido:', error.response?.data || error.message);
      const backendMessage = error.response?.data?.message;
      // El backend puede devolver un array de errores, los unimos para mostrarlos
      const errorMessage = Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage;
      throw new Error(errorMessage || 'Ocurrió un error inesperado al crear el pedido.');
    }
  },

  /**
   * Obtiene todos los pedidos.
   * @returns Una lista de todos los pedidos.
   */
  obtenerTodos: async (): Promise<Pedido[]> => {
    const response = await api.get('/pedidos');
    return response.data;
  },

  /**
   * Obtiene un pedido específico por su ID.
   * @param id - El ID del pedido.
   * @returns El pedido encontrado.
   */
  obtenerPorId: async (id: number): Promise<Pedido> => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  /**
   * Actualiza el estado de un pedido.
   * @param id - El ID del pedido a actualizar.
   * @param estado - El nuevo estado del pedido.
   * @returns El pedido actualizado.
   */
  actualizarEstado: async (id: number, estado: string): Promise<Pedido> => {
    const response = await api.put(`/pedidos/${id}`, { estado_pedido: estado });
    return response.data;
  },
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