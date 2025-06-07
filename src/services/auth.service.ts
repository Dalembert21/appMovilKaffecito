import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // URL base de la API con el prefijo /api

// Configuración global de axios para incluir credenciales en las peticiones
axios.defaults.withCredentials = true;

interface LoginResponse {
  access_token: string;
  // Agrega aquí otros campos que devuelva tu API
}

export const login = async (cedula_usuario: string, password_usuario: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      cedula_usuario,
      password_usuario
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      // Opcional: Configurar axios para incluir el token en las peticiones futuras
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      return response.data;
    }
    
    throw new Error('No se recibió un token de acceso');
  } catch (error: any) {
    console.error('Error en el login:', error);
    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Intente nuevamente.';
    throw new Error(errorMessage);
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

// Función para cerrar sesión
export const logout = (): void => {
  localStorage.removeItem('access_token');
  delete axios.defaults.headers.common['Authorization'];
};

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};
