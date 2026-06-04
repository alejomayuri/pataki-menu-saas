// src/app/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { restaurantMock } from "@/lib/data";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategorySelector from "@/components/CategorySelector";
import ProductModal from "@/components/ProductModal";
import ProductCard from "@/components/ProductCard";
import CartBar from "@/components/CartBar";
import OrdersModal from "@/components/OrdersModal";

const { name, bannerUrl, categories, products } = restaurantMock;

// OPTIMIZACIÓN 1: Agrupamos los productos por categoría una sola vez en memoria (fuera del render)
const productsByCategory = categories.reduce((acc, category) => {
  acc[category] = products.filter(p => p.category === category && p.isAvailable);
  return acc;
}, {});

function MenuContenido() {
  const searchParams = useSearchParams();
  
  // CONTROL DE FLUJO MVP: Detección estricta si el comensal está en Mesa o es para llevar
  const mesaParam = searchParams.get("m");
  const zonaParam = searchParams.get("z");
  const esModoMesa = Boolean(mesaParam && zonaParam);

  const nroMesa = mesaParam || "Para Llevar";
  const zonaMesa = zonaParam || "Barra";

  // --- 1. ESTADOS PRINCIPALES ---
  const [cart, setCart] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [cuentaSolicitada, setCuentaSolicitada] = useState(false);
  const [metodoPagoElegido, setMetodoPagoElegido] = useState(null);
  const [pedidoParaLlevarEnviado, setPedidoParaLlevarEnviado] = useState(false); // 🌟 Estado de confirmación de barra
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSingleOptions, setSelectedSingleOptions] = useState({});
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState({});
  const [activeCategory, setActiveCategory] = useState("");
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // --- EFECTO DE CARGA INICIAL (Solo en el Cliente) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("mi-menu-cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem("mi-menu-orders");
      if (savedOrders) setConfirmedOrders(JSON.parse(savedOrders));

      const savedCuenta = localStorage.getItem("mi-menu-cuenta-solicitada");
      if (savedCuenta) setCuentaSolicitada(savedCuenta === "true");

      const savedMetodo = localStorage.getItem("mi-menu-metodo-pago");
      if (savedMetodo) setMetodoPagoElegido(savedMetodo);

      const savedPedidoBarra = localStorage.getItem("mi-menu-pedido-barra-enviado");
      if (savedPedidoBarra) setPedidoParaLlevarEnviado(savedPedidoBarra === "true");
    }
  }, []);

  // --- 2. EFECTOS DE SINCRONIZACIÓN AUTOMÁTICA CON LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("mi-menu-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mi-menu-orders", JSON.stringify(confirmedOrders));
  }, [confirmedOrders]);

  // IntersectionObserver para actualizar la categoría activa en el scroll
  useEffect(() => {
    const sectionIds = categories.map(cat => cat.toLowerCase().replace(/\s+/g, "-"));
    const observerOptions = { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveCategory(entry.target.id);
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // --- ACCIONES DEL MENÚ Y DEL CARRITO ---

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedSingleOptions({});
    setSelectedMultipleOptions({});
    
    if (product.customizations) {
      const initialSingle = {};
      product.customizations.forEach(cust => {
        if (cust.type === "single" && cust.options.length > 0) {
          initialSingle[cust.id] = cust.options[0].name;
        }
      });
      setSelectedSingleOptions(initialSingle);
    }
  };
  
  const handleSingleSelect = (customizationId, optionName) => {
    setSelectedSingleOptions(prev => ({ ...prev, [customizationId]: optionName }));
  };

  const handleMultipleSelect = (customizationId, optionName) => {
    setSelectedMultipleOptions(prev => {
      const currentList = prev[customizationId] || [];
      const newList = currentList.includes(optionName)
        ? currentList.filter(item => item !== optionName)
        : [...currentList, optionName];
      return { ...prev, [customizationId]: newList };
    });
  };

  const addToCart = () => {
    let extraPrice = 0;
    const displayCustomizations = [];

    // 1. PROCESAMOS SELECCIONES ÚNICAS (SINGLE) Y CALCULAMOS SU PRECIO EXTRA
    Object.entries(selectedSingleOptions).forEach(([customId, optionName]) => {
      const customConfig = selectedProduct.customizations?.find(c => c.id === customId);
      const optionConfig = customConfig?.options?.find(o => o.name === optionName);
      
      if (optionConfig) {
        extraPrice += optionConfig.price;
        displayCustomizations.push({
          label: customConfig.title,
          value: optionName,
          price: optionConfig.price
        });
      }
    });

    // 2. PROCESAMOS SELECCIONES MÚLTIPLES (MULTIPLE) Y CALCULAMOS SU PRECIO EXTRA
    Object.entries(selectedMultipleOptions).forEach(([customId, selectedList]) => {
      const customConfig = selectedProduct.customizations?.find(c => c.id === customId);
      
      if (customConfig && selectedList.length > 0) {
        selectedList.forEach(optionName => {
          const optionConfig = customConfig.options?.find(o => o.name === optionName);
          if (optionConfig) {
            extraPrice += optionConfig.price;
            displayCustomizations.push({
              label: customConfig.title,
              value: optionName,
              price: optionConfig.price
            });
          }
        });
      }
    });

    const finalTotalPrice = selectedProduct.price + extraPrice;

    const existingItemIndex = cart.findIndex(item => {
      return item.id === selectedProduct.id && 
             JSON.stringify(item.selectedCustomizations.single) === JSON.stringify(selectedSingleOptions) && 
             JSON.stringify(item.selectedCustomizations.multiple) === JSON.stringify(selectedMultipleOptions);
    });

    if (existingItemIndex > -1) {
      setCart(prevCart => 
        prevCart.map((item, index) => 
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart(prevCart => [...prevCart, {
        cartItemId: crypto.randomUUID(),
        id: selectedProduct.id,
        name: selectedProduct.name,
        basePrice: selectedProduct.price,
        totalPrice: finalTotalPrice,
        selectedCustomizations: {
          single: { ...selectedSingleOptions },
          multiple: { ...selectedMultipleOptions }
        },
        displayCustomizations, 
        quantity: 1
      }]);
    }

    setSelectedProduct(null);
  };

  const enviarPedido = () => {
    if (cart.length === 0) return;

    const productosParaCocina = cart.map(item => {
      const notasFormateadas = [];
      item.displayCustomizations.forEach(cust => {
        notasFormateadas.push(`${cust.label}: ${cust.value}`);
      });

      return {
        name: item.name,
        quantity: item.quantity,
        precioUnitario: item.totalPrice,
        notas: notasFormateadas
      };
    });

    const totalTicket = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);

    if (esModoMesa) {
      // FLUJO A: Pedido acumulado regular en mesa
      setConfirmedOrders(prevOrders => [...prevOrders, {
        ticketId: crypto.randomUUID(),
        mesa: nroMesa, 
        zona: zonaMesa,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        items: productosParaCocina,
        totalTicket: totalTicket
      }]);
      setCart([]);
      setShowSuccessOverlay(true);
    } else {
      // FLUJO B: Pedido inmediato para llevar (Take Away)
      console.log("🚀 Enviando comanda de Retiro en Barra:", {
        mesa: "Para Llevar",
        items: productosParaCocina,
        total: totalTicket
      });
      
      setCart([]);
      setPedidoParaLlevarEnviado(true);
      localStorage.setItem("mi-menu-pedido-barra-enviado", "true"); // Persistencia de feedback
    }
  };

  const solicitarCuenta = (metodoSeleccionado) => {
    const totalAcumulado = confirmedOrders.reduce((acc, ticket) => acc + (ticket.totalTicket || 0), 0);

    const payloadCuenta = {
      restaurantSlug: "pataki-landing-studio",
      mesa: nroMesa,
      zona: zonaMesa,
      tipo: "cuenta",
      estado: "pendiente",
      metodoPago: metodoSeleccionado,
      timestamp: new Date().toISOString(),
      totalACobrar: totalAcumulado
    };

    setCuentaSolicitada(true);
    setMetodoPagoElegido(metodoSeleccionado);

    setSelectedProduct(null); 
    setIsOrdersModalOpen(false);
    
    localStorage.setItem("mi-menu-cuenta-solicitada", "true");
    localStorage.setItem("mi-menu-metodo-pago", metodoSeleccionado);
    console.log("🔥 Enviando solicitud de CUENTA a Caja:", payloadCuenta);
  };

  const updateCartItemQuantity = (cartItemId, action) => {
    setCart(prevCart => prevCart.reduce((acc, item) => {
      if (item.cartItemId === cartItemId) {
        if (action === "increment") {
          acc.push({ ...item, quantity: item.quantity + 1 });
        } else if (action === "decrement") {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
          // Si es 1 y dan click a decrement, simplemente no se pushea (se elimina del carrito)
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []));
  };

  const handleResetDebug = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12 font-sans text-stone-900 relative">
      
      <button 
        onClick={handleResetDebug}
        className="fixed top-4 right-4 z-90 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-50 hover:opacity-100 transition-opacity"
      >
        Reset Local
      </button>

      <RestaurantHeader name={name} bannerUrl={bannerUrl} nroMesa={nroMesa} zonaMesa={zonaMesa} />
      <CategorySelector categories={categories} activeCategory={activeCategory} />

      <div className="px-4 space-y-8 mt-4 pb-10">
        {categories.map((category) => {
          const categoryProducts = productsByCategory[category] || [];
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
              <h2 className="text-lg font-black text-stone-800 mb-3 border-b border-stone-200 pb-1 uppercase tracking-wider">{category}</h2>
              <div className="grid gap-3">
                {categoryProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={(cuentaSolicitada || pedidoParaLlevarEnviado) ? undefined : () => handleProductClick(product)} 
                    disabledStyle={(cuentaSolicitada || pedidoParaLlevarEnviado) ? "opacity-40 pointer-events-none cursor-not-allowed select-none" : ""}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        singleOptions={selectedSingleOptions} 
        multipleOptions={selectedMultipleOptions} 
        onSingleSelect={handleSingleSelect} 
        onMultipleSelect={handleMultipleSelect} 
        onConfirm={() => !(cuentaSolicitada || pedidoParaLlevarEnviado) && addToCart()} 
        isBlocked={cuentaSolicitada || pedidoParaLlevarEnviado}
      />
      
      <CartBar 
        hasActiveOrders={esModoMesa && confirmedOrders.length > 0} 
        cart={cart} 
        onClick={() => !(cuentaSolicitada || pedidoParaLlevarEnviado) && enviarPedido()}
        onClearCart={() => setCart([])} 
        onUpdateQuantity={updateCartItemQuantity}
        isBlocked={cuentaSolicitada || pedidoParaLlevarEnviado}
        esModoMesa={esModoMesa}
      />

      {/* BARRA DE CONSUMO ACUMULADO: Exclusiva para comensales en mesa física */}
      {esModoMesa && confirmedOrders.length > 0 && (
        <div className="fixed left-0 right-0 bg-stone-900 text-white shadow-xl transition-all duration-300 z-40 border-t border-stone-800 bottom-0">
          <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-stone-950 text-xs font-black h-6 w-6 rounded-lg flex items-center justify-center shadow-sm">
                {confirmedOrders.reduce((acc, t) => acc + t.items.reduce((sum, i) => sum + i.quantity, 0), 0)}
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium leading-none">Mi consumo en mesa</p>
                <p className="text-base font-black text-white mt-0.5">
                  S/ {confirmedOrders.reduce((acc, t) => acc + (t.totalTicket || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOrdersModalOpen(true)}
              className={`font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-sm ${
                cuentaSolicitada 
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 shadow-lg" 
                  : "bg-amber-500 hover:bg-amber-600 text-stone-950"
              }`}
            >
              {cuentaSolicitada ? (
                <span className="flex items-center gap-1.5">
                  Cuenta solicitada <span className="animate-bounce inline-block">⏳</span>
                </span>
              ) : (
                "Ver Pedidos 📋"
              )}
            </button>
          </div>
        </div>
      )}

      <OrdersModal 
        isOpen={isOrdersModalOpen} 
        onClose={() => setIsOrdersModalOpen(false)} 
        confirmedOrders={confirmedOrders}
        onSolicitarCuenta={solicitarCuenta}
        isAccountRequested={cuentaSolicitada}
        initialMethod={metodoPagoElegido}
      />

      {/* OVERLAY DE CUENTA SOLICITADA (MESA) */}
      {esModoMesa && cuentaSolicitada && (
        <div className="fixed top-0 inset-x-0 bg-stone-900/95 backdrop-blur-sm text-stone-100 text-center py-3 px-4 text-xs font-medium z-50 shadow-md border-b border-stone-800 transition-all flex items-center justify-center gap-2">
          <p className="tracking-wide">
            Muchas gracias por tu visita. Estamos preparando tu cuenta para pago con{" "}
            <span className="font-bold text-amber-400 capitalize">{metodoPagoElegido}</span>. 
            En breve nos acercaremos a tu mesa.
          </p>
        </div>
      )}

      {/* 🌟 NUEVO BANNER DE CONFIRMACIÓN (PARA LLEVAR / BARRA) */}
      {!esModoMesa && pedidoParaLlevarEnviado && (
        <div className="fixed top-0 inset-x-0 bg-stone-900/95 backdrop-blur-sm text-stone-100 text-center py-3.5 px-4 text-xs font-medium z-50 shadow-md border-b border-stone-800 transition-all flex items-center justify-center gap-2 animate-slide-up">
          <p className="tracking-wide">
            ¡Tu pedido ha sido enviado a la barra!
            <span className="text-amber-400 font-bold ml-1">Acércate en unos minutos para retirarlo.</span>
          </p>
        </div>
      )}

      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in">
          {/* Círculo con Check animado */}
          <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 animate-scale-in">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-stone-950">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          {/* Textos Informativos */}
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            {esModoMesa ? "¡Pedido enviado a cocina!" : "¡Pedido recibido en barra!"}
          </h2>
          
          <p className="text-sm text-stone-400 max-w-xs leading-relaxed mb-8">
            {esModoMesa 
              ? `Tu orden ya se está preparando para la Mesa ${nroMesa} (${zonaMesa}). ¡No tardará en llegar!`
              : "Estamos listando todo. Acércate a la barra en unos minutos con tu nombre para retirarlo."
            }
          </p>

          {/* Tarjeta con miniresumen rápido */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 w-full max-w-xs mb-8">
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Ubicación de orden</p>
            <p className="text-base font-black text-amber-400 mt-0.5">
              {esModoMesa ? `Mesa ${nroMesa} — ${zonaMesa}` : "Para Llevar / Retiro"}
            </p>
          </div>

          {/* Botón de retorno */}
          <button
            type="button"
            onClick={() => setShowSuccessOverlay(false)}
            className="bg-white hover:bg-stone-100 text-stone-950 font-bold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all active:scale-95 w-full max-w-xs uppercase tracking-wider"
          >
            Volver al Menú
          </button>
        </div>
      )}
    </main>
  );
}

export default function MenuLanding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-sm text-stone-500 font-medium animate-pulse">Cargando el menú...</p>
      </div>
    }>
      <MenuContenido />
    </Suspense>
  );
}