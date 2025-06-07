import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface DetallePedido {
  id_detalle_pedido: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDetallePedidoDto {
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}
/**
 * Crea un nuevo detalle de pedido
 * @param detallePedido Datos del detalle de pedido a crear
 * @returns Promise con el detalle de pedido creado
 */
export const createDetallePedido = async (detallePedido: CreateDetallePedidoDto): Promise<DetallePedido> => {
  try {
    const response = await axios.post<DetallePedido>(
      `${API_URL}/detalle-pedido`, 
      detallePedido,
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
    console.error('Error al crear el detalle del pedido:', error);
    const errorMessage = error.response?.data?.message || 'Error al crear el detalle del pedido';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los detalles de un pedido por su ID
 * @param pedidoId ID del pedido
 * @returns Promise con el array de detalles de pedido
 */
export const getDetallesByPedidoId = async (pedidoId: number): Promise<DetallePedido[]> => {
  try {
    const response = await axios.get<DetallePedido[]>(
      `${API_URL}/pedidos/${pedidoId}/detalles`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener los detalles del pedido:', error);
    const errorMessage = error.response?.data?.message || 'Error al obtener los detalles del pedido';
    throw new Error(errorMessage);
  }
};