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
  const nroMesa = searchParams.get("m") || "Llevar / Delivery";
  const zonaMesa = searchParams.get("z") || "General";

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSingleOptions, setSelectedSingleOptions] = useState({});
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState({});
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

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

    return () => observer.disconnect(); // OPTIMIZACIÓN 2: Desconexión limpia y global del observer
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
    selectedProduct.customizations?.forEach(custom => {
      if (custom.type === 'multiple') {
        const selectedList = selectedMultipleOptions[custom.id] || [];
        custom.options.forEach(opt => {
          if (selectedList.includes(opt.name)) extraPrice += opt.price;
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
        quantity: 1
      }]);
    }

    setSelectedProduct(null);
  };

  const enviarACocina = () => {
    if (cart.length === 0) return;

    const productosParaCocina = cart.map(item => {
      const notasFormateadas = [];
      Object.entries(item.selectedCustomizations.single).forEach(([_, value]) => {
        if (value) notasFormateadas.push(value);
      });
      Object.entries(item.selectedCustomizations.multiple).forEach(([_, list]) => {
        if (list && list.length > 0) notasFormateadas.push(...list);
      });

      return {
        name: item.name,
        quantity: item.quantity,
        precioUnitario: item.totalPrice,
        notas: notasFormateadas
      };
    });

    const totalTicket = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);

    setConfirmedOrders(prevOrders => [...prevOrders, {
      ticketId: crypto.randomUUID(),
      mesa: nroMesa, 
      zona: zonaMesa,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      items: productosParaCocina,
      totalTicket: totalTicket
    }]);

    setCart([]);
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

    console.log("🔥 Enviando solicitud de CUENTA a Caja:", payloadCuenta);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.reduce((acc, item) => {
      if (item.cartItemId === cartItemId) {
        if (item.quantity > 1) acc.push({ ...item, quantity: item.quantity - 1 });
      } else {
        acc.push(item);
      }
      return acc;
    }, []));
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12 font-sans text-stone-900">
      <RestaurantHeader name={name} bannerUrl={bannerUrl} nroMesa={nroMesa} zonaMesa={zonaMesa} />
      <CategorySelector categories={categories} activeCategory={activeCategory} />

      <div className="px-4 space-y-8 mt-4 pb-10">
        {categories.map((category) => {
          const categoryProducts = productsByCategory[category] || []; // Consumimos la caché pre-filtrada
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
              <h2 className="text-lg font-black text-stone-800 mb-3 border-b border-stone-200 pb-1 uppercase tracking-wider">{category}</h2>
              <div className="grid gap-3">
                {categoryProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => handleProductClick(product)} 
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
        onConfirm={addToCart} 
      />
      <CartBar cart={cart} onClick={enviarACocina} onClearCart={() => setCart([])} onRemoveItem={removeFromCart} />

      {/* Barra de Consumo Acumulado (Estilo CartBar) */}
      {confirmedOrders.length > 0 && (
        <div 
          className={`fixed left-0 right-0 bg-stone-900 text-white shadow-xl transition-all duration-300 z-40 border-t border-stone-800 ${
            cart.length > 0 ? "bottom-0" : "bottom-0" // Si hay carrito, se apila arriba elegantemente
          }`}
        >
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
              className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-stone-950 font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Ver Pedidos / Cuenta 📋
            </button>
          </div>
        </div>
      )}

      <OrdersModal 
        isOpen={isOrdersModalOpen} 
        onClose={() => setIsOrdersModalOpen(false)} 
        confirmedOrders={confirmedOrders}
        onSolicitarCuenta={solicitarCuenta}
      />
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