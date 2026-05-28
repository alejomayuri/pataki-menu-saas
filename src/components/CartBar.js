// src/components/CartBar.js
"use client";

import { useState, useEffect, useRef } from "react";

export default function CartBar({ cart, onClearCart, onRemoveItem, onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Estados y referencias para controlar el arrastre con el dedo
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // Todos los Hooks van al inicio de la función
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRendered(true), 10);
      document.body.style.overflow = "hidden";
      setTranslateY(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Retorno condicional después de los Hooks
  if (cart.length === 0 && !isOpen) {
    return null;
  }

  // --- MANEJADORES DE ANIMACIONES INTERNAS ---
  const handleAnimateClose = () => {
    setIsRendered(false);
    setTranslateY(0);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      setIsOpen(false);
    }, 300);
  };

  const handleClearAllWithAnimation = () => {
    setIsRendered(false);
    setTranslateY(0);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onClearCart();
      setIsOpen(false);
    }, 300);
  };

  const handleConfirmWithAnimation = () => {
    setIsRendered(false);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onClick();
      setIsOpen(false);
    }, 300);
  };

  // --- LÓGICA DE ARRASTRE TÁCTIL (TOUCH EVENTS) ---
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;

    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 60) {
      setIsRendered(false);
      setTranslateY(window.innerHeight);

      setTimeout(() => {
        document.body.style.overflow = "unset";
        setIsOpen(false);
      }, 250);
    } else {
      setTranslateY(0);
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);

  const modalStyle = isDragging
    ? { transform: `translateY(${translateY}px)`, transition: "none" }
    : { transform: `translateY(${translateY}px)` };

  return (
    <>
      {/* BARRA FLOTANTE INFERIOR 
        Cambiado de 'bottom-4' a 'bottom-20' para que flote limpiamente por encima 
        de la barra de estados de cocina sin empujarla ni levantarla.
      */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 inset-x-4 z-40 max-w-md mx-auto animate-slide-up">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black px-5 py-4 rounded-xl shadow-xl flex justify-between items-center transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-stone-950 text-amber-500 text-xs rounded-lg px-2.5 py-1 font-black">
                {totalItems}
              </span>
              <span className="text-sm tracking-wide uppercase">Ver mi pedido</span>
            </div>
            <span className="text-base font-extrabold">
              S/ {totalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* DESGLOSE DEL PEDIDO (Bottom Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center font-sans">
          
          {/* Fondo opaco blur */}
          <div
            className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${
              isRendered ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleAnimateClose}
            style={{
              opacity: isDragging ? Math.max(0.1, 1 - translateY / 400) : undefined
            }}
          />

          {/* Contenedor Animado */}
          <div
            style={modalStyle}
            className={`relative w-full max-w-md bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl transform transition-all duration-300 ease-in-out z-10 ${
              isRendered && !isDragging ? "translate-y-0 opacity-100" : ""
            } ${!isRendered && !isDragging ? "translate-y-full opacity-0" : ""}`}
          >
            
            {/* Zona de arrastre */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full cursor-grab active:cursor-grabbing shrink-0 select-none bg-stone-50/50 border-b border-stone-100 pb-3"
            >
              <div className="w-full py-3">
                <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto" />
              </div>

              <div className="px-4 flex justify-between items-center">
                <h2 className="text-lg font-black text-stone-900">Resumen de Mesa</h2>
                <button 
                  type="button"
                  onClick={handleClearAllWithAnimation}
                  className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
                >
                  Limpiar todo
                </button>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="px-4 py-4 overflow-y-auto flex-1 space-y-4 divide-y divide-stone-100 scrollbar-none scroll-smooth">
              {cart.map((item, index) => (
                <div key={item.cartItemId} className={`flex justify-between items-center gap-3 ${index > 0 ? 'pt-4' : ''}`}>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-800">{item.quantity}x</span>
                      <h4 className="font-bold text-stone-900 text-sm leading-tight">{item.name}</h4>
                    </div>
                    
                    <div className="text-[11px] text-stone-500 space-y-0.5 pl-7 leading-relaxed">
                      {item.selectedCustomizations?.single && Object.values(item.selectedCustomizations.single).map((val) => (
                        <p key={val} className="capitalize">• {val}</p>
                      ))}
                      {item.selectedCustomizations?.multiple && Object.values(item.selectedCustomizations.multiple).flat().map((val) => (
                        <p key={val} className="capitalize">• {val}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-extrabold text-stone-700 whitespace-nowrap">
                      S/ {(item.totalPrice * item.quantity).toFixed(2)}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors active:scale-95"
                      title="Eliminar producto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Fijo */}
            <div className="border-t border-stone-200 p-4 bg-stone-50 rounded-b-2xl space-y-4 pb-6 shrink-0">
              <div className="flex justify-between items-center text-stone-900 px-1">
                <span className="text-sm font-bold text-stone-600">Total a pagar:</span>
                <span className="text-xl font-black text-amber-600">S/ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmWithAnimation}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.99] text-sm tracking-wide uppercase"
              >
                Enviar Pedido a Cocina
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}