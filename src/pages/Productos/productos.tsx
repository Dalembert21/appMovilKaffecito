import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { getProductosByCategoria, Producto as IProducto } from '../../services/producto.service';
import { getCategorias } from '../../services/categoria.service';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonBadge
} from '@ionic/react';
import { arrowBack, cart, add } from 'ionicons/icons';
import DetalleProducto from './DetalleProducto'; // Añadido el ícono 'add'

const Products: React.FC = () => {
  const history = useHistory();
  const { categoryId } = useParams<{ categoryId: string }>();
  // Cargar el carrito desde localStorage al inicio
  const [orderItems, setOrderItems] = useState<IProducto[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  
  // Guardar el carrito en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(orderItems));
    }
  }, [orderItems]);
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<IProducto | null>(null);

  // Obtener el ID de la categoría desde el parámetro de la URL
  const categoriaId = parseInt(categoryId, 10);

  // Obtener el nombre de la categoría
  useEffect(() => {
    const obtenerNombreCategoria = async () => {
      try {
        const categorias = await getCategorias();
        const categoria = categorias.find(cat => cat.id_categoria === categoriaId);
        if (categoria) {
          setNombreCategoria(categoria.nombre_categoria);
        }
      } catch (error) {
        console.error('Error al obtener la categoría:', error);
      }
    };
    
    obtenerNombreCategoria();
  }, [categoriaId]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const datos = await getProductosByCategoria(categoriaId);
        setProductos(datos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los productos');
        console.error('Error cargando productos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(categoriaId)) {
      cargarProductos();
    } else {
      setError('ID de categoría no válido');
      setLoading(false);
    }
  }, [categoriaId]);

  const handleAddToOrder = (producto: IProducto, cantidad: number = 1, notas: string = '') => {
    // Crear un array con el producto repetido según la cantidad
    const itemsParaAgregar = Array(cantidad).fill(0).map(() => ({
      ...producto,
      // Asegurarse de que las notas se guarden correctamente
      ...(notas && { notas }) // Solo agregar notas si existen
    }));
    const updatedCart = [...orderItems, ...itemsParaAgregar];
    setOrderItems(updatedCart);
  };

  const handleBack = () => {
    history.goBack();
  };

  if (loading) {
    return (       
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon slot="icon-only" icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Cargando...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="text-center py-12">
            <IonLabel color="medium">Cargando productos...</IonLabel>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon slot="icon-only" icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="text-center py-12">
            <IonLabel color="danger">{error}</IonLabel>
            <div className="mt-4">
              <IonButton onClick={handleBack}>Volver</IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (productoSeleccionado) {
    return (
      <DetalleProducto 
        producto={productoSeleccionado} 
        onClose={() => setProductoSeleccionado(null)}
        onAddToCart={handleAddToOrder}
      />
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar 
          style={{
            '--background': '#0c0f14',
            '--color': 'white',
            '--border-style': 'none'
          } as React.CSSProperties}
        >
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle className="text-white text-2xl">{nombreCategoria || 'Cargando...'}</IonTitle>
          {orderItems.length > 0 && (
            <IonButtons slot="end">
              <IonButton className="relative">
                <IonIcon icon={cart} />
                <IonBadge color="danger" className="absolute -top-1 -right-1">
                  {orderItems.length}
                </IonBadge>
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding-vertical px-6 md:px-12 lg:px-24"
        style={{
          '--background': '#0c0f14',
          '--ion-background-color': '#0c0f14',
          '--padding-start': '2rem',
          '--padding-end': '2rem',
        } as React.CSSProperties}
      >
        <div className="max-w-4xl mx-auto">
          {productos.length === 0 ? (
            <div className="text-center py-12">
              <IonLabel color="medium" className="text-white">No hay productos disponibles en esta categoría</IonLabel>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {productos.map((producto) => (
                <IonCard
                  key={producto.id_producto}
                  className="m-0 h-full p-4 rounded-3xl relative overflow-hidden transform transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{
                    '--background': 'transparent',
                    '--ion-card-background': 'transparent',
                    'background': 'radial-gradient(ellipse at top left, rgba(38, 43, 51, 0.95) 0%, rgba(38, 43, 51, 0.8) 40%, rgba(38, 43, 51, 0.4) 70%, rgba(12, 15, 20, 0) 100%)',
                    'boxShadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  } as React.CSSProperties}
                >
                  <div className="w-full h-48 overflow-hidden rounded-2xl">
                    <img 
                      src={producto.imagen_url || 'https://ionicframework.com/docs/img/demos/card-media.png'} 
                      alt={producto.nombre_producto}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://ionicframework.com/docs/img/demos/card-media.png';
                      }}
                    />
                  </div>
                  <IonCardHeader className="p-4">
                    <IonCardTitle className="text-2xl text-gray-300">
                      {producto.nombre_producto}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent className="ion-padding flex justify-between items-center">
                    <p className="flex items-baseline">
                      <span className="text-2xl text-primary-50">$</span>
                      <span className="text-2xl ml-1 font-bold text-white">{Number(producto.precio_producto).toFixed(2)}</span>
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductoSeleccionado(producto);
                      }}
                      disabled={!producto.estado_producto || producto.stock_producto <= 0}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        (!producto.estado_producto || producto.stock_producto <= 0) 
                          ? 'bg-gray-500 cursor-not-allowed' 
                          : 'bg-primary-50 hover:bg-primary-600'
                      }`}
                    >
                      {producto.estado_producto && producto.stock_producto > 0 ? (
                        <IonIcon icon={add} className="text-white text-xl" />
                      ) : producto.stock_producto <= 0 ? (
                        <span className="text-xs text-white">Sin stock</span>
                      ) : (
                        <span className="text-xs text-white">No disp.</span>
                      )}
                    </button>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Products;