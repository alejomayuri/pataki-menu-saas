export default function RestaurantHeader({ name, bannerUrl, nroMesa, zonaMesa }) {
  // Verificamos si realmente viene de una mesa física o si entró sin QR
  const esMesaFisica = nroMesa && nroMesa !== "Llevar / Delivery";

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
              
              {/* Texto Dinámico con condicional */}
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {esMesaFisica ? (
                  <>
                    📍 <span className="font-bold text-stone-800">Mesa {nroMesa}</span> 
                    {zonaMesa && zonaMesa !== "General" && ` (${zonaMesa})`} • Pide desde tu celular
                  </>
                ) : (
                  <>🛍️ Pedido para Llevar / Delivery</>
                )}
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}