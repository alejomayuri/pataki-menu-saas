// src/components/ProductModal.jsx
"use client";

import { useEffect, useState, useRef } from "react";

export default function ProductModal({
  product,
  onClose,
  singleOptions,
  multipleOptions,
  onSingleSelect,
  onMultipleSelect,
  onConfirm,
  isBlocked
}) {
  const [isRendered, setIsRendered] = useState(false);
  
  // --- ESTADOS DE CONTROL Y VALIDACIÓN ---
  const [errors, setErrors] = useState({}); // Guarda los IDs de las secciones con error
  const [shakeSection, setShakeSection] = useState(null); // ID de la sección que va a temblar
  
  // Estados para controlar el arrastre con el dedo
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // Limpia los errores cada vez que se cambia de producto o se cierra
  useEffect(() => {
    setErrors({});
    setShakeSection(null);
  }, [product]);

  // Controla la entrada animada al abrirse
  useEffect(() => {
    if (product) {
      const timer = setTimeout(() => setIsRendered(true), 10);
      document.body.style.overflow = "hidden";
      setTranslateY(0); 
      return () => clearTimeout(timer);
    }
  }, [product]);

  // Manejador para el cierre animado suave hacia abajo
  const handleAnimateClose = () => {
    setIsRendered(false);
    setTranslateY(0);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onClose();
    }, 300);
  };

  // --- LÓGICA DE VALIDACIÓN ANTES DE CONFIRMAR ---
  const handleConfirmWithAnimation = () => {
    if (isBlocked) return;

    const newErrors = {};
    let firstErrorId = null;

    // Buscamos personalizaciones obligatorias (single) que no tengan selección
    product.customizations?.forEach((custom) => {
      if (custom.type === "single" && !singleOptions[custom.id]) {
        newErrors[custom.id] = true;
        if (!firstErrorId) firstErrorId = custom.id;
      }
    });

    // Si hay errores, bloqueamos y hacemos feedback visual
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShakeSection(firstErrorId);
      
      // Reseteamos el efecto de temblor después de 500ms
      setTimeout(() => setShakeSection(null), 500);

      // Scroll automático hacia la sección del error
      const errorElement = document.getElementById(`custom-section-${firstErrorId}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Si todo está ok, procede con el guardado normal
    setIsRendered(false);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onConfirm();
    }, 300);
  };

  // Limpia el error de una sección específica de inmediato cuando el usuario selecciona una opción
  const handleOptionSelect = (customizationId, optionName, isSingle) => {
    if (isSingle) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[customizationId];
        return updated;
      });
      onSingleSelect(customizationId, optionName);
    } else {
      onMultipleSelect(customizationId, optionName);
    }
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
        onClose();
      }, 250);
    } else {
      setTranslateY(0);
    }
  };

  if (!product) return null;

  const modalStyle = isDragging
    ? { transform: `translateY(${translateY}px)`, transition: "none" }
    : { transform: `translateY(${translateY}px)` };

  // Comprobamos si falta alguna opción obligatoria en general para alterar el botón inferior
  const hasPendingRequired = product.customizations?.some(
    (c) => c.type === "single" && !singleOptions[c.id]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans">
      
      {/* 1. FONDO OPACO CON BLUR PREMIUM */}
      <div
        className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleAnimateClose}
        style={{
          opacity: isDragging ? Math.max(0.1, 1 - translateY / 400) : undefined
        }}
      />

      {/* 2. CONTENEDOR DEL MODAL CON SOPORTE DE ARRASTRE */}
      <div
        style={modalStyle}
        className={`relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl transform transition-all duration-300 ease-in-out z-10 ${
          isRendered && !isDragging ? "translate-y-0 opacity-100" : ""
        } ${!isRendered && !isDragging ? "translate-y-full opacity-0 sm:scale-95 sm:translate-y-0" : ""}`}
      >
        {/* ZONA DE ARRASTRE SUPERIOR */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-3 sm:hidden cursor-grab active:cursor-grabbing shrink-0 select-none"
        >
          <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto" />
        </div>

        {/* CONTENIDO CON SOFT SCROLL INTERNO */}
        <div className="px-4 pb-4 overflow-y-auto flex-1 space-y-6 scrollbar-none scroll-smooth">
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
          {product.customizations?.map((custom) => {
            const isSingle = custom.type === "single";
            const hasError = errors[custom.id];
            const isFreezing = shakeSection === custom.id;

            return (
              <div 
                key={custom.id} 
                id={`custom-section-${custom.id}`}
                className={`space-y-2 p-2 rounded-xl transition-all duration-300 ${
                  hasError ? "bg-red-50/60 ring-1 ring-red-200" : ""
                } ${isFreezing ? "animate-shake" : ""}`}
              >
                <h3 className="text-sm font-black text-stone-800 uppercase tracking-wider flex justify-between px-1">
                  <span className={hasError ? "text-red-700 font-extrabold" : ""}>
                    {custom.title} {hasError && "⚠️"}
                  </span>
                  <span className={`text-[10px] font-normal lowercase ${hasError ? "text-red-500 font-bold" : "text-stone-400"}`}>
                    {isSingle ? "Obligatorio (Elige uno)" : "Opcional"}
                  </span>
                </h3>
                
                <div className="grid gap-2">
                  {custom.options.map((option) => {
                    const isChecked = isSingle
                      ? singleOptions[custom.id] === option.name
                      : multipleOptions[custom.id]?.includes(option.name);

                    return (
                      <div
                        key={option.name}
                        onClick={() => handleOptionSelect(custom.id, option.name, isSingle)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all active:scale-[0.99] select-none ${
                          isChecked
                            ? "border-amber-500 bg-amber-50/40 text-amber-900"
                            : hasError 
                              ? "border-red-200 bg-white text-stone-700 hover:border-red-300"
                              : "border-stone-200 bg-white text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={isSingle ? "radio" : "checkbox"}
                            name={custom.id}
                            checked={isChecked || false}
                            onChange={() => {}}
                            className={`h-4 w-4 pointer-events-none ${isSingle ? "accent-amber-600" : "accent-stone-900"}`}
                          />
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
            );
          })}
        </div>

        {/* Botón de acción fijo abajo */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <button
            onClick={handleConfirmWithAnimation}
            disabled={isBlocked}
            className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm tracking-wide uppercase ${
              isBlocked 
                ? "bg-stone-300 text-stone-500 cursor-not-allowed opacity-60 shadow-none" 
                : hasPendingRequired
                  ? "bg-stone-400 text-white hover:bg-stone-500" // Avisa sutilmente que falta rellenar
                  : "bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-amber-500/10" // Activo completo y llamativo
            }`}
          >
            {hasPendingRequired && !isBlocked ? "Completa las opciones" : "Agregar al pedido"}
          </button>
        </div>

      </div>
    </div>
  );
}