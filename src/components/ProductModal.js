// src/components/ProductModal.jsx
"use client";

import { useEffect, useState } from "react";

export default function ProductModal({
  product,
  onClose,
  singleOptions,
  multipleOptions,
  onSingleSelect,
  onMultipleSelect,
  onConfirm,
}) {
  const [isRendered, setIsRendered] = useState(false);

  // Controla la entrada animada al abrirse
  useEffect(() => {
    if (product) {
      const timer = setTimeout(() => setIsRendered(true), 10);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    }
  }, [product]);

  // Manejador para el cierre animado suave
  const handleAnimateClose = () => {
    setIsRendered(false);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onClose();
    }, 300);
  };

  // Confirmación con salida fluida
  const handleConfirmWithAnimation = () => {
    setIsRendered(false);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onConfirm();
    }, 300);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans">
      
      {/* 1. FONDO OPACO CON BLUR PREMIUM (backdrop-blur-sm) */}
      <div
        className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleAnimateClose}
      />

      {/* 2. CONTENEDOR DEL MODAL CON SLIDE-UP */}
      <div
        className={`relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl transform transition-all duration-300 ease-in-out z-10 ${
          isRendered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 sm:scale-95 sm:translate-y-0"
        }`}
      >
        {/* Indicador visual superior (Pill) para cerrar en móviles */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto my-3 sm:hidden cursor-pointer" onClick={handleAnimateClose} />

        {/* CONTENIDO CON SOFT SCROLL INTERNO */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6 scrollbar-none scroll-smooth">
          <div className="flex justify-between items-start gap-4 mb-4 border-b border-stone-100 pb-4">
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-black text-stone-900 leading-tight">{product.name}</h2>
              <p className="text-xs text-stone-500 leading-relaxed">{product.description}</p>
              <p className="text-base font-black text-amber-600 pt-1">
                S/ {product.price.toFixed(2)}
              </p>
            </div>
            {product.imageUrl && (
              <img src={product.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-stone-100 shrink-0" alt={product.name} />
            )}
          </div>

          {/* Mapeo dinámico de personalizaciones */}
          {product.customizations?.map((custom) => (
            <div key={custom.id} className="space-y-2">
              <h3 className="text-sm font-black text-stone-800 uppercase tracking-wider flex justify-between">
                <span>{custom.title}</span>
                <span className="text-[10px] text-stone-400 font-normal lowercase">
                  {custom.type === "single" ? "Selecciona uno" : "Opcional"}
                </span>
              </h3>
              
              <div className="grid gap-2">
                {custom.options.map((option) => {
                  const isSingle = custom.type === "single";
                  const isChecked = isSingle
                    ? singleOptions[custom.id] === option.name
                    : multipleOptions[custom.id]?.includes(option.name);

                  return (
                    <div
                      key={option.name}
                      onClick={() =>
                        isSingle
                          ? onSingleSelect(custom.id, option.name)
                          : onMultipleSelect(custom.id, option.name)
                      }
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all active:scale-[0.99] select-none ${
                        isChecked
                          ? "border-amber-500 bg-amber-50/40 text-amber-900"
                          : "border-stone-200 bg-white text-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type={isSingle ? "radio" : "checkbox"}
                          name={custom.id}
                          checked={isChecked || false}
                          onChange={() => {}} // Evita warning controlado por React
                          className="accent-amber-600 h-4 w-4 pointer-events-none"
                        />
                        {/* RENDERIZADO DEL NOMBRE REAL DE LA OPCIÓN */}
                        <span className="text-stone-800 font-semibold">{option.name}</span>
                      </div>
                      {option.price > 0 && (
                        <span className="text-xs font-bold text-stone-500">+ S/ {option.price.toFixed(2)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Botón de acción fijo abajo */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <button
            onClick={handleConfirmWithAnimation}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-colors shadow-sm"
          >
            Agregar al pedido
          </button>
        </div>

      </div>
    </div>
  );
}