import axios from 'axios';

// Configuración global de axios para incluir el token de autenticación
axios.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('access_token');
    
    // Si el token existe, agregarlo al encabezado de autorización
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Asegurarse de que las credenciales se envíen con cada solicitud
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Manejo de respuestas no autorizadas (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si recibimos un 401, el token puede haber expirado o ser inválido
      // Podríamos redirigir al usuario a la página de login aquí
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
