// src/components/CartBar.js
"use client";

import { useState } from "react";

export default function CartBar({ cart, onClearCart, onRemoveItem, onClick }) {
  const [isOpen, setIsOpen] = useState(false);

  if (cart.length === 0) {
    // Si el carrito se vacía (porque eliminamos todo), nos aseguramos de resetear el modal a cerrado
    if (isOpen) setIsOpen(false); 
    return null;
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);

  return (
    <>
      {/* BARRA FLOTANTE INFERIOR */}
      <div className="fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto animate-slide-up">
        <button
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

      {/* DESGLOSE DEL PEDIDO (Bottom Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 transition-opacity animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto z-10 p-6 shadow-2xl flex flex-col animate-slide-up">
            
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 shrink-0" onClick={() => setIsOpen(false)} />

            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4 shrink-0">
              <h2 className="text-lg font-black text-stone-900">Resumen de Mesa</h2>
              <button 
                onClick={() => { onClearCart(); setIsOpen(false); }}
                className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Limpiar todo
              </button>
            </div>

            {/* Lista de productos agregados */}
            <div className="flex-1 overflow-y-auto space-y-4 divide-y divide-stone-100 pr-1">
              {cart.map((item, index) => (
                <div key={item.cartItemId} className={`flex justify-between items-center gap-3 ${index > 0 ? 'pt-4' : ''}`}>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-800">{item.quantity}x</span>
                      <h4 className="font-bold text-stone-900 text-sm leading-tight">{item.name}</h4>
                    </div>
                    
                    <div className="text-[11px] text-stone-500 space-y-0.5 pl-7 leading-relaxed">
                      {Object.values(item.selectedCustomizations.single).map((val) => (
                        <p key={val} className="capitalize">• {val}</p>
                      ))}
                      {Object.values(item.selectedCustomizations.multiple).flat().map((val) => (
                        <p key={val} className="capitalize">• {val}</p>
                      ))}
                    </div>
                  </div>

                  {/* Contenedor derecho: Precio y Botón de eliminar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-extrabold text-stone-700 whitespace-nowrap">
                      S/ {(item.totalPrice * item.quantity).toFixed(2)}
                    </span>
                    
                    {/* BOTÓN ELIMINAR ÍTEM */}
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="p-1.5 rounded-lg bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Eliminar producto"
                    >
                      {/* Icono de X simple */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Footer fijo del resumen */}
            <div className="border-t border-stone-200 pt-4 mt-6 space-y-4 shrink-0">
              <div className="flex justify-between items-center text-stone-900">
                <span className="text-sm font-bold text-stone-600">Total a pagar:</span>
                <span className="text-xl font-black text-amber-600">S/ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={onClick}
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