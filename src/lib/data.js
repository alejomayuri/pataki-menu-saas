// src/lib/data.js

export const restaurantMock = {
  name: "La Carnicería Burger & Bar",
  slug: "la-carniceria",
  logoUrl: "🍔",
  bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800", // Foto de ambiente de restobar
  categories: ["Coctelería", "Piqueos", "Burgers", "Cervezas & Softs"],
  products: [
    // --- CATEGORÍA: COCTELERÍA ---
    {
      id: "c-01",
      name: "Chilcano Artesanal",
      description: "Zumo de limón fresco, jarabe de goma, amargo de angostura y Ginger Ale premium.",
      price: 24.00,
      category: "Coctelería",
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=300",
      isAvailable: true,
      customizations: [
        {
          id: "ch-cepa",
          title: "Elige la cepa de Pisco",
          required: true,
          type: "single",
          options: [
            { name: "Pisco Quebranta (Más seco)", price: 0 },
            { name: "Pisco Acholado (Más aromático)", price: 0 },
            { name: "Pisco Italia (Frutado)", price: 2.00 }
          ]
        },
        {
          id: "ch-sabor",
          title: "Añade un toque de sabor",
          required: false,
          type: "single",
          options: [
            { name: "Clásico", price: 0 },
            { name: "Maracuyá", price: 1.00 },
            { name: "Kion & Menta", price: 1.50 }
          ]
        }
      ]
    },
    {
      id: "c-02",
      name: "Gin Tonic de la Casa",
      description: "Gin amazónico, agua tónica, rodaja de pepino fresco y bayas de enebro.",
      price: 28.00,
      category: "Coctelería",
      imageUrl: "https://images.unsplash.com/photo-1570598912132-0ba1dc951b7d?q=80&w=300",
      isAvailable: true,
      customizations: []
    },

    // --- CATEGORÍA: PIQUEOS ---
    {
      id: "p-01",
      name: "Alitas Carniceras (x8)",
      description: "Crujientes alitas de pollo bañadas en la salsa de tu elección, acompañadas de bastones de apio.",
      price: 26.00,
      category: "Piqueos",
      imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=300",
      isAvailable: true,
      customizations: [
        {
          id: "al-salsa",
          title: "Selecciona tu salsa",
          required: true,
          type: "single",
          options: [
            { name: "BBQ Ahumada artesanal", price: 0 },
            { name: "Buffalo Picante", price: 0 },
            { name: "Passion Fruit Honey (Dulce)", price: 0 }
          ]
        },
        {
          id: "al-extra",
          title: "Salsas extra para dippear",
          required: false,
          type: "multiple",
          options: [
            { name: "Crema de Queso Azul", price: 2.50 },
            { name: "Mayonesa Pilsen", price: 1.50 }
          ]
        }
      ]
    },
    {
      id: "p-02",
      name: "Tequeños de Lomo Saltado (x6)",
      description: "Masa wonton crujiente rellena de nuestro jugoso lomo saltado, servidos con abundante crema de guacamole.",
      price: 22.00,
      category: "Piqueos",
      imageUrl: "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?q=80&w=300", // Foto referencial de piqueo frito
      isAvailable: true,
      customizations: []
    },

    // --- CATEGORÍA: BURGERS ---
    {
      id: "b-01",
      name: "Clásica con Queso",
      description: "180g de carne de res, doble queso cheddar premium, pepinillos y salsa secreta de la casa.",
      price: 28.00,
      category: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300",
      isAvailable: true,
      customizations: [
        {
          id: "b1-coccion",
          title: "Término de la carne",
          required: true,
          type: "single",
          options: [
            { name: "Término Medio (Jugoso)", price: 0 },
            { name: "Tres Cuartos (Al punto)", price: 0 },
            { name: "Bien Cocido", price: 0 }
          ]
        },
        {
          id: "b1-cremas",
          title: "Salsas en la mesa",
          required: false,
          type: "multiple",
          options: [
            { name: "Mayonesa de la casa", price: 0 },
            { name: "Kétchup", price: 0 },
            { name: "Mostaza", price: 0 },
            { name: "Ají parrillero de la casa", price: 0 }
          ]
        },
        {
          id: "b1-extras",
          title: "¿Quieres meterle más peso?",
          required: false,
          type: "multiple",
          options: [
            { name: "Huevo frito de corral", price: 2.00 },
            { name: "Extra Queso Cheddar", price: 2.50 },
            { name: "Porción de harto Tocino", price: 4.00 }
          ]
        }
      ]
    },
    {
      id: "b-02",
      name: "Monster Bacon",
      description: "Doble carne (360g en total), triple tocino ahumado crujiente, queso cheddar derretido y aros de cebolla.",
      price: 38.00,
      category: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=300",
      isAvailable: true,
      customizations: [
        {
          id: "b2-coccion",
          title: "Término de la carne",
          required: true,
          type: "single",
          options: [
            { name: "Término Medio", price: 0 },
            { name: "Tres Cuartos", price: 0 },
            { name: "Bien Cocido", price: 0 }
          ]
        },
        {
          id: "b2-extras",
          title: "¿Quieres meterle más peso?",
          required: false,
          type: "multiple",
          options: [
            { name: "Huevo frito de corral", price: 2.00 },
            { name: "Extra Queso Cheddar", price: 2.50 },
            { name: "Porción de harto Tocino", price: 4.00 }
          ]
        }
      ]
    },

    // --- CATEGORÍA: CERVEZAS & SOFTS ---
    {
      id: "s-01",
      name: "Cerveza Artesanal IPA",
      description: "Cerveza local de 330ml con notas intensas a lúpulo y toques cítricos. Grado alc. 6.5%",
      price: 16.00,
      category: "Cervezas & Softs",
      imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=300",
      isAvailable: true,
      customizations: []
    },
    {
      id: "s-02",
      name: "Agua con Gas / Sin Gas",
      description: "Botella personal de 500ml helada.",
      price: 6.00,
      category: "Cervezas & Softs",
      imageUrl: "https://images.unsplash.com/photo-1608885898957-a599fb18de36?q=80&w=300",
      isAvailable: true,
      customizations: [
        {
          id: "ag-tipo",
          title: "Selecciona el tipo",
          required: true,
          type: "single",
          options: [
            { name: "Sin gas + rodaja de limón", price: 0 },
            { name: "Con gas + rodaja de limón", price: 0 }
          ]
        }
      ]
    }
  ]
};