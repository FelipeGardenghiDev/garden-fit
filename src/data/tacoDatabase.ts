export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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

// Lista exclusiva de alimentos da rotina do Felipe
export const INITIAL_FOODS: FoodItem[] = [
  {
    id: 'food-leite-nescau',
    name: 'Leite semidesnatado com Nescau',
    portion: '1 copo (200ml leite + 2 colheres sopa / 20g Nescau)',
    calories: 165,
    protein: 6.7,
    carbs: 27.0,
    fat: 3.2,
    category: 'Bebidas'
  },
  {
    id: 'food-omelete-2-ovos',
    name: 'Omelete (com 2 ovos)',
    portion: '1 porção (2 ovos médios)',
    calories: 155,
    protein: 13.0,
    carbs: 1.0,
    fat: 11.0,
    category: 'Ovos & Proteínas'
  },
  {
    id: 'food-crepioca-2-ovos',
    name: 'Crepioca (com 2 ovos)',
    portion: '1 unidade (2 ovos + 30g goma tapioca)',
    calories: 225,
    protein: 13.0,
    carbs: 18.5,
    fat: 11.0,
    category: 'Lanches'
  },
  {
    id: 'food-pao-manteiga-sanduicheira',
    name: '2 fatias de pão de forma com manteiga no meio (feito na sanduicheira)',
    portion: '1 sanduíche prensado (2 fatias + 10g manteiga)',
    calories: 199,
    protein: 4.3,
    carbs: 24.0,
    fat: 9.7,
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
    category: 'Refeições Rápidas'
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

// Parâmetros científicos e de saúde para o café
export const MAX_SAFE_CAFFEINE_MG = 400; // Limite máximo diário recomendado pela FDA / EFSA
export const CAFFEINE_PER_ML = 0.8; // ~0.8mg de cafeína por ml de café coado padrão
