import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
  notas?: string;
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
  id_grupo_pedido?: string; // Nuevo campo para agrupar pedidos
  notas?: string;
  created_at?: string;
  updated_at?: string;
  usuario?: {
    id_usuario: number;
    nombre_usuario: string;
    apellido_usuario: string;
    cedula_usuario: string;
  } | null;
  productos: ProductoPedido[];
  detalles?: DetallePedido[]; // Añadir la propiedad detalles
}

export interface CreatePedidoDto {
  usuario_id: number;
  total_pedido: number;
  estado_pedido: string;
  numero_mesa: number;
  productos: Array<{
    id_producto: number;
    cantidad: number;
    notas?: string;
  }>;
}

/**
 * Crea un nuevo pedido
 * @param pedido Datos del pedido a crear
 * @returns Promise con el pedido creado
 */
export const createPedido = async (pedido: CreatePedidoDto): Promise<Pedido> => {
  try {
    const response = await axios.post<Pedido>(`${API_URL}/pedidos`, pedido, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Error al crear el pedido';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene todos los pedidos
 * @returns Promise con el array de pedidos
 */
export const getPedidos = async (): Promise<Pedido[]> => {
  try {
    const response = await axios.get<Pedido[]>(`${API_URL}/pedidos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Error al cargar los pedidos';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene un pedido por su ID
 * @param id ID del pedido a buscar
 * @returns Promise con el pedido encontrado
 */
export const getPedidoById = async (id: number): Promise<Pedido> => {
  try {
    const response = await axios.get<Pedido>(`${API_URL}/pedidos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || `Error al cargar el pedido con ID ${id}`;
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los pedidos por estado
 * @param estado Estado de los pedidos a buscar
 * @returns Promise con el array de pedidos
 */
export const getPedidosByEstado = async (estado: string): Promise<Pedido[]> => {
  try {
    const response = await axios.get<Pedido[]>(`${API_URL}/pedidos/estado/${estado}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || `Error al cargar los pedidos con estado ${estado}`;
    throw new Error(errorMessage);
  }
};

/**
 * Actualiza el estado de un pedido
 * @param id ID del pedido a actualizar
 * @param estado Nuevo estado del pedido
 * @returns Promise con el pedido actualizado
 */
export const updateEstadoPedido = async (id: number, estado: string): Promise<Pedido> => {
  try {
    const response = await axios.patch<Pedido>(
      `${API_URL}/pedidos/${id}/estado`,
      { estado },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Error al actualizar el estado del pedido';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los pedidos de una mesa específica
 * @param numeroMesa Número de la mesa
 * @returns Promise con el array de pedidos de la mesa
 */
export const getPedidosByMesa = async (numeroMesa: number): Promise<Pedido[]> => {
  try {
    const response = await axios.get<Pedido[]>(`${API_URL}/pedidos/mesa/${numeroMesa}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || `Error al cargar los pedidos de la mesa ${numeroMesa}`;
    throw new Error(errorMessage);
  }
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Obtiene los pedidos del usuario actual
 * @returns Promise con el array de pedidos del usuario
 */
export const getMisPedidos = async (): Promise<Pedido[]> => {
  try {
    const response = await axios.get<ApiResponse<Pedido[]>>(`${API_URL}/pedidos/mis-pedidos?include=detalles,detalles.producto`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    
    // Verificar si hay datos en la respuesta
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Procesar cada pedido para asegurar la estructura correcta
      const pedidosProcesados = response.data.data.map(pedido => {
        // Si el pedido tiene detalles, convertirlos a productos
        let productos: any[] = [];
        
        if (Array.isArray(pedido.detalles) && pedido.detalles.length > 0) {
          productos = pedido.detalles.map(detalle => ({
            id_producto: detalle.id_producto || 0,
            id_detalle: detalle.id_detalle,
            id_detalle_pedido: detalle.id_detalle,
            nombre_producto: detalle.producto?.nombre_producto || 'Producto sin nombre',
            precio_producto: detalle.precio_unitario || 0,
            precio_unitario: detalle.precio_unitario || 0,
            cantidad: detalle.cantidad || 1,
            notas: detalle.notas || '',
            subtotal: detalle.subtotal || (Number(detalle.precio_unitario) || 0) * (detalle.cantidad || 1),
            id_grupo_pedido: detalle.id_grupo_pedido || pedido.id_grupo_pedido
          }));
        } else if (Array.isArray(pedido.productos)) {
          // Si no hay detalles pero sí productos, usar los productos directamente
          productos = pedido.productos;
        }
                  
        // Crear un nuevo objeto con la estructura esperada
        return {
          id_pedido: pedido.id_pedido,
          usuario_id: pedido.usuario_id || (pedido.usuario ? pedido.usuario.id_usuario : null),
          total_pedido: pedido.total_pedido,
          estado_pedido: pedido.estado_pedido,
          numero_mesa: pedido.numero_mesa,
          id_grupo_pedido: pedido.id_grupo_pedido,
          notas: pedido.notas || '',
          created_at: pedido.created_at,
          updated_at: pedido.updated_at,
          usuario: pedido.usuario || null,
          productos: productos
        };
      });
      
      return pedidosProcesados;
    } else {
      throw new Error('Formato de respuesta inesperado del servidor');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al cargar tus pedidos';
    throw new Error(errorMessage);
  }
};