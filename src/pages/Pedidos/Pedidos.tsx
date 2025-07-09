import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonSpinner,
    useIonToast,
    useIonLoading,
    IonMenu,
    IonList,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonButtons,
    useIonViewWillEnter,
    IonButton,
    IonText,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import { timeOutline, restaurantOutline, checkmarkDone, closeCircle, home, cart, logOut, arrowBack, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { menu } from 'ionicons/icons';
import { Pedido, pedidoService } from '../../services/api.service';
import { logout } from '../../services/auth.service';
import { useHistory } from 'react-router-dom';

const formatPrecio = (precio: any) => {
    const num = Number(precio);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

const Pedidos: React.FC = () => {
    const history = useHistory();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [segment, setSegment] = useState('todos');
    const [present] = useIonToast();
    const [presentLoading, dismissLoading] = useIonLoading();
    const [activePath, setActivePath] = useState(window.location.pathname);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unlisten = history.listen((location) => {
            setActivePath(location.pathname);
        });
        return () => unlisten();
    }, [history]);

    useIonViewWillEnter(() => {
        cargarPedidos();
    });

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            const data = await pedidoService.obtenerTodos();
            // Filtrar por estado si no es "todos"
            const pedidosFiltrados = segment === 'todos'
                ? data
                : data.filter((pedido: Pedido) => pedido.estado_pedido === segment);

            // Ordenar los pedidos: pendientes primero, luego por fecha descendente
            const pedidosOrdenados = pedidosFiltrados.sort((a, b) => {
                if (a.estado_pedido === 'pendiente' && b.estado_pedido !== 'pendiente') return -1;
                if (a.estado_pedido !== 'pendiente' && b.estado_pedido === 'pendiente') return 1;
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
            setPedidos(pedidosOrdenados);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            setError('No se pudieron cargar los pedidos. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, [segment]);

    const navigateTo = async (path: string) => {
        const menuEl = await document.querySelector('ion-menu');
        if (menuEl) {
            await menuEl.close();
        }
        history.push(path);
        setActivePath(path);
    };

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleActualizarEstado = async (id: number, nuevoEstado: string) => {
        try {
            await presentLoading('Actualizando estado...');
            await pedidoService.actualizarEstado(id, nuevoEstado);
            await cargarPedidos();

            present({
                message: 'Estado actualizado correctamente',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
        } catch (error) {
            present({
                message: 'Error al actualizar el estado',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        } finally {
            await dismissLoading();
        }
    };

    const formatFecha = (fecha?: string) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoBadgeColor = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'en_proceso':
                return 'bg-blue-100 text-blue-800';
            case 'completado':
                return 'bg-green-100 text-green-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getEstadoTexto = (estado: string) => {
        const estados: { [key: string]: string } = {
            pendiente: 'Pendiente',
            en_proceso: 'En preparación',
            completado: 'Completado',
            cancelado: 'Cancelado'
        };
        return estados[estado?.toLowerCase()] || estado;
    };

    return (
        <>
            <IonMenu contentId="main-content" type="overlay" className="bg-primary-900">
                <IonContent className="ion-padding bg-primary-900 h-full">
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-white">Menú</h2>
                            <p className="text-gray-400">Bienvenido a Kaffecito</p>
                        </div>
                        <IonList lines="none" className="flex-1">
                            <IonItem
                                button
                                className={`${activePath === '/home' ? 'bg-gray-800' : ''} --background:transparent hover:bg-gray-800 rounded-lg m-2`}
                                onClick={() => navigateTo('/home')}
                            >
                                <IonIcon slot="start" icon={home} className="text-white text-xl mr-4" />
                                <IonLabel className="text-white">Inicio</IonLabel>
                            </IonItem>
                            <IonItem
                                button
                                className={`${activePath.startsWith('/pedidos') ? 'bg-gray-800' : ''} --background:transparent hover:bg-gray-800 rounded-lg m-2`}
                                onClick={() => navigateTo('/pedidos')}
                            >
                                <IonIcon slot="start" icon={restaurantOutline} className="text-white text-xl mr-4" />
                                <IonLabel className="text-white">Pedidos</IonLabel>
                            </IonItem>
                            <IonItem
                                button
                                className={`${activePath === '/carrito' ? 'bg-gray-800' : ''} --background:transparent hover:bg-gray-800 rounded-lg m-2`}
                                onClick={() => navigateTo('/carrito')}
                            >
                                <IonIcon slot="start" icon={cart} className="text-white text-xl mr-4" />
                                <IonLabel className="text-white">Carrito</IonLabel>
                            </IonItem>
                        </IonList>
                        <div className="p-4 border-t border-gray-700">
                            <IonItem
                                button
                                className="--background:transparent hover:bg-red-900/30 rounded-lg"
                                lines="none"
                                onClick={handleLogout}
                            >
                                <IonIcon slot="start" icon={logOut} className="text-red-400 text-xl mr-4" />
                                <IonLabel className="text-red-400">Cerrar sesión</IonLabel>
                            </IonItem>
                        </div>
                    </div>
                </IonContent>
            </IonMenu>

            <IonPage id="main-content" className="bg-gray-50">
                <IonHeader className="bg-white shadow-sm">
                    <IonToolbar className="px-2 bg-primary-100"
                        style={{
                            '--background': '#0c0f14',
                        } as React.CSSProperties}>
                        <IonButtons slot="start">
                            <IonMenuButton autoHide={false}>
                                <IonIcon slot="icon-only" icon={menu} className="text-white text-2xl" />
                            </IonMenuButton>
                        </IonButtons>
                        <div className="font-bold text-white ml-2" style={{ flex: 1, textAlign: 'left' }}>
                          Pedidos
                        </div>
                        <IonButtons slot="end">
                            <IonButton onClick={() => history.push('/carrito')}>
                                <IonIcon icon={cart} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                    <IonToolbar className="px-4 py-3"
                        style={{
                            '--background': '#0c0f14',
                        } as React.CSSProperties}>
                        <div className="w-full flex flex-col gap-2 items-center justify-center">
                            <div className="w-full flex gap-2 justify-center">
                                {[
                                    { value: 'todos', label: 'Todos' },
                                    { value: 'pendiente', label: 'Pendientes' },
                                    { value: 'en_proceso', label: 'En proceso' }
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setSegment(value)}
                                        className={`
                                            flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                            whitespace-nowrap overflow-hidden text-ellipsis
                                            ${segment === value
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'text-gray-300 hover:text-white bg-gray-500/30 border border-gray-500/50'
                                            }
                                            hover:shadow-md active:scale-95
                                        `}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="w-full flex gap-2 justify-center">
                                {[
                                    { value: 'completado', label: 'Completados' },
                                    { value: 'cancelado', label: 'Cancelados' }
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setSegment(value)}
                                        className={`
                                            flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                            whitespace-nowrap overflow-hidden text-ellipsis
                                            ${segment === value
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'text-gray-300 hover:text-white bg-gray-500/30 border border-gray-500/50'
                                            }
                                            hover:shadow-md active:scale-95
                                        `}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding bg-primary-100"
                    style={{
                        '--background': '#0c0f14',
                        '--ion-background-color': '#0c0f14',
                        '--padding-start': '1rem',
                        '--padding-end': '1rem',
                        '--padding-top': '1rem',
                        '--padding-bottom': '1rem'
                    } as React.CSSProperties}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <IonSpinner name="crescent" className="w-12 h-12 text-primary-500" />
                            <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                        </div>
                    ) : pedidos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <IonIcon
                                icon={restaurantOutline}
                                className="w-16 h-16 text-gray-300 mb-4"
                            />
                            <h3 className="text-lg font-medium text-gray-700">No hay pedidos</h3>
                            <p className="text-gray-500 mt-1">
                                {segment !== 'todos'
                                    ? `No se encontraron pedidos en estado ${getEstadoTexto(segment)}`
                                    : 'Aún no has realizado ningún pedido'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pedidos.map((pedido) => (
                                <div key={pedido.id_pedido} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center text-sm text-gray-400 mb-1">
                                                <IonIcon icon={timeOutline} className="mr-2 text-gray-400" />
                                                {formatFecha(pedido.created_at)}
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {`Pedido #${pedido.id_pedido}`}
                                            </h3>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadgeColor(pedido.estado_pedido)}`}
                                        >
                                            {getEstadoTexto(pedido.estado_pedido)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {pedido.usuario && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Camarero:</span>
                                                <span className="text-gray-300">
                                                    {pedido.usuario.nombre_usuario} {pedido.usuario.apellido_usuario}
                                                </span>
                                            </div>
                                        )}

                                        <div className="space-y-2 mt-3">
                                            <p className="text-sm font-medium text-gray-300">
                                                Productos ({pedido.detalles_pedido?.length || 0}):
                                            </p>

                                            {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                                                <div className="space-y-2">
                                                    {pedido.detalles_pedido.map((detalle, idx) => (
                                                        <div key={detalle.id_detalle}
                                                            className="pl-3 border-l-2 border-white/20">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm font-medium text-white">
                                                                    {detalle.producto?.nombre_producto || 'Producto sin nombre'}
                                                                </span>
                                                                <span className="text-sm text-gray-300">
                                                                    x{detalle.cantidad_producto || 1}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm text-gray-400">
                                                                <span>${formatPrecio(detalle.precio_unitario_producto || 0)} c/u</span>
                                                                <span>
                                                                    ${formatPrecio((Number(detalle.precio_unitario_producto) || 0) * (detalle.cantidad_producto || 1))}
                                                                </span>
                                                            </div>
                                                            {detalle.nota_producto && (
                                                                <p className="text-xs text-gray-400 italic mt-1">
                                                                    Nota: {detalle.nota_producto}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No hay productos en este pedido</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-400">
                                                Total del pedido:
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                ${formatPrecio(pedido.total_pedido)}
                                            </div>
                                        </div>

                                        {(pedido.estado_pedido === 'pendiente' || pedido.estado_pedido === 'en_proceso') && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <div className="flex justify-end space-x-2">
                                                    {pedido.estado_pedido === 'pendiente' && (
                                                        <button
                                                            onClick={() => handleActualizarEstado(pedido.id_pedido, 'en_proceso')}
                                                            className="px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                                        >
                                                            En proceso
                                                        </button>
                                                    )}
                                                    {pedido.estado_pedido === 'en_proceso' && (
                                                        <button
                                                            onClick={() => handleActualizarEstado(pedido.id_pedido, 'completado')}
                                                            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Completar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleActualizarEstado(pedido.id_pedido, 'cancelado')}
                                                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </IonContent>
            </IonPage>
        </>
    );
};

export default Pedidos;
