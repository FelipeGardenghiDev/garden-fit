export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number; // em miligramas (mg)
  sugar: number;  // em gramas (g)
  category: string;
}

export interface MealFoodItem extends FoodItem {
  uid: string;
  foodId: string;
  multiplier: number;
}

export interface UserStats {
  gender: 'M' | 'F';
  age: number;
  weight: number;        // 75 kg
  targetWeight: number;  // 65 kg (meta)
  height: number;        // 174 cm
  activity: string;      // Fator de atividade
  objective: 'cut' | 'bulk' | 'maintain';
  proteinPerKg: number;  // ex: 2.0 g/kg
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodiumLimit: number; // Limite máximo diário OMS / SBC (2.000 mg)
  sugarLimit: number;  // Limite máximo diário de açúcares livres OMS (30 g)
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  takenToday: boolean;
  takenAt?: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export const INITIAL_USER_STATS: UserStats = {
  gender: 'M',
  age: 28,
  weight: 75,
  targetWeight: 65,
  height: 174,
  activity: '1.375',
  objective: 'cut',
  proteinPerKg: 2.0
};

// Remédios personalizados do Felipe (apenas Omeprazol e Olmesartana às 08:00)
export const INITIAL_MEDICATIONS: MedicationItem[] = [
  { 
    id: 'med-omeprazol', 
    name: 'Omeprazol', 
    dosage: '2 comprimidos', 
    scheduledTime: '08:00 (Jejum / Manhã)', 
    takenToday: false 
  },
  { 
    id: 'med-olmesartana', 
    name: 'Olmesartana', 
    dosage: '1 comprimido', 
    scheduledTime: '08:00 (Manhã)', 
    takenToday: false 
  }
];

// Lista exclusiva de alimentos da rotina do Felipe com Sódio (mg) e Açúcar (g)
export const INITIAL_FOODS: FoodItem[] = [
  // Rotina Café / Lanches
  {
    id: 'food-leite-nescau',
    name: 'Leite semidesnatado com Nescau',
    portion: '1 copo (200ml leite + 2 colheres sopa / 20g Nescau)',
    calories: 165,
    protein: 6.7,
    carbs: 27.0,
    fat: 3.2,
    sodium: 130, // 100mg leite + 30mg Nescau
    sugar: 25.0, // 15g Nescau adicionado + 10g lactose
    category: 'Bebidas'
  },
  {
    id: 'food-coca-zero-pepsi-black',
    name: 'Coca-Cola Zero / Pepsi Black',
    portion: '1 lata (350ml)',
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    sodium: 49,
    sugar: 0.0,
    category: 'Bebidas'
  },
  {
    id: 'food-guarana-tradicional',
    name: 'Guaraná Antarctica (Tradicional)',
    portion: '1 lata (350ml)',
    calories: 140,
    protein: 0.0,
    carbs: 35.0,
    fat: 0.0,
    sodium: 21,
    sugar: 35.0, // 35g de açúcar livre!
    category: 'Bebidas'
  },
  {
    id: 'food-omelete-2-ovos',
    name: 'Omelete (com 2 ovos e sal)',
    portion: '1 porção (2 ovos médios + pitada de sal)',
    calories: 155,
    protein: 13.0,
    carbs: 1.0,
    fat: 11.0,
    sodium: 540, // 140mg natural dos ovos + ~400mg pitada de sal
    sugar: 0.8,
    category: 'Ovos & Proteínas'
  },
  {
    id: 'food-crepioca-2-ovos',
    name: 'Crepioca (com 2 ovos e sal)',
    portion: '1 unidade (2 ovos + 30g goma tapioca + pitada de sal)',
    calories: 225,
    protein: 13.0,
    carbs: 18.5,
    fat: 11.0,
    sodium: 540, // 140mg natural + ~400mg pitada de sal
    sugar: 0.8,
    category: 'Lanches'
  },
  {
    id: 'food-pao-margarina-sanduicheira',
    name: '2 fatias de pão de forma com margarina com sal no meio (feito na sanduicheira)',
    portion: '1 sanduíche prensado (2 fatias + 10g margarina c/ sal)',
    calories: 197,
    protein: 4.2,
    carbs: 24.0,
    fat: 9.5,
    sodium: 335, // 240mg pão + 95mg margarina com sal
    sugar: 2.5,
    category: 'Sanduíches'
  },
  {
    id: 'food-pao-requeijao-sanduicheira',
    name: '2 fatias de pão de forma com requeijão light no meio (feito na sanduicheira)',
    portion: '1 sanduíche prensado (2 fatias + 30g requeijão light)',
    calories: 179,
    protein: 8.0,
    carbs: 25.0,
    fat: 5.4,
    sodium: 390, // 240mg pão + 150mg requeijão light
    sugar: 3.5,
    category: 'Sanduíches'
  },
  {
    id: 'food-miojo-tomate',
    name: 'Miojo (de tomate)',
    portion: '1 pacote (85g - Nissin Lámen Tomate)',
    calories: 370,
    protein: 7.5,
    carbs: 51.0,
    fat: 15.0,
    sodium: 1550, // 1.550 mg de sódio no pacote c/ tempero!
    sugar: 4.0,
    category: 'Refeições Rápidas'
  },

  // Fast Food & Lanches Especiais
  {
    id: 'food-cheddar-mcmelt',
    name: 'Cheddar McMelt (McDonald\'s)',
    portion: '1 sanduíche (218g)',
    calories: 568,
    protein: 31.0,
    carbs: 34.0,
    fat: 34.0,
    sodium: 1077, // Rico em sódio pelo queijo cheddar e shoyu
    sugar: 8.0,
    category: 'Fast Food'
  },
  {
    id: 'food-big-mac',
    name: 'Big Mac (McDonald\'s)',
    portion: '1 sanduíche (210g)',
    calories: 503,
    protein: 27.0,
    carbs: 45.0,
    fat: 24.0,
    sodium: 843,
    sugar: 8.5,
    category: 'Fast Food'
  },
  {
    id: 'food-batata-media-fastfood',
    name: 'Batata Frita Média (McDonald\'s / Burger King)',
    portion: '1 porção média (~100g)',
    calories: 295,
    protein: 4.0,
    carbs: 38.0,
    fat: 14.5,
    sodium: 225,
    sugar: 0.3,
    category: 'Fast Food'
  }
];

// As 5 refeições solicitadas (Café da Manhã, Almoço, Lanche, Jantar e Ceia)
export const MEALS_CONFIG = [
  { id: 'cafe', title: 'Café da Manhã', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', time: '07:00 - 09:30' },
  { id: 'almoco', title: 'Almoço', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', time: '12:00 - 14:00' },
  { id: 'lanche', title: 'Lanche da Tarde', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', time: '16:00 - 17:30' },
  { id: 'jantar', title: 'Jantar', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', time: '19:30 - 21:00' },
  { id: 'ceia', title: 'Ceia', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', time: '21:30 - 23:30' }
];

// Parâmetros científicos e de saúde para café, sódio e açúcar
export const MAX_SAFE_CAFFEINE_MG = 400; // Limite máximo diário recomendado pela FDA / EFSA
export const MAX_RECOMMENDED_SODIUM_MG = 2000; // Limite máximo de sódio recomendado pela OMS / SBC (5g de sal)
export const MAX_RECOMMENDED_SUGAR_G = 30; // Limite máximo de açúcar livre diário OMS
export const CAFFEINE_PER_ML = 0.8;
