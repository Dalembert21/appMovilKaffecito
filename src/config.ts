// Configuración de la aplicación
export const API_URL = 'http://localhost:3000'; // Ajusta según tu configuración

// Funciones helper para manejar URLs de imágenes
export const getProductImageUrl = (imagenUrl?: string): string => {
  if (!imagenUrl) {
    return 'https://ionicframework.com/docs/img/demos/card-media.png';
  }
  return `${API_URL}/uploads/productos/${imagenUrl}`;
};

export const getCategoryImageUrl = (imagenUrl?: string): string => {
  if (!imagenUrl) {
    return 'https://www.recetasnestle.com.ec/sites/default/files/2021-12/tazas-con-tipos-de-cafe_1.jpg';
  }
  return `${API_URL}/uploads/categorias/${imagenUrl}`;
};
