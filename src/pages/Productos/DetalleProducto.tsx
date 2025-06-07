import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
  useIonLoading,
  useIonToast
} from '@ionic/react';
import axios from 'axios';
import { arrowBack, add, remove } from 'ionicons/icons';
import { Producto } from '../../services/producto.service';
import { createPedido, CreatePedidoDto } from '../../services/pedido.service';
import { createDetallePedido } from '../../services/detalle-pedido.service';
import { useHistory } from 'react-router-dom';


interface DetalleProductoProps {
  producto: Producto | null;
  onClose: () => void;
  onAddToCart: (producto: Producto, cantidad: number, notas: string) => void;
  numeroMesa?: number | null;
}

const DetalleProducto: React.FC<DetalleProductoProps> = ({ producto, onClose, onAddToCart }) => {
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');
  const [numeroMesa, setNumeroMesa] = useState<number | null>(null);
  const [present] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
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

  const buscarPedidoPendiente = async (mesa: number) => {
    try {
      console.log(`Buscando pedido pendiente para mesa: ${mesa}`);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No se encontró el token de autenticación');
        return null;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          estado: 'pendiente',
          mesa: mesa
        }
      });
      
      console.log('Respuesta de la API:', response.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.success && response.data.data) {
        // Tomar el primer pedido de la lista (el más reciente)
        let pedido = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
        
        // Si no hay pedidos para esta mesa, devolver null
        if (!pedido) return null;
        
        console.log('Pedido encontrado:', pedido);
        
        // Asegurarse de que el pedido tenga un ID de grupo
        if (!pedido.id_grupo_pedido) {
          console.log('El pedido no tiene ID de grupo, asignando uno...');
          // Si el pedido no tiene grupo, usar su ID como grupo
          pedido.id_grupo_pedido = `GRP_${pedido.id_pedido}`;
        }
        
        return pedido;
      }
      
      console.log('No se encontraron pedidos pendientes para esta mesa');
      return null;
    } catch (error) {
      console.error('Error buscando pedidos pendientes:', error);
      return null;
    }
  };

  const agregarProductoAPedidoExistente = async (pedidoId: number) => {
    try {
      console.log(`Agregando producto al pedido existente: ${pedidoId}`);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No se encontró el token de autenticación');
        throw new Error('No se encontró el token de autenticación');
      }
      
      // Verificar si el producto ya está en el pedido
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pedidos/${pedidoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const pedido = response.data;
      console.log('Detalles del pedido actual:', pedido);
      
      // Buscar si el producto ya está en el pedido
      const detalleExistente = pedido.detalles?.find(
        (d: any) => d.producto?.id_producto === producto.id_producto
      );
      
      if (detalleExistente) {
        // Si el producto ya está en el pedido, actualizar la cantidad
        console.log('Producto ya existe en el pedido, actualizando cantidad');
        const nuevaCantidad = detalleExistente.cantidad + cantidad;
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/detalle-pedido/${detalleExistente.id_detalle}`,
          {
            cantidad: nuevaCantidad,
            subtotal: detalleExistente.precio_unitario * nuevaCantidad,
            notas: notas || detalleExistente.notas
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Si el producto no está en el pedido, agregarlo
        console.log('Agregando nuevo producto al pedido');
        await axios.post(
          `${import.meta.env.VITE_API_URL}/detalle-pedido`,
          {
            id_pedido: pedidoId,
            id_producto: producto.id_producto,
            cantidad: cantidad,
            precio_unitario: producto.precio_producto,
            subtotal: producto.precio_producto * cantidad,
            notas: notas
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Actualizar el total del pedido
      console.log('Actualizando total del pedido');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/pedidos/${pedidoId}/actualizar-total`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Producto agregado al pedido exitosamente');
      return true;
    } catch (error) {
      console.error('Error agregando producto a pedido existente:', error);
      throw error;
    }
  };

  const handleAddToCart = async () => {
    if (numeroMesa === null) {
      present({
        message: 'Por favor ingrese el número de mesa',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      return;
    }

    try {
      await presentLoading('Procesando pedido...');

      // Obtener el token del localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        present({
          message: 'Debes iniciar sesión para realizar pedidos',
          duration: 2000,
          position: 'bottom',
          color: 'warning'
        });
        return;
      }

      // Verificar si hay un pedido pendiente para esta mesa
      const pedidoExistente = await buscarPedidoPendiente(numeroMesa);
      
      if (pedidoExistente) {
        // Agregar producto al pedido existente usando el ID del grupo
        await agregarProductoAPedidoExistente(pedidoExistente.id_pedido);
        present({
          message: 'Producto agregado al pedido existente',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
      } else {
        // Buscar si hay algún pedido con el mismo grupo (por si acaso)
        let idGrupoPedido = null;
        
        // Si hay un pedido existente para esta mesa, usar su grupo
        if (pedidoExistente) {
          idGrupoPedido = pedidoExistente.id_grupo_pedido;
        }
        
        // Crear un nuevo pedido
        const totalPedido = producto.precio_producto * cantidad;
        const nuevoPedido = {
          usuario_id: parseInt(localStorage.getItem('userId') || '0'),
          total_pedido: totalPedido,
          estado_pedido: 'pendiente',
          numero_mesa: numeroMesa,
          id_grupo_pedido: idGrupoPedido, // Incluir el ID de grupo si existe
          productos: [{
            id_producto: producto.id_producto,
            cantidad: cantidad,
            notas: notas
          }]
        };

        const pedidoCreado = await createPedido(nuevoPedido);
        
        // Si no teníamos un grupo, actualizar el pedido con su propio ID de grupo
        if (!idGrupoPedido && pedidoCreado?.id_grupo_pedido) {
          idGrupoPedido = pedidoCreado.id_grupo_pedido;
        }
        
        present({
          message: idGrupoPedido ? 'Producto agregado al pedido' : 'Nuevo pedido creado',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
      }

      // Llamar a la función del carrito
      onAddToCart(producto, cantidad, notas);
      
      // Mostrar mensaje de éxito
      present({
        message: 'Producto agregado correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success',
        cssClass: 'custom-toast',
        buttons: [{
          icon: 'close',
          role: 'cancel'
        }]
      });

      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: unknown) {
      console.error('Error al agregar el pedido:', error);

      // Manejar redirección a login si no hay token
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      if (errorMessage.includes('No se encontró el token')) {
        history.push('/login');
        return;
      }

      present({
        message: errorMessage || 'Error al procesar el pedido. Por favor, intente nuevamente.',
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
                src={producto.imagen_url || 'https://ionicframework.com/docs/img/demos/card-media.png'}
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

                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <IonText className="text-base mb-2 text-gray-400 block">
                      Mesa
                    </IonText>
                    <input
                      type="number"
                      value={numeroMesa ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNumeroMesa(value === '' ? null : Number(value));
                      }}
                      placeholder="N° mesa"
                      className="w-full p-2 bg-gray-800 text-white rounded-xl placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-white"
                    />

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
