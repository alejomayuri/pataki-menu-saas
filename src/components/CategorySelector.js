// src/components/CategorySelector.jsx
"use client";

import { useEffect, useRef } from "react";

export default function CategorySelector({ categories, activeCategory }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!activeCategory || !containerRef.current) return;

    const activeElement = containerRef.current.querySelector(
      `[data-id="${activeCategory}"]`
    );

    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  // NUEVO: Función para manejar el scroll suave al hacer click
  const handleCategoryClick = (e, targetId) => {
    e.preventDefault(); // Evitamos el salto brusco por defecto del <a>
    
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth", // Desplazamiento fluido
        block: "start",    // Alínea el inicio de la sección arriba
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="sticky top-0 z-10 bg-stone-100/80 backdrop-blur-md py-4 my-2 px-4 overflow-x-auto scrollbar-none flex gap-2 scroll-smooth"
    >
      {categories.map((category) => {
        const targetId = category.toLowerCase().replace(/\s+/g, "-");
        const isActive = activeCategory === targetId;

        return (
          <a
            key={category}
            href={`#${targetId}`}
            data-id={targetId}
            onClick={(e) => handleCategoryClick(e, targetId)} // Interceptamos el evento
            className={"whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold shadow-sm border transition-all duration-300 bg-white text-stone-700 border-stone-200 active:bg-stone-900 active:text-white"}
          >
            {category}
          </a>
        );
      })}
    </div>
  );
}