export default function ProductModal({ 
  product, 
  onClose, 
  singleOptions, 
  multipleOptions, 
  onSingleSelect, 
  onMultipleSelect, 
  onConfirm 
}) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-opacity animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto z-10 p-6 shadow-xl animate-slide-up">
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" onClick={onClose}/>

        <div className="flex justify-between items-start gap-4 mb-4 border-b border-stone-100 pb-4">
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-black text-stone-900 leading-tight">{product.name}</h2>
            <p className="text-xs text-stone-500 leading-relaxed">{product.description}</p>
            {/* AQUÍ AÑADIMOS EL PRECIO BASE */}
            <p className="text-base font-black text-amber-600 pt-1">
              S/ {product.price.toFixed(2)}
            </p>
          </div>
          {product.imageUrl && (
            <img src={product.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-stone-100 shrink-0" alt="" />
          )}
        </div>

        <div className="space-y-6 my-6">
          {product.customizations?.map((custom) => (
            <div key={custom.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200/40">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wide">{custom.title}</h3>
                {custom.required ? (
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Obligatorio</span>
                ) : (
                  <span className="text-[10px] font-medium bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">Opcional</span>
                )}
              </div>

              <div className="space-y-2">
                {custom.options.map((option) => {
                  const isSingleChecked = singleOptions[custom.id] === option.name;
                  const isMultipleChecked = (multipleOptions[custom.id] || []).includes(option.name);

                  return (
                    <div 
                      key={option.name}
                      onClick={() => custom.type === 'single' ? onSingleSelect(custom.id, option.name) : onMultipleSelect(custom.id, option.name)}
                      className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${
                        isSingleChecked || isMultipleChecked 
                          ? 'bg-amber-500/10 border-amber-500 font-semibold text-stone-900' 
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <div className={`w-4 h-4 flex items-center justify-center border ${
                          custom.type === 'single' ? 'rounded-full' : 'rounded'
                        } ${isSingleChecked || isMultipleChecked ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-400'}`}>
                          {(isSingleChecked || isMultipleChecked) && <span className="text-[10px]">✓</span>}
                        </div>
                        {option.name}
                      </div>
                      {option.price > 0 && (
                        <span className="text-xs text-amber-600 font-bold">+ S/ {option.price.toFixed(2)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onConfirm}
          className="w-full bg-stone-900 text-white text-sm font-bold py-3.5 rounded-xl active:scale-[0.99] transition-transform shadow-md shadow-stone-900/10"
        >
          Confirmar Selección
        </button>
      </div>
    </div>
  );
}