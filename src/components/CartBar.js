// src/components/CartBar.js
"use client";

import { useState, useEffect, useRef } from "react";

export default function CartBar({ 
  cart, 
  onClearCart, 
  onUpdateQuantity, 
  onClick, 
  hasActiveOrders = false, 
  isBlocked = false,
  esModoMesa = true 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false); // 🌟 Estado para manejar el borrado masivo voluntario

  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // --- CÁLCULOS DE ENTRADA ---
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);

  // --- 🌟 FEEDBACK DE AÑADIDO (REBOTE) ---
  const prevTotalItems = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevTotalItems.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
    prevTotalItems.current = totalItems;
  }, [totalItems]);

  // --- 🌟 REGLA DE ORO: CIERRE AUTOMÁTICO SOLO SI REDUCE UNO A UNO ---
  useEffect(() => {
    if (isOpen && cart.length === 0 && !showEmptyState) {
      handleAnimateClose();
    }
  }, [cart, isOpen, showEmptyState]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRendered(true), 10);
      document.body.style.overflow = "hidden";
      setTranslateY(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Si no hay nada en el carro y el modal no está activo, no pintamos la barra flotante
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
      setShowEmptyState(false); // Reseteamos al cerrar
    }, 300);
  };

  const handleClearAllWithAnimation = () => {
    // En lugar de cerrar de golpe, mostramos el Empty State dentro del modal
    setShowEmptyState(true);
    onClearCart();
  };

  const handleConfirmWithAnimation = () => {
    if (isBlocked || cart.length === 0) return;
    
    setIsRendered(false);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onClick();
      setIsOpen(false);
    }, 300);
  };

  // --- LÓGICA DE ARRASTRE TÁCTIL ---
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;
    if (deltaY > 0) setTranslateY(deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 60) {
      setIsRendered(false);
      setTranslateY(window.innerHeight);
      setTimeout(() => {
        document.body.style.overflow = "unset";
        setIsOpen(false);
        setShowEmptyState(false);
      }, 250);
    } else {
      setTranslateY(0);
    }
  };

  const isSubmitDisabled = isBlocked || cart.length === 0;

  const modalStyle = isDragging
    ? { transform: `translateY(${translateY}px)`, transition: "none" }
    : { transform: `translateY(${translateY}px)` };

  return (
    <>
      {/* BARRA FLOTANTE INFERIOR */}
      {cart.length > 0 && (
        <div className={`fixed inset-x-4 z-40 max-w-md mx-auto animate-slide-up transition-all duration-300 ease-in-out ${hasActiveOrders ? "bottom-20" : "bottom-4"}`}>
          <button
            type="button"
            onClick={() => !isBlocked && setIsOpen(true)}
            disabled={isBlocked}
            className={`w-full text-stone-950 font-black px-5 py-4 rounded-xl shadow-xl flex justify-between items-center transition-all duration-200 active:scale-[0.98] ${
              isBlocked 
                ? "bg-stone-300 text-stone-500 cursor-not-allowed opacity-60 shadow-none" 
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-xs rounded-lg px-2.5 py-1 font-black transition-all duration-300 ${
                isBlocked 
                  ? "bg-stone-400 text-stone-200" 
                  : isBouncing
                    ? "bg-amber-400 text-stone-950 scale-125 ring-4 ring-amber-400/30 animate-bounce"
                    : "bg-stone-950 text-amber-500 scale-100"
              }`}>
                {totalItems}
              </span>
              <span className="text-sm tracking-wide uppercase">
                {isBlocked ? "Pedido bloqueado por cuenta" : "Ver mi pedido"}
              </span>
            </div>
            <span className="text-base font-extrabold text-stone-950 transition-all duration-200">
              S/ {totalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* DESGLOSE DEL PEDIDO */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center font-sans">
          <div
            className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${isRendered ? "opacity-100" : "opacity-0"}`}
            onClick={handleAnimateClose}
            style={{ opacity: isDragging ? Math.max(0.1, 1 - translateY / 400) : undefined }}
          />

          <div
            style={modalStyle}
            className={`relative w-full max-w-md bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl transform transition-all duration-300 ease-in-out z-10 ${
              isRendered && !isDragging ? "translate-y-0 opacity-100" : ""
            } ${!isRendered && !isDragging ? "translate-y-full opacity-0" : ""}`}
          >
            {/* Zona de arrastre */}
            <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="w-full cursor-grab active:cursor-grabbing shrink-0 select-none bg-stone-50/50 border-b border-stone-100 pb-3">
              <div className="w-full py-3">
                <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto" />
              </div>
              <div className="px-4 flex justify-between items-center">
                <h2 className="text-lg font-black text-stone-900">
                  {esModoMesa ? "Resumen de Mesa" : "Resumen del Pedido"}
                </h2>
                {!isBlocked && cart.length > 0 && (
                  <button 
                    type="button" 
                    onClick={handleClearAllWithAnimation} 
                    className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="px-4 py-4 overflow-y-auto flex-1 flex flex-col scrollbar-none scroll-smooth">
              {cart.length === 0 ? (
                /* 🌟 ESCENARIO EMPTY STATE (Solo por botón de Limpiar Todo o estado inicial forzado) */
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in my-auto">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-2xl shadow-inner border border-stone-100 mb-3 animate-pulse">
                    🛒
                  </div>
                  <h3 className="font-bold text-stone-800 text-sm mb-1">Tu carrito está vacío</h3>
                  <p className="text-[11px] text-stone-400 max-w-[220px] leading-relaxed">
                    ¿Qué te provoca pedir primero? Explora nuestro menú y arma tu orden perfecta. 🍔🔥
                  </p>
                </div>
              ) : (
                /* LISTADO ACTIVO DEL CARRITO */
                <div className="space-y-4 divide-y divide-stone-100 w-full">
                  {cart.map((item, index) => {
                    const groupedCustomizations = item.displayCustomizations?.reduce((acc, current) => {
                      if (!acc[current.label]) acc[current.label] = [];
                      acc[current.label].push(current);
                      return acc;
                    }, {}) || {};

                    const hasCustomizations = Object.keys(groupedCustomizations).length > 0;

                    return (
                      <div key={item.cartItemId} className={`flex justify-between items-start gap-4 w-full transition-all duration-300 ${index > 0 ? 'pt-4' : ''}`}>
                        
                        {/* 📝 IZQUIERDA: Información del producto */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm leading-tight pt-0.5">
                            {item.name}
                          </h4>
                          
                          {/* DETALLE DE PERSONALIZACIÓN */}
                          {hasCustomizations && (
                            <div className="text-[11px] space-y-2 pl-1 leading-relaxed bg-stone-50/70 p-2.5 rounded-lg mt-1 border border-stone-100/40">
                              {Object.entries(groupedCustomizations).map(([label, options]) => (
                                <div key={label} className="space-y-0.5">
                                  <span className="font-bold text-stone-400 uppercase tracking-wide text-[9px] block">
                                    {label}:
                                  </span>
                                  <div className="pl-1 space-y-0.5">
                                    {options.map((opt, oIdx) => (
                                      <div key={oIdx} className="text-stone-600 flex justify-between items-center gap-1">
                                        <span className="text-stone-800 font-medium truncate">{opt.value}</span>
                                        {opt.price > 0 && (
                                          <span className="font-bold text-amber-600 text-[10px] shrink-0">
                                            (+ S/ {opt.price.toFixed(2)})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Subtotal por ítem */}
                          <p className="text-[11px] font-bold text-amber-600 pl-1 pt-0.5 transition-all duration-200">
                            S/ {(item.totalPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* ⚡ DERECHA: Selector de Cantidades */}
                        <div className="flex items-center shrink-0 bg-stone-100 rounded-xl p-1 border border-stone-200/60 shadow-sm gap-1 mt-0.5">
                          <button
                            type="button"
                            disabled={isBlocked}
                            onClick={() => onUpdateQuantity(item.cartItemId, "decrement")}
                            className="w-7 h-7 flex items-center justify-center rounded-lg font-black text-stone-600 bg-white shadow-sm border border-stone-200/40 hover:bg-red-50 hover:text-red-500 hover:border-red-100 disabled:opacity-40 transition-all duration-150 active:scale-90 text-xs"
                          >
                            {item.quantity === 1 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-900">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            ) : "—"}
                          </button>
                          
                          <span className="w-6 text-center text-xs font-black text-stone-800 select-none animate-fade-in">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={isBlocked}
                            onClick={() => onUpdateQuantity(item.cartItemId, "increment")}
                            className="w-7 h-7 flex items-center justify-center rounded-lg font-black text-stone-950 bg-white shadow-sm border border-stone-200/40 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 disabled:opacity-40 transition-all duration-150 active:scale-90 text-xs"
                          >
                            +
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Fijo */}
            <div className="border-t border-stone-200 p-4 bg-stone-50 rounded-b-2xl space-y-4 pb-6 shrink-0">
              <div className="flex justify-between items-center text-stone-900 px-1">
                <span className="text-sm font-bold text-stone-600">Total a enviar:</span>
                <span className="text-xl font-black text-amber-600 transition-all duration-200">S/ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmWithAnimation}
                disabled={isSubmitDisabled}
                className={`w-full font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg text-sm tracking-wide uppercase active:scale-[0.99] ${
                  isSubmitDisabled
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none border border-stone-300/40"
                    : "bg-stone-900 hover:bg-stone-800 text-white"
                }`}
              >
                {isBlocked 
                  ? "Cuenta en proceso" 
                  : cart.length === 0 
                    ? "Carrito Vacío" 
                    : esModoMesa 
                      ? "Enviar Pedido a Cocina" 
                      : "Confirmar y Pedir en Barra ⚡"
                }
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}