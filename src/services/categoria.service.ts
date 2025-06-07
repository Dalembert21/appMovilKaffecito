import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion_categoria: string;
  img?: string;
}

/**
 * Obtiene todas las categorías desde el servidor
 * @returns Promise con el array de categorías
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await axios.get<Categoria[]>(`${API_URL}/categorias`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });

    return response.data;
  } catch (error: any) {
    console.error('Error al obtener las categorías:', error);
    const errorMessage = error.response?.data?.message || 'Error al cargar las categorías';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene una categoría por su ID
 * @param id ID de la categoría a buscar
 * @returns Promise con la categoría encontrada
 */
export const getCategoriaById = async (id: number): Promise<Categoria> => {
  try {
    const response = await axios.get<Categoria>(`${API_URL}/categorias/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });

    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener la categoría con ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || `Error al cargar la categoría con ID ${id}`;
    throw new Error(errorMessage);
  }
};
