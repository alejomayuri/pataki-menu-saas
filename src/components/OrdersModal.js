// src/components/OrdersModal.jsx
"use client";

import { useEffect, useState, useRef } from "react";

export default function OrdersModal({
  isOpen,
  onClose,
  confirmedOrders = [],
  onSolicitarCuenta,
  isAccountRequested = false, // <-- Nueva prop para saber si ya se pidió la cuenta a nivel global
  initialMethod = null        // <-- Nueva prop para recordar el método elegido si ya se pidió
}) {
  const [isRendered, setIsRendered] = useState(false);
  const [metodoPago, setMetodoPago] = useState(initialMethod);

  // Estados y referencias para controlar el arrastre con el dedo
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // Sincronizar el método de pago inicial si cambia desde fuera
  useEffect(() => {
    if (initialMethod) {
      setMetodoPago(initialMethod);
    }
  }, [initialMethod]);

  // Controla únicamente la animación de entrada al abrirse
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRendered(true), 10);
      document.body.style.overflow = "hidden";
      setTranslateY(0); // Reinicia la posición física de arrastre
      
      // Si NO se ha pedido la cuenta, permitimos resetear el selector visual para una nueva experiencia
      if (!isAccountRequested) {
        setMetodoPago(null);
      }
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAccountRequested]);

  // Manejador para el cierre animado suave hacia abajo
  const handleAnimateClose = () => {
    setIsRendered(false);
    setTranslateY(0);
    setTimeout(() => {
      document.body.style.overflow = "unset";
      onClose();
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
        onClose();
      }, 250);
    } else {
      setTranslateY(0);
    }
  };

  if (!isOpen) return null;

  const modalStyle = isDragging
    ? { transform: `translateY(${translateY}px)`, transition: "none" }
    : { transform: `translateY(${translateY}px)` };

  const totalAcumulado = confirmedOrders.reduce((acc, ticket) => acc + (ticket.totalTicket || 0), 0);

  const handleMandarCuenta = () => {
    if (!metodoPago) return;
    onSolicitarCuenta(metodoPago); // Notifica al padre para que congele el estado del flujo
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans">
      
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

      {/* Contenedor animado */}
      <div
        style={modalStyle}
        className={`relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl transform transition-all duration-300 ease-in-out z-10 ${
          isRendered && !isDragging ? "translate-y-0 opacity-100" : ""
        } ${!isRendered && !isDragging ? "translate-y-full opacity-0 sm:scale-95 sm:translate-y-0" : ""}`}
      >
        
        {/* Zona de arrastre */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full cursor-grab active:cursor-grabbing shrink-0 select-none border-b border-stone-100 pb-3"
        >
          <div className="w-full py-3">
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto" />
          </div>

          <div className="px-4 flex justify-between items-center">
            <h2 className="text-lg font-black text-stone-800 uppercase tracking-wide">Mi Consumo</h2>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="px-4 py-5 overflow-y-auto flex-1 space-y-6 scrollbar-none scroll-smooth">
          {isAccountRequested ? (
            <div className="text-center py-10 space-y-3">
              <div className="text-4xl animate-bounce">⏳</div>
              <h3 className="font-bold text-stone-900 text-lg">Cuenta solicitada</h3>
              <p className="text-sm text-stone-500 px-4 leading-relaxed">
                El mozo se está acercando a tu mesa con la cuenta y el lector/código para pagar con <strong>{metodoPago === "yape" ? "Yape / Plin" : metodoPago?.toUpperCase()}</strong>. ¡Gracias por tu visita!
              </p>
            </div>
          ) : (
            <>
              {/* Lista de órdenes */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Platos enviados a cocina</h3>
                {confirmedOrders.length === 0 ? (
                  <p className="text-sm text-stone-500 italic">Aún no has enviado ningún pedido.</p>
                ) : (
                  <div className="space-y-3">
                    {confirmedOrders.map((ticket, tIdx) => (
                      <div key={ticket.ticketId || tIdx} className="bg-stone-50/60 rounded-2xl p-4 border border-stone-100">
                        <div className="flex justify-between text-xs text-stone-400 mb-2.5 font-medium">
                          <span>Ronda #{tIdx + 1}</span>
                          <span>{ticket.timestamp || "Reciente"}</span>
                        </div>
                        
                        <ul className="space-y-2.5">
                          {ticket.items?.map((item, iIdx) => (
                            <li key={iIdx} className="text-sm text-stone-800 flex justify-between items-start">
                              <div className="flex-1 pr-4">
                                <span className="font-bold text-amber-600">{item.quantity}x</span> {item.name}
                                {item.notas?.length > 0 && (
                                  <p className="text-xs text-stone-400 italic mt-0.5">{item.notas.join(", ")}</p>
                                )}
                              </div>
                              <span className="font-semibold text-stone-600">
                                S/ {((item.precioUnitario || 0) * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-3.5 pt-2.5 border-t border-stone-200/60 flex justify-between items-center text-xs">
                          <span className="text-stone-500">Subtotal ronda:</span>
                          <span className="font-bold text-stone-700">S/ {(ticket.totalTicket || 0).toFixed(2)}</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">En preparación</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selector de Pago */}
              {confirmedOrders.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">¿Cómo deseas pagar?</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => setMetodoPago("yape")}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.99] select-none ${
                        metodoPago === "yape" 
                          ? "border-purple-600 bg-purple-50 text-purple-700 font-bold" 
                          : "border-stone-200 bg-white text-stone-600"
                      }`}
                    >
                      <span className="text-xl">📱</span>
                      <span className="text-xs font-medium">Yape / Plin</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMetodoPago("efectivo")}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.99] select-none ${
                        metodoPago === "efectivo" 
                          ? "border-green-600 bg-green-50 text-green-700 font-bold" 
                          : "border-stone-200 bg-white text-stone-600"
                      }`}
                    >
                      <span className="text-xl">💵</span>
                      <span className="text-xs font-medium">Efectivo</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMetodoPago("tarjeta")}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.99] select-none ${
                        metodoPago === "tarjeta" 
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" 
                          : "border-stone-200 bg-white text-stone-600"
                      }`}
                    >
                      <span className="text-xl">💳</span>
                      <span className="text-xs font-medium">Tarjeta</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botón de acción fijo abajo */}
        {!isAccountRequested && confirmedOrders.length > 0 && (
          <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl space-y-4 pb-6">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-bold text-stone-500">Total acumulado:</span>
              <span className="text-2xl font-black text-stone-900">S/ {totalAcumulado.toFixed(2)}</span>
            </div>
            <button
              type="button"
              disabled={!metodoPago}
              onClick={handleMandarCuenta}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                metodoPago 
                  ? "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.99]" 
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              Pedir la Cuenta ahora
            </button>
          </div>
        )}

      </div>
    </div>
  );
}