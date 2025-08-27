// Este archivo define la lista de personajes jugables.
// Cada personaje tiene:
// - id: Identificador único.
// - name: Nombre del personaje.
// - shape: Objeto que describe su representación visual (un polígono).
// - stats: Un objeto con las estadísticas base del personaje.
// - startingWeapon: La clave del arma inicial del personaje (de weapons.js).
// - ability: Una descripción de su habilidad pasiva.
// - description: Un texto de ambientación.

export const characters = [
  {
    id: 1,
    name: "Triángulo Valiente",
    shape: {
      type: 'polygon',
      sides: 3,
    },
    stats: {
      health: 100,
      speed: 4,
      damage_bonus: 0,
      pickup_radius: 50,
    },
    startingWeapon: 'magicWand',
    ability: "Habilidad: Comienza con un nivel extra.",
    description: "Un caballero equilibrado, listo para cualquier desafío."
  },
  {
    id: 2,
    name: "Cuadrado Robusto",
    shape: {
      type: 'polygon',
      sides: 4,
    },
    stats: {
      health: 150,
      speed: 3,
      damage_bonus: 0,
      pickup_radius: 50,
    },
    startingWeapon: 'garlic',
    ability: "Habilidad: +50% de vida máxima.",
    description: "Lento pero muy resistente. Ideal para aguantar grandes oleadas."
  },
  {
    id: 3,
    name: "Pentágono Veloz",
    shape: {
      type: 'polygon',
      sides: 5,
    },
    stats: {
      health: 80,
      speed: 6,
      damage_bonus: 0,
      pickup_radius: 60,
    },
    startingWeapon: 'knives',
    ability: "Habilidad: +25% de velocidad de movimiento.",
    description: "Se mueve rápidamente por el campo de batalla, esquivando con facilidad."
  },
  {
    id: 4,
    name: "Hexágono Afortunado",
    shape: {
      type: 'polygon',
      sides: 6,
    },
    stats: {
      health: 100,
      speed: 4,
      damage_bonus: 0,
      pickup_radius: 100,
    },
    startingWeapon: 'holyWater',
    ability: "Habilidad: Aumenta el radio de recolección de gemas.",
    description: "La suerte siempre está de su lado, atrayendo la experiencia hacia él."
  },
  {
    id: 5,
    name: "Heptágono de Cristal",
    shape: {
      type: 'polygon',
      sides: 7,
    },
    stats: {
      health: 60,
      speed: 4,
      damage_bonus: 0.20,
      pickup_radius: 50,
    },
    startingWeapon: 'whip',
    ability: "Habilidad: +20% de daño a todas las armas.",
    description: "Frágil pero letal. Causa un daño inmenso a costa de su propia defensa."
  }
];
