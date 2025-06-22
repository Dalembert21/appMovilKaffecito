import React, { useState, useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
  useIonLoading,
  useIonToast
} from '@ionic/react';
import { arrowBack, add, remove } from 'ionicons/icons';
import { Producto } from '../../services/producto.service';
import { CarritoContext } from '../../context/CarritoContext';
import { useHistory } from 'react-router-dom';
import { API_URL, getProductImageUrl } from '../../config';

interface DetalleProductoProps {
  producto: Producto | null;
  onClose: () => void;
}

const DetalleProducto: React.FC<DetalleProductoProps> = ({ producto, onClose }) => {
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');
  const [present] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const { carrito, setCarrito } = useContext(CarritoContext);
  const history = useHistory();

  if (!producto) return null;

  const aumentarCantidad = () => {
    setCantidad(cantidad + 1);
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      await presentLoading('Agregando al carrito...');
      
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = carrito.findIndex(item => item.producto.id_producto === producto.id_producto);
      
      let nuevoCarrito;
      if (existingItemIndex >= 0) {
        // Si ya existe, actualizar cantidad
        nuevoCarrito = [...carrito];
        nuevoCarrito[existingItemIndex].cantidad += cantidad;
        if (notas) {
          nuevoCarrito[existingItemIndex].notas = notas;
        }
      } else {
        // Si no existe, agregar nuevo item
        nuevoCarrito = [...carrito, {
          producto,
          cantidad,
          notas
        }];
      }
      
      setCarrito(nuevoCarrito);
      
      present({
        message: 'Producto agregado al carrito correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success',
        cssClass: 'custom-toast',
        buttons: [{ icon: 'close', role: 'cancel' }]
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      present({
        message: errorMessage || 'Error al agregar al carrito. Por favor, intente nuevamente.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      await dismissLoading();
    }
  };

  return (
    <IonPage>
      <IonContent
        className="ion-no-padding"
        style={{
          '--background': '#0c0f14',
          '--ion-background-color': '#0c0f14'
        } as React.CSSProperties}
      >
        <div className="pb-24">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white"
            >
              <IonIcon icon={arrowBack} className="text-2xl" />
            </button>
          </div>

          <div className="relative w-full h-[38vh] overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={getProductImageUrl(producto.imagen_url)}
                alt={producto.nombre_producto}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://ionicframework.com/docs/img/demos/card-media.png';
                }}
              />
            </div>
          </div>

          {/* Sección fija inferior */}
          <div className="fixed bottom-0 left-0 right-0 p-4">
            <div className="py-3 bg-black/40 backdrop-blur-lg -mx-4 px-4">
              <h1 className="text-2xl font-bold text-white m-0">{producto.nombre_producto}</h1>
            </div>
            <div className="max-w-md mx-auto border-t border-gray-800">
              <h3 className="text-xl font-bold text-gray-400 mt-0.5">Descripción</h3>
              {producto.descripcion_producto && (
                <div className="mb-6">
                  <IonText color="light">
                    <p className="text-gray-200 text-base">{producto.descripcion_producto}</p>
                  </IonText>
                </div>
              )}

              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <IonText color="medium" className="mb-0">
                      <p className="text-sm text-gray-400">Precio</p>
                    </IonText>
                    <IonText color="light">
                      <h2 className="text-3xl font-bold mt-0">
                        <span className="text-primary-50 mr-1">$</span>
                        <span className="text-white">{Number(producto.precio_producto * cantidad).toFixed(2)}</span>
                      </h2>
                    </IonText>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <IonText color="light" className="text-xs mb-1 text-gray-400">
                        Cantidad
                      </IonText>
                      <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-3 py-1">
                        <button
                          onClick={disminuirCantidad}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
                        >
                          <IonIcon icon={remove} />
                        </button>
                        <span className="text-lg font-medium w-6 text-center text-white">
                          {cantidad}
                        </span>
                        <button
                          onClick={aumentarCantidad}
                          className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg"
                        >
                          <IonIcon icon={add} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <IonText className="block mb-2 text-base text-gray-400 font-medium">
                  Notas adicionales
                </IonText>
                <textarea
                  placeholder="Agregar notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-gray-800 text-white rounded-xl placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-white resize-none"
                />
              </div>

              <IonButton
                expand="block"
                className="h-11 flex items-center justify-center text-lg font-medium text-white"
                onClick={handleAddToCart}
                disabled={!producto.estado_producto || producto.stock_producto <= 0}
                style={{
                  '--border-radius': '20px',
                  '--background': '#d17842'
                } as React.CSSProperties}
              >
                Agregar pedido
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetalleProducto;
