// Este archivo define la lista de naves jugables.
// Cada nave tiene:
// - id: Identificador único.
// - name: Nombre de la nave.
// - imageSrc: La ruta al archivo de imagen de la nave.
// - stats: Un objeto con las estadísticas base.
// - startingWeapon: La clave del arma inicial (de weapons.js).
// - ability: Una descripción de su habilidad pasiva y su arma inicial.
// - description: Un texto de ambientación.

export const characters = [
  {
    id: 1,
    name: "Vanguard",
    imageSrc: 'assets/ships/ship_1.png',
    stats: {
      health: 100,
      speed: 4,
      damage_bonus: 0,
      pickup_radius: 50,
    },
    startingWeapon: 'magicWand', // Canon
    ability: "Habilidad: Nave de combate equilibrada.",
    description: "Una nave versátil, lista para cualquier misión."
  },
  {
    id: 2,
    name: "Odyssey",
    imageSrc: 'assets/ships/ship_2.png',
    stats: {
      health: 150,
      speed: 3,
      damage_bonus: 0,
      pickup_radius: 50,
    },
    startingWeapon: 'garlic', // Onda de repulsion
    ability: "Habilidad: +50% de vida máxima en el casco.",
    description: "Lenta pero muy resistente. Ideal para aguantar flotas enemigas."
  },
  {
    id: 3,
    name: "Nebula",
    imageSrc: 'assets/ships/ship_3.png',
    stats: {
      health: 80,
      speed: 6,
      damage_bonus: 0,
      pickup_radius: 60,
    },
    startingWeapon: 'knives', // Arma de rayos unitarios
    ability: "Habilidad: +25% de velocidad de motor.",
    description: "Se mueve ágilmente por el campo de asteroides."
  },
  {
    id: 4,
    name: "Zenith",
    imageSrc: 'assets/ships/ship_4.png',
    stats: {
      health: 100,
      speed: 4,
      damage_bonus: 0,
      pickup_radius: 100,
    },
    startingWeapon: 'holyWater', // Explosion estelar
    ability: "Habilidad: Mayor radio de atracción de recursos.",
    description: "Su tecnología de atracción le da ventaja en la recolección."
  },
  {
    id: 5,
    name: "Chronos",
    imageSrc: 'assets/ships/ship_5.png',
    stats: {
      health: 60,
      speed: 4,
      damage_bonus: 0.20,
      pickup_radius: 50,
    },
    startingWeapon: 'whip', // Rayo horizontal
    ability: "Habilidad: +20% de daño en todos los sistemas de armas.",
    description: "Un 'cañón de cristal', frágil pero increíblemente letal."
  }
];
