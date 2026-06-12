import { useEffect, useState } from 'react';
import { db } from '../lib/firebase'; // Ajusta la ruta relativa según dónde guardaste tu firebase.js
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export function useMenu(restaurantId) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay un ID de restaurante válido en la URL o componente, no ejecutamos nada
    if (!restaurantId) return;

    // 1. Escuchar Categorías activas y ordenarlas según el campo 'order'
    const qCategories = query(
      collection(db, 'restaurants', restaurantId, 'categories'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );

    const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,         // El ID automático del documento
        ...doc.data()       // name, order, isActive
      }));
      setCategories(cats);
    });

    // 2. Escuchar Productos disponibles y ordenarlos según el campo 'order'
    const qProducts = query(
      collection(db, 'restaurants', restaurantId, 'products'),
      where('isAvailable', '==', true),
      orderBy('order', 'asc')
    );

    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,         // El ID automático del producto
        ...doc.data()       // name, description, price, categoryId, order, isAvailable
      }));
      setProducts(prods);
      setLoading(false); // Apagamos el estado de carga inicial cuando llegan los productos
    });

    // Limpieza (Cleanup): Apaga ambos listeners en tiempo real cuando el comensal abandona la página
    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, [restaurantId]);

  return { categories, products, loading };
}