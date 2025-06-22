import React, { createContext, useState } from 'react';
import { Producto } from '../services/producto.service';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
  notas?: string;
}

export const CarritoContext = createContext<{
  carrito: CarritoItem[];
  setCarrito: (c: CarritoItem[]) => void;
  limpiarCarrito: () => void;
}>({
  carrito: [],
  setCarrito: () => {},
  limpiarCarrito: () => {}
});

export const CarritoProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const limpiarCarrito = () => setCarrito([]);
  return (
    <CarritoContext.Provider value={{ carrito, setCarrito, limpiarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}; 