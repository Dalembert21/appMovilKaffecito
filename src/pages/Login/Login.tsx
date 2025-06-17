import React, { useState } from 'react';
import { IonContent, IonPage, IonLoading, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { login } from '../../services/auth.service';

interface LoginProps {
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [cedula_usuario, setCedula] = useState('');
  const [password_usuario, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Limpiar espacios en blanco
      const cedula = cedula_usuario.trim();
      const password = password_usuario.trim();

      if (!cedula || !password) {
        throw new Error('Por favor ingrese su cédula y contraseña');
      }

      console.log('Intentando login con:', { cedula, password });
      const response = await login(cedula, password);
      console.log('Respuesta del login:', response);

      if (response?.access_token) {
        // Guardar el token y notificar el inicio de sesión exitoso
        localStorage.setItem('access_token', response.access_token);
        if (onLogin) {
          onLogin();
        }
        history.push('/home');
      } else {
        throw new Error('No se recibió un token de acceso');
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Error al iniciar sesión. Por favor, intente nuevamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(e);
  };

  return (
    <IonContent className="ion-padding">
      <IonLoading isOpen={isLoading} message="Iniciando sesión..." />
      <IonAlert
        isOpen={!!error}
        onDidDismiss={() => setError('')}
        header="Error de autenticación"
        message={error}
        buttons={['OK']}
      />
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: 'url(/fondo-login.avif)' }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white text-shadow-lg">Kaffecito</h1>
        </div>
        <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
            <p className="mt-2 text-white/80 text-lg">Ingresa tus credenciales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cedula" className="block text-sm font-bold text-white/90">
                Cédula
              </label>
              <input
                id="cedula"
                type="text"
                value={cedula_usuario}
                onChange={(e) => setCedula(e.target.value)}
                className="mt-1 w-full px-4 py-3 bg-white/20 text-white placeholder-white/50 rounded-lg border border-white/30 focus:border-transparent transition"
                placeholder="Ingrese su cédula"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white/90">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password_usuario}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 bg-white/20 text-white placeholder-white/50 rounded-lg border border-white/30 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center">
              <div className="text-sm">
                <a href="#" className="font-medium text-white transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition transform hover:-translate-y-0.5"
              >
                Iniciar sesión
              </button>
            </div>
          </form>


        </div>
      </div>
    </IonContent>
  );
};

export default Login;
