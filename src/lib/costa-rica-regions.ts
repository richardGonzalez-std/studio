// Fuente de datos: INEC / Gobierno de Costa Rica (datos oficiales de provincias, cantones y distritos).
// Nota: Los nombres están en castellano con tildes y acentos oficiales.
// Si se requiere coincidencia más tolerante, normalizar con .normalize('NFD').replace(/\p{Diacritic}/gu, '') o toLowerCase().

export type CostaRicaProvince = {
  name: string;
  cantons: {
    name: string;
    districts: string[];
  }[];
};

export const COSTA_RICA_PROVINCES: CostaRicaProvince[] = [
  {
    name: "San José",
    cantons: [
      { name: "San José", districts: ["Carmen","Merced","Hospital","Catedral","Zapote","San Francisco de Dos Ríos","La Uruca","Mata Redonda","Pavas","Hatillo","San Sebastián"] },
      { name: "Escazú", districts: ["Escazú Centro","San Rafael","San Antonio"] },
      { name: "Desamparados", districts: ["Desamparados","San Miguel","San Juan de Dios","San Rafael Arriba","San Antonio","Frailes","Patarrá","San Cristóbal","Rosario"] },
      { name: "Aserrí", districts: ["Aserrí","Tarbaca","Vuelta de Jorco","San Gabriel","Legua","Monterrey"] },
      { name: "Mora", districts: ["Colón","Guayabo","Tabarcia","Piedras Negras","Picagres","Jaris"] },
      { name: "Goicoechea", districts: ["Guadalupe","San José","Calle Blancos","Mata de Plátano","Ipís","Rancho Redondo","Purral"] },
      { name: "Santa Ana", districts: ["Santa Ana","Salitral","Pozos","Uruca","Piedades","Brasil"] },
      { name: "Alajuelita", districts: ["Alajuelita","San Josecito","San Antonio","Concepción"] },
      { name: "Vásquez de Coronado", districts: ["San Isidro","San Rafael","Dulce Nombre de Jesús","Patalillo","Cascajal"] },
      { name: "Acosta", districts: ["San Ignacio","Guaitil","Palmichal","Cangrejal"] },
      { name: "Tibás", districts: ["San Juan","Cinco Esquinas","Anselmo Llorente","León XIII"] },
      { name: "Moravia", districts: ["San Vicente","San Jerónimo","Sabaría"] },
      { name: "Montes de Oca", districts: ["San Pedro","Sabanilla","Mercedes","San Rafael"] },
      { name: "Turrubares", districts: ["San Pablo","San Pedro","San Juan de Mata" ,"San Luis"] },
      { name: "Dota", districts: ["Santa María","Jardín","Copey"] },
      { name: "Curridabat", districts: ["Curridabat","Granadilla","Sánchez","Tirrases"] },
      { name: "Pérez Zeledón", districts: ["San Isidro de El General","Rivas","Daniel Flores","Río Nuevo","Páramo","Pejibaye","Cajón","Barú","Rivas"] },
      { name: "León Cortés Castro", districts: ["San Pablo","San Andrés","Llano Bonito","San Isidro","Santa Cruz","San Antonio"] }
    ]
  },
  {
    name: "Alajuela",
    cantons: [
      { name: "Alajuela", districts: ["Alajuela","San José","Carrizal","San Antonio","Guácima","San Isidro","Sabanilla","San Rafael","Río Segundo","Desamparados","Turrúcares","Tambor","La Garita","San Ramón","Cipreses"] },
      { name: "San Ramón", districts: ["San Ramón","Santiago","San Juan","Piedades Norte","Piedades Sur","San Rafael","San Isidro","Peñas Blancas","Los Ángeles"] },
      { name: "Grecia", districts: ["Grecia","San Isidro","San José","San Roque","Tacares","Río Cuarto","Puente de Piedra"] },
      { name: "San Mateo", districts: ["San Mateo","Desmonte","Jesús María"] },
      { name: "Atenas", districts: ["Atenas","Mercedes","San José","San Isidro","Concepción","San Antonio"] },
      { name: "Naranjo", districts: ["Naranjo","San Miguel","San José","Ciruela","San Juan","El Rosario"] },
      { name: "Palmares", districts: ["Zaragoza","Buenos Aires","Santiago","Candelaria","Esquipulas"] },
      { name: "Poás", districts: ["San Pedro","San Juan","San Rafael","Carrillos"] },
      { name: "Orotina", districts: ["Orotina","El Mastate","Hacienda Vieja","Cleveland","Mastatal"] },
      { name: "San Carlos", districts: ["Quesada","Florencia","Buenavista","Aguas Zarcas","Venecia","Pital","La Fortuna","La Tigra","La Palmera","Venado","Cutris","Monterrey","Pocosol"] },
      { name: "Zarcero", districts: ["Zarcero","Laguna","Tapesco","Toro Amarillo","Guadalupe"] },
      { name: "Valverde Vega", districts: ["San Miguel","Sardinal","La Cruz"] },
      { name: "Upala", districts: ["Upala","Aguas Claras","San José (Pizote)","Bijagua","Delicias","Odubero"] },
      { name: "Los Chiles", districts: ["Los Chiles","Caño Negro","El Amparo","San Jorge"] },
      { name: "Guatuso", districts: ["San Rafael","Buenavista","Cote"] }
    ]
  },
  {
    name: "Cartago",
    cantons: [
      { name: "Cartago", districts: ["Oriental","Occidental","Carmen","San Nicolás","Aguacaliente","Guadalupe"] },
      { name: "Paraíso", districts: ["Paraíso","Santiago","Orosi","Cachí"] },
      { name: "La Unión", districts: ["Tres Ríos","San Diego","San Juan","San Rafael"] },
      { name: "Turrialba", districts: ["Turrialba","La Suiza","Peralta","Santa Cruz","Santa Teresita","Pavones","Tuis","Taco","La Isabel","Chirripó"] },
      { name: "Alvarado", districts: ["Pacayas","Cervantes","Capellades"] },
      { name: "Oreamuno", districts: ["San Rafael","Cot","Potrero Cerrado","Cipreses","Santa Rosa","Purral"] },
      { name: "El Guarco", districts: ["El Tejar","San Isidro","Tobosi"] }
    ]
  },
  {
    name: "Heredia",
    cantons: [
      { name: "Heredia", districts: ["Heredia","Mercedes","San Francisco","Ulloa","Varablanca"] },
      { name: "Barva", districts: ["Barva","San Pedro","San Pablo","San Roque","Santa Lucía"] },
      { name: "Santo Domingo", districts: ["Santo Domingo","San Vicente","San Miguel","Paracito","Santo Tomás"] },
      { name: "San Rafael", districts: ["San Rafael","San Josecito","Santiago","Ángeles"] },
      { name: "San Isidro", districts: ["San Isidro","San José","Concepción","San Francisco"] },
      { name: "Belén", districts: ["San Antonio","La Ribera","La Asunción"] },
      { name: "Flores", districts: ["San Joaquín","Barrantes","Llorente"] },
      { name: "San Pablo", districts: ["San Pablo","Rincón de Sabanilla","Cascajal"] },
      { name: "Sarapiquí", districts: ["Puerto Viejo","La Virgen","Horquetas","Llanuras del Gaspar","Cureña"] }
    ]
  },
  {
    name: "Guanacaste",
    cantons: [
      { name: "Liberia", districts: ["Liberia","Cañas Dulces","Mayorga","Nacascolo","Curubandé"] },
      { name: "Nicoya", districts: ["Nicoya","Mansión","San Antonio","Quebrada Honda","Sámara","Nosara","Belén de Nosarita"] },
      { name: "Santa Cruz", districts: ["Santa Cruz","Bolsón","Veintisiete de Abril","Tempate","Cartagena","Cuajiniquil","Diriá","Belén"] },
      { name: "Carrillo", districts: ["Filadelfia","Palmira","Sardinal","Belén de Carrillo"] },
      { name: "Nandayure", districts: ["Carmona","Santa Rita","Zapotal","San Pablo","Porvenir"] },
      { name: "La Cruz", districts: ["La Cruz","Santa Cecilia","Cabo Velas","Garita"] },
      { name: "Abangares", districts: ["Las Juntas","Sierra","San Juan","Colorado"] },
      { name: "Tilarán", districts: ["Tilarán","Quebrada Grande","Tronadora","Santa Rosa","Líbano","Tierras Morenas","Arenal"] },
      { name: "Hojancha", districts: ["Hojancha","Puerto Carrillo","Matambú","Monte Romo"] }
    ]
  },
  {
    name: "Puntarenas",
    cantons: [
      { name: "Puntarenas", districts: ["Puntarenas","Pitahaya","Chomes","Barranca","El Roble","Caldera","Tara","Moín","Canabal","Paquera","Cobano","Chacarita","Naine","Quebrada Grande","Monte Verde"] },
      { name: "Esparza", districts: ["Espíritu Santo","San Juan Grande","Macacona","San Rafael"] },
      { name: "Buenos Aires", districts: ["Buenos Aires","Volcán","Potrero Grande","Boruca","Pilas","Colinas","Chacarita","Turrialba"] },
      { name: "Montes de Oro", districts: ["Miramar","La Unión","Sabana Grande"] },
      { name: "Osa", districts: ["Puerto Cortés","Palmar","Sierpe","Bahía Ballena","Piedras Blancas","Llanuras del Gaspar"] },
      { name: "Quepos", districts: ["Quepos","Savegre","Naranjito"] },
      { name: "Golfito", districts: ["Golfito","Guaycará","Pavón"] },
      { name: "Coto Brus", districts: ["San Vito","Rita","Sabalito","Aguabuena","Limoncito"] },
      { name: "Parrita", districts: ["Parrita"] },
      { name: "Corredores", districts: ["Corredor","La Cuesta","Canoas","Laurel"] },
      { name: "Garabito", districts: ["Jacó","Tárcoles"] }
    ]
  },
  {
    name: "Limón",
    cantons: [
      { name: "Limón", districts: ["Limón","Valle La Estrella","Limón Centro","Río Blanco","Matama"] },
      { name: "Pococí", districts: ["Guápiles","Jiménez","Río Jiménez","La Rita","Roxana","Cariari","Colorado","La Colonia"] },
      { name: "Siquirres", districts: ["Siquirres","Pacuarito","Florida","Germania","Carmen","Catarata"] },
      { name: "Talamanca", districts: ["Bratsi","Sixaola","Cahuita","Telire"] },
      { name: "Matina", districts: ["Matina","Batán","Carrandí"] },
      { name: "Guácimo", districts: ["Guácimo","Mercedes","Pocora","Cervantes"] }
    ]
  }
];

// Helpers: opciones para selects (value = nombre, label = nombre)

const provinceMap = new Map<string, CostaRicaProvince>();
for (const p of COSTA_RICA_PROVINCES) provinceMap.set(p.name, p);

export function getProvinceOptions(): { value: string; label: string }[] {
  return COSTA_RICA_PROVINCES.map(p => ({ value: p.name, label: p.name }));
}

export function getCantonOptions(provinceName: string): { value: string; label: string }[] {
  if (!provinceName) return [];
  const p = provinceMap.get(provinceName);
  if (!p) return [];
  return p.cantons.map(c => ({ value: c.name, label: c.name }));
}

export function getDistrictOptions(provinceName: string, cantonName: string): { value: string; label: string }[] {
  if (!provinceName || !cantonName) return [];
  const p = provinceMap.get(provinceName);
  if (!p) return [];
  const c = p.cantons.find(ct => ct.name === cantonName);
  if (!c) return [];
  return c.districts.map(d => ({ value: d, label: d }));
}

