// src/app/page.js
"use client";

import { useState, useEffect, Suspense } from "react"; // 1. Importamos Suspense de React
import { useSearchParams } from "next/navigation";
import { restaurantMock } from "@/lib/data";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategorySelector from "@/components/CategorySelector";
import ProductModal from "@/components/ProductModal";
import CartBar from "@/components/CartBar";

// 2. CREAMOS UN SUBCOMPONENTE CON TODA LA LÓGICA QUE USABAS ANTES
function MenuContenido() {
  const { name, bannerUrl, categories, products } = restaurantMock;
  
  const searchParams = useSearchParams();
  const nroMesa = searchParams.get("m") || "Llevar / Delivery";
  const zonaMesa = searchParams.get("z") || "General";

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSingleOptions, setSelectedSingleOptions] = useState({});
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState({});
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

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

    return () => {
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [categories]);

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
      const sameProduct = item.id === selectedProduct.id;
      const sameSingle = JSON.stringify(item.selectedCustomizations.single) === JSON.stringify(selectedSingleOptions);
      const sameMultiple = JSON.stringify(item.selectedCustomizations.multiple) === JSON.stringify(selectedMultipleOptions);
      return sameProduct && sameSingle && sameMultiple;
    });

    if (existingItemIndex > -1) {
      setCart(prevCart => 
        prevCart.map((item, index) => 
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const cartItem = {
        cartItemId: Date.now().toString(),
        id: selectedProduct.id,
        name: selectedProduct.name,
        basePrice: selectedProduct.price,
        totalPrice: finalTotalPrice,
        selectedCustomizations: {
          single: { ...selectedSingleOptions },
          multiple: { ...selectedMultipleOptions }
        },
        quantity: 1
      };
      setCart(prevCart => [...prevCart, cartItem]);
    }

    setSelectedProduct(null);
  };

  const enviarACocina = () => {
    if (cart.length === 0) return;

    const productosParaCocina = cart.map(item => {
      const notasEstructuradas = {};
      Object.entries(item.selectedCustomizations.single).forEach(([id, name]) => { if (name) notasEstructuradas[id] = name; });
      Object.entries(item.selectedCustomizations.multiple).forEach(([id, list]) => { if (list?.length > 0) notasEstructuradas[id] = list; });

      return { name: item.name, quantity: item.quantity, notas: notasEstructuradas };
    });

    const ticketCocina = {
      ticketId: Date.now().toString(),
      mesa: nroMesa, 
      zona: zonaMesa,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      items: productosParaCocina,
      subtotal: cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0)
    };

    setConfirmedOrders(prevOrders => [...prevOrders, ticketCocina]);
    setCart([]);
  };

  console.log("Pedidos confirmados (enviados a cocina):", confirmedOrders);

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => {
      const itemToModify = prevCart.find(item => item.cartItemId === cartItemId);
      if (!itemToModify) return prevCart;
      if (itemToModify.quantity > 1) {
        return prevCart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item);
      } 
      return prevCart.filter(item => item.cartItemId !== cartItemId);
    });
    
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12 font-sans text-stone-900">
      <RestaurantHeader name={name} bannerUrl={bannerUrl} nroMesa={nroMesa} zonaMesa={zonaMesa} />
      <CategorySelector categories={categories} activeCategory={activeCategory} />

      <div className="px-4 space-y-8 mt-4 pb-10">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category && p.isAvailable);
          return (
            <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
              <h2 className="text-lg font-black text-stone-800 mb-3 border-b border-stone-200 pb-1 uppercase tracking-wider">{category}</h2>
              <div className="grid gap-3">
                {categoryProducts.map((product) => (
                  <div key={product.id} onClick={() => handleProductClick(product)} className="bg-white rounded-xl p-3 shadow-sm border border-stone-100 flex justify-between gap-4 active:scale-[0.98] transition-all cursor-pointer">
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="space-y-1">
                        <h3 className="font-bold text-stone-900 text-base leading-snug">{product.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{product.description}</p>
                      </div>
                      <p className="text-sm font-extrabold text-amber-600 mt-2">S/ {product.price.toFixed(2)}</p>
                    </div>
                    {product.imageUrl && (
                      <div className="h-24 w-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/40">
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} singleOptions={selectedSingleOptions} multipleOptions={selectedMultipleOptions} onSingleSelect={handleSingleSelect} onMultipleSelect={handleMultipleSelect} onConfirm={addToCart} />
      <CartBar cart={cart} onClick={enviarACocina} onClearCart={() => setCart([])} onRemoveItem={removeFromCart} />
    </main>
  );
}

// 3. EL COMPONENTE PADRE EXPORTADO AHORA ENVUELVE TODO EN SUSPENSE
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