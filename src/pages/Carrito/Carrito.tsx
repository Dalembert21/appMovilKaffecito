import React, { useContext, useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonInput, IonToast, IonImg, IonFooter, IonText, IonButtons
} from '@ionic/react';
import { cart, trash, remove, add, arrowBack } from 'ionicons/icons';
import { CarritoContext } from '../../context/CarritoContext';
import { customOrderService } from '../../services/api.service';
import { useHistory } from 'react-router-dom';
import { API_URL, getProductImageUrl } from '../../config';

const Carrito: React.FC = () => {
  const { carrito, setCarrito, limpiarCarrito } = useContext(CarritoContext);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleCantidad = (index: number, delta: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad += delta;
    if (nuevoCarrito[index].cantidad < 1) nuevoCarrito[index].cantidad = 1;
    setCarrito(nuevoCarrito);
  };

  const handleEliminar = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const total = carrito.reduce((acc, item) => acc + (Number(item.producto.precio_producto) * item.cantidad), 0);

  const handleConfirmarPedido = async () => {
    if (carrito.length === 0) {
      setToastMsg('El carrito está vacío');
      setShowToast(true);
      return;
    }

    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('Usuario del localStorage:', user);
      
      if (!user.id) {
        setToastMsg('Usuario no autenticado');
        setShowToast(true);
        setIsLoading(false);
        return;
      }

      // Validar el carrito antes de proceder
      const validation = customOrderService.validateCart(carrito);
      if (!validation.isValid) {
        setToastMsg(`Errores de validación: ${validation.errors.join(', ')}`);
        setShowToast(true);
        setIsLoading(false);
        return;
      }

      // Usar el servicio personalizado con validación mejorada
      const pedido = await customOrderService.createOrderWithValidation(carrito, Number(user.id));

      console.log('Pedido creado exitosamente:', pedido);

      // Limpiar el carrito después de crear el pedido exitosamente
      limpiarCarrito();
      setToastMsg('¡Pedido confirmado exitosamente!');
      setShowToast(true);
      
      // Redirigir a home después de un breve delay
      setTimeout(() => {
        history.push('/home');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error al confirmar pedido:', error);
      setToastMsg(error.message || 'Error al confirmar el pedido');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{'--background': '#000000', color: 'white'}}>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} style={{color: 'white'}}/>
            </IonButton>
          </IonButtons>
          <IonTitle className="ion-text-center">Carrito</IonTitle>
          <IonButtons slot="end">
             <div style={{width: '40px'}}></div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#0c0f14' } as React.CSSProperties}>
        {carrito.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <IonIcon icon={cart} style={{ fontSize: 64, color: '#d17842' }} />
            <p className="text-lg text-gray-400 mt-4">El carrito está vacío</p>
          </div>
        ) : (
          <IonList>
            {carrito.map((item, idx) => (
              <IonItem key={idx} className="rounded-2xl my-3 shadow-lg bg-white/10 backdrop-blur-lg">
                <IonImg
                  src={getProductImageUrl(item.producto.imagen_url)}
                  style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', marginRight: 16 }}
                  alt={item.producto.nombre_producto}
                />
                <IonLabel className="flex-1">
                  <div className="font-bold text-white">{item.producto.nombre_producto}</div>
                  <div className="text-primary-50 font-bold">${Number(item.producto.precio_producto).toFixed(2)}</div>
                  {item.notas && (
                    <div className="text-sm text-gray-300 mt-1">
                      <IonText color="medium">Nota: {item.notas}</IonText>
                    </div>
                  )}
                </IonLabel>
                <div className="flex items-center space-x-2">
                  <IonButton size="small" onClick={() => handleCantidad(idx, -1)} fill="clear">
                    <IonIcon icon={remove} />
                  </IonButton>
                  <IonInput
                    value={item.cantidad}
                    readonly
                    style={{ width: 32, textAlign: 'center', color: 'white', fontWeight: 'bold' }}
                  />
                  <IonButton size="small" onClick={() => handleCantidad(idx, 1)} fill="clear">
                    <IonIcon icon={add} />
                  </IonButton>
                </div>
                <IonButton color="danger" size="small" onClick={() => handleEliminar(idx)} fill="clear">
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
      {carrito.length > 0 && (
        <IonFooter className="ion-no-border" style={{ background: '#0c0f14' }}>
          <div className="flex flex-col items-center py-4">
            <div className="text-xl text-white font-bold mb-2">
              Total: <span className="text-primary-50">${total.toFixed(2)}</span>
            </div>
            <IonButton 
              expand="block" 
              className="w-11/12" 
              onClick={handleConfirmarPedido}
              disabled={isLoading}
              style={{ '--background': '#d17842', '--border-radius': '20px' } as React.CSSProperties}
            >
              <IonIcon icon={cart} slot="start" />
              {isLoading ? 'Generando pedido...' : 'Generar pedido'}
            </IonButton>
          </div>
        </IonFooter>
      )}
      <IonToast 
        isOpen={showToast} 
        message={toastMsg} 
        duration={2000} 
        onDidDismiss={() => setShowToast(false)} 
      />
    </IonPage>
  );
};

export default Carrito; 