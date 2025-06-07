import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  descripcion_producto: string;
  precio_producto: number;
  categoria_id: number;
  stock_producto: number;
  estado_producto: boolean;
  imagen_url?: string;
  notas?: string;
}

/**
 * Obtiene todos los productos
 * @returns Promise con el array de productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  try {
    const response = await axios.get<Producto[]>(`${API_URL}/productos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener los productos:', error);
    const errorMessage = error.response?.data?.message || 'Error al cargar los productos';
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene un producto por su ID
 * @param id ID del producto a buscar
 * @returns Promise con el producto encontrado
 */
export const getProductoById = async (id: number): Promise<Producto> => {
  try {
    const response = await axios.get<Producto>(`${API_URL}/productos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener el producto con ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || `Error al cargar el producto con ID ${id}`;
    throw new Error(errorMessage);
  }
};

/**
 * Obtiene los productos por categoría
 * @param categoriaId ID de la categoría
 * @returns Promise con el array de productos de la categoría
 */
export const getProductosByCategoria = async (categoriaId: number): Promise<Producto[]> => {
  try {
    const response = await axios.get<Producto[]>(`${API_URL}/productos/categoria/${categoriaId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener los productos por categoría:', error);
    const errorMessage = error.response?.data?.message || 'Error al cargar los productos de la categoría';
    throw new Error(errorMessage);
  }
};

/**
 * Crea un nuevo producto
 * @param producto Datos del producto a crear
 * @returns Promise con el producto creado
 */
export const createProducto = async (producto: Omit<Producto, 'id_producto'>, imagen?: File): Promise<Producto> => {
  try {
    const formData = new FormData();
    
    // Agregar campos del producto al formData
    Object.entries(producto).forEach(([key, value]) => {
      // Convertir cualquier valor a string antes de agregarlo al formData
      formData.append(key, String(value));
    });
    
    // Si hay una imagen, agregarla al formData
    if (imagen) {
      formData.append('imagen_url', imagen);
    }

    const response = await axios.post<Producto>(`${API_URL}/productos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error al crear el producto:', error);
    const errorMessage = error.response?.data?.message || 'Error al crear el producto';
    throw new Error(errorMessage);
  }
};

/**
 * Actualiza un producto existente
 * @param id ID del producto a actualizar
 * @param producto Datos actualizados del producto
 * @returns Promise con el producto actualizado
 */
export const updateProducto = async (id: number, producto: Partial<Producto>, imagen?: File): Promise<Producto> => {
  try {
    const formData = new FormData();
    
    // Agregar campos del producto al formData
    Object.entries(producto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convertir cualquier valor a string antes de agregarlo al formData
        formData.append(key, String(value));
      }
    });
    
    // Si hay una imagen, agregarla al formData
    if (imagen) {
      formData.append('imagen_url', imagen);
    }

    const response = await axios.put<Producto>(`${API_URL}/productos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error al actualizar el producto con ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || `Error al actualizar el producto`;
    throw new Error(errorMessage);
  }
};

/**
 * Elimina un producto
 * @param id ID del producto a eliminar
 * @returns Promise con el resultado de la operación
 */
export const deleteProducto = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/productos/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      withCredentials: true
    });
  } catch (error: any) {
    console.error(`Error al eliminar el producto con ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || `Error al eliminar el producto`;
    throw new Error(errorMessage);
  }
};