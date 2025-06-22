import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
  IonBadge,
  IonLoading,
  IonAlert,
  IonToast
} from '@ionic/react';
import { arrowBack, cart, add } from 'ionicons/icons';
import DetalleProducto from './DetalleProducto';
import { productService, categoryService } from '../../services/api.service';
import { Producto } from '../../services/producto.service';
import { CarritoContext } from '../../context/CarritoContext';
import { API_URL, getProductImageUrl } from '../../config';

interface Category {
  id_categoria: number;
  nombre_categoria: string;
  descripcion_categoria: string;
}

const Products: React.FC = () => {
  const history = useHistory();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [nombreCategoria, setNombreCategoria] = useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const { carrito, setCarrito } = useContext(CarritoContext);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Obtener el ID de la categoría desde el parámetro de la URL
  const categoriaIdNum = parseInt(categoryId, 10);

  // Obtener el nombre de la categoría
  useEffect(() => {
    const obtenerNombreCategoria = async () => {
      try {
        const categorias = await categoryService.getCategories();
        const categoria = categorias.find((cat: Category) => cat.id_categoria === categoriaIdNum);
        if (categoria) {
          setNombreCategoria(categoria.nombre_categoria);
        }
      } catch (error) {
        console.error('Error al obtener la categoría:', error);
      }
    };
    
    obtenerNombreCategoria();
  }, [categoriaIdNum]);

  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (categoryId) {
        response = await productService.getProductsByCategory(parseInt(categoryId));
      } else {
        response = await productService.getProducts();
      }
      
      console.log('Productos recibidos:', response);
      setProducts(response);
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError('Error al cargar los productos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  if (isLoading) {
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
          <IonLoading isOpen={isLoading} message="Cargando productos..." />
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError('')}
            header="Error"
            message={error}
            buttons={['OK']}
          />
          <div className="text-center py-12">
            <IonLabel color="medium">Cargando productos...</IonLabel>
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
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/carrito')}>
              <IonIcon icon={cart} />
            </IonButton>
          </IonButtons>
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
          {products.length === 0 ? (
            <div className="text-center py-12">
              <IonLabel color="medium" className="text-white">No hay productos disponibles en esta categoría</IonLabel>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {products.map((product) => {
                const imageUrl = getProductImageUrl(product.imagen_url);
                
                console.log(`Producto ${product.nombre_producto}:`, {
                  imagen_url: product.imagen_url,
                  imageUrl: imageUrl
                });

                return (
                  <IonCard
                    key={product.id_producto}
                    className="m-0 h-full rounded-3xl relative overflow-hidden transform transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    style={{
                      '--background': 'transparent',
                      '--ion-card-background': 'transparent',
                      'background': 'radial-gradient(ellipse at top left, rgba(38, 43, 51, 0.95) 0%, rgba(38, 43, 51, 0.8) 40%, rgba(38, 43, 51, 0.4) 70%, rgba(12, 15, 20, 0) 100%)',
                      'boxShadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    } as React.CSSProperties}
                    onClick={() => setProductoSeleccionado(product)}
                  >
                    <div className="w-full h-48 overflow-hidden rounded-2xl">
                      <img
                        src={imageUrl}
                        alt={product.nombre_producto}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://ionicframework.com/docs/img/demos/card-media.png';
                        }}
                      />
                    </div>
                    <IonCardHeader className="p-4">
                      <IonCardTitle className="text-2xl text-gray-300">
                        {product.nombre_producto}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="ion-padding flex justify-between items-center">
                      <p className="flex items-baseline">
                        <span className="text-2xl text-primary-50">$</span>
                        <span className="text-2xl ml-1 font-bold text-white">{Number(product.precio_producto).toFixed(2)}</span>
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductoSeleccionado(product);
                        }}
                        disabled={!product.estado_producto || product.stock_producto <= 0}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          (!product.estado_producto || product.stock_producto <= 0) 
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : 'bg-primary-50 hover:bg-primary-600'
                        }`}
                      >
                        {product.estado_producto && product.stock_producto > 0 ? (
                          <IonIcon icon={add} className="text-white text-xl" />
                        ) : product.stock_producto <= 0 ? (
                          <span className="text-xs text-white">Sin stock</span>
                        ) : (
                          <span className="text-xs text-white">No disp.</span>
                        )}
                      </button>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Products;