// src/app/page.js
"use client";

import { useState } from "react";
import { restaurantMock } from "@/lib/data";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategorySelector from "@/components/CategorySelector";
import ProductModal from "@/components/ProductModal";
import CartBar from "@/components/CartBar";

export default function MenuLanding() {
  const { name, bannerUrl, categories, products } = restaurantMock;
  
  // Estados de la aplicación
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSingleOptions, setSelectedSingleOptions] = useState({});
  const [selectedMultipleOptions, setSelectedMultipleOptions] = useState({});
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  console.log("confirmedOrders:", confirmedOrders); // Para que puedas ver en consola el historial acumulativo de pedidos enviados a cocina

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

    // Buscar si ya existe un producto idéntico
    const existingItemIndex = cart.findIndex(item => {
      const sameProduct = item.id === selectedProduct.id;
      const sameSingle = JSON.stringify(item.selectedCustomizations.single) === JSON.stringify(selectedSingleOptions);
      const sameMultiple = JSON.stringify(item.selectedCustomizations.multiple) === JSON.stringify(selectedMultipleOptions);
      return sameProduct && sameSingle && sameMultiple;
    });

    if (existingItemIndex > -1) {
      // CORRECCIÓN: Creamos un nuevo array y mapeamos para actualizar la cantidad de forma segura
      setCart(prevCart => 
        prevCart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 } // Sumamos estrictamente 1 a la copia
            : item
        )
      );
    } else {
      // Si no existe, lo agregamos por primera vez
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
    if (cart.length === 0) return; // Evita enviar carritos vacíos

    // Transformación y limpieza de datos (lo que revisamos antes)
    const productosParaCocina = cart.map(item => {
      const opcionesSingle = Object.values(item.selectedCustomizations.single);
      const opcionesMultiple = Object.values(item.selectedCustomizations.multiple).flat();

      return {
        name: item.name,
        quantity: item.quantity,
        notes: [...opcionesSingle, ...opcionesMultiple]
      };
    });

    const ticketCocina = {
      ticketId: Date.now().toString(),
      mesa: "Mesa 04", // Temporal, luego vendrá de la URL
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      items: productosParaCocina,
      // También guardamos el total de este ticket por si lo necesitamos para la cuenta final
      subtotal: cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0)
    };

    // ACCIONES EN CADENA:
    // A) Guardamos el ticket limpio en nuestro historial acumulativo
    setConfirmedOrders(prevOrders => [...prevOrders, ticketCocina]);

    // B) Limpiamos el carrito de compras para dejarlo en cero para la siguiente ronda
    setCart([]);

    // C) Consola para que verifiques en tus DevTools de Chrome que todo funcionó fino
    console.log("✈️ TICKET ENVIADO Y GUARDADO EN HISTORIAL:", ticketCocina);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => {
      // 1. Buscamos el producto que el usuario quiere reducir/eliminar
      const itemToModify = prevCart.find(item => item.cartItemId === cartItemId);
      
      if (!itemToModify) return prevCart;

      // 2. Si la cantidad es mayor a 1, solo le restamos 1 a esa fila
      if (itemToModify.quantity > 1) {
        return prevCart.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } 
      
      // 3. Si la cantidad era exactamente 1, filtramos y eliminamos la fila por completo
      return prevCart.filter(item => item.cartItemId !== cartItemId);
    });
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12 font-sans text-stone-900">
      
      <RestaurantHeader name={name} bannerUrl={bannerUrl} />

      <CategorySelector categories={categories} />

      {/* Lista de Productos de la Página Principal */}
      <div className="px-4 space-y-8 mt-4">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category && p.isAvailable);

          return (
            <section key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
              <h2 className="text-lg font-black text-stone-800 mb-3 border-b border-stone-200 pb-1 uppercase tracking-wider">{category}</h2>
              <div className="grid gap-3">
                {categoryProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-xl p-3 shadow-sm border border-stone-100 flex justify-between gap-4 active:scale-[0.98] transition-all cursor-pointer"
                  >
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

      {/* Componente del Modal */}
      <ProductModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        singleOptions={selectedSingleOptions}
        multipleOptions={selectedMultipleOptions}
        onSingleSelect={handleSingleSelect}
        onMultipleSelect={handleMultipleSelect}
        onConfirm={addToCart}
      />

      {/* Componente de la Barra de Carrito */}
      <CartBar 
        cart={cart} 
        onClick={enviarACocina}
        onClearCart={() => setCart([])} 
        onRemoveItem={removeFromCart}
      />

    </main>
  );
}