// src/components/ProductCard.jsx
export default function ProductCard({ product, onClick }) {
  return (
    <article 
      onClick={onClick} 
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-white rounded-xl p-3 shadow-sm border border-stone-100 flex justify-between gap-4 active:scale-[0.98] transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      {/* Información del Producto */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div className="space-y-1">
          <h3 className="font-bold text-stone-900 text-base leading-snug">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>
        <p className="text-sm font-extrabold text-amber-600 mt-2">S/ {product.price.toFixed(2)}</p>
      </div>

      {/* Imagen del Producto */}
      {product.imageUrl && (
        <div className="h-24 w-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/40">
          <img 
            src={product.imageUrl} 
            alt={`Foto de ${product.name}`} 
            className="h-full w-full object-cover" 
            loading="lazy" 
          />
        </div>
      )}
    </article>
  );
}