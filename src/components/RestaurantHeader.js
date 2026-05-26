export default function RestaurantHeader({ name, bannerUrl }) {
  return (
    <>
      {/* Banner Superior */}
      <div className="relative h-44 w-full bg-stone-800">
        <img src={bannerUrl} alt={name} className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
      </div>

      {/* Info del Restaurante */}
      <div className="relative px-4 -mt-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/60">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🍔</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-stone-900">{name}</h1>
              <p className="text-xs text-stone-500 font-medium mt-0.5">📍 Mesa 04 • Pide desde tu celular</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}