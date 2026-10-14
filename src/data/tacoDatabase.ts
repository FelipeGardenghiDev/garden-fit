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
  weight: number;
  height: number;
  activity: string;
  objective: 'cut' | 'bulk' | 'maintain';
  proteinPerKg: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  type: string;
  title: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned: number;
  notes?: string;
}

// Base de dados inicial de alimentos típicos brasileiros (baseados na Tabela TACO/IBGE)
export const INITIAL_FOODS: FoodItem[] = [
  // Café da Manhã & Lanches
  { id: 'f1', name: 'Pão Francês', portion: '1 unidade (50g)', calories: 150, protein: 4.7, carbs: 29.3, fat: 1.5, category: 'Padaria' },
  { id: 'f2', name: 'Ovo de Galinha Cozido/Mexido', portion: '1 unidade média (50g)', calories: 73, protein: 6.6, carbs: 0.3, fat: 4.8, category: 'Proteínas' },
  { id: 'f3', name: 'Tapioca (Goma hidratada)', portion: '1 unidade média (80g)', calories: 192, protein: 0.1, carbs: 47.0, fat: 0.0, category: 'Carboidratos' },
  { id: 'f4', name: 'Cuscuz de Milho Cozido', portion: '1 fatia média (100g)', calories: 113, protein: 2.2, carbs: 25.3, fat: 0.7, category: 'Carboidratos' },
  { id: 'f5', name: 'Pão de Queijo', portion: '1 unidade média (40g)', calories: 145, protein: 3.1, carbs: 16.5, fat: 7.4, category: 'Padaria' },
  { id: 'f6', name: 'Queijo Minas Frescal', portion: '1 fatia média (30g)', calories: 79, protein: 5.2, carbs: 1.0, fat: 6.1, category: 'Laticínios' },
  { id: 'f7', name: 'Queijo Muçarela', portion: '1 fatia (20g)', calories: 66, protein: 4.5, carbs: 0.6, fat: 5.0, category: 'Laticínios' },
  { id: 'f8', name: 'Requeijão Light', portion: '1 colher de sopa (30g)', calories: 54, protein: 3.8, carbs: 1.0, fat: 3.9, category: 'Laticínios' },
  { id: 'f9', name: 'Leite Integral', portion: '1 copo (200ml)', calories: 120, protein: 6.0, carbs: 9.6, fat: 6.4, category: 'Laticínios' },
  { id: 'f10', name: 'Iogurte Natural Desnatado', portion: '1 pote (170g)', calories: 70, protein: 6.8, carbs: 9.8, fat: 0.3, category: 'Laticínios' },
  { id: 'f11', name: 'Aveia em Flocos', portion: '2 colheres de sopa (30g)', calories: 118, protein: 4.3, carbs: 20.0, fat: 2.5, category: 'Cereais' },
  { id: 'f12', name: 'Pasta de Amendoim Integral', portion: '1 colher de sopa (15g)', calories: 90, protein: 4.2, carbs: 2.4, fat: 7.5, category: 'Gorduras' },
  { id: 'f13', name: 'Whey Protein Concentrado', portion: '1 scoop (30g)', calories: 120, protein: 24.0, carbs: 3.0, fat: 1.5, category: 'Suplementos' },

  // Frutas
  { id: 'f14', name: 'Banana Prata', portion: '1 unidade média (65g)', calories: 64, protein: 0.8, carbs: 16.9, fat: 0.1, category: 'Frutas' },
  { id: 'f15', name: 'Mamão Papaia', portion: '1/2 unidade (140g)', calories: 56, protein: 0.7, carbs: 14.6, fat: 0.1, category: 'Frutas' },
  { id: 'f16', name: 'Maçã Fuji', portion: '1 unidade média (130g)', calories: 73, protein: 0.4, carbs: 19.8, fat: 0.0, category: 'Frutas' },
  { id: 'f17', name: 'Abacate', portion: '2 colheres de sopa (80g)', calories: 77, protein: 1.0, carbs: 4.8, fat: 6.7, category: 'Frutas' },
  { id: 'f18', name: 'Açaí na Tigela (Tradicional c/ Xarope)', portion: '1 tigela pequena (200g)', calories: 220, protein: 2.0, carbs: 42.0, fat: 5.0, category: 'Frutas' },

  // Almoço & Jantar - Carboidratos e Leguminosas
  { id: 'f19', name: 'Arroz Branco Cozido', portion: '100g (aprox. 4 col. sopa)', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, category: 'Prato Principal' },
  { id: 'f20', name: 'Arroz Integral Cozido', portion: '100g (aprox. 4 col. sopa)', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, category: 'Prato Principal' },
  { id: 'f21', name: 'Feijão Carioca Cozido (50% caldo)', portion: '1 concha média (100g)', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, category: 'Prato Principal' },
  { id: 'f22', name: 'Feijão Preto Cozido (50% caldo)', portion: '1 concha média (100g)', calories: 77, protein: 4.5, carbs: 14.0, fat: 0.5, category: 'Prato Principal' },
  { id: 'f23', name: 'Batata Doce Cozida', portion: '100g (1 rodela grande)', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, category: 'Carboidratos' },
  { id: 'f24', name: 'Mandioca (Aipim/Macaxeira) Cozida', portion: '100g (2 pedaços médios)', calories: 125, protein: 0.6, carbs: 30.1, fat: 0.3, category: 'Carboidratos' },
  { id: 'f25', name: 'Macarrão ao Sugo', portion: '1 pegador (100g)', calories: 135, protein: 4.2, carbs: 27.5, fat: 1.0, category: 'Prato Principal' },
  { id: 'f26', name: 'Farofa de Mandioca Pronta', portion: '1 colher de sopa (20g)', calories: 81, protein: 0.4, carbs: 16.0, fat: 1.8, category: 'Acompanhamentos' },

  // Almoço & Jantar - Proteínas
  { id: 'f27', name: 'Peito de Frango Grelhado', portion: '1 filé médio (100g)', calories: 159, protein: 32.0, carbs: 0.0, fat: 2.5, category: 'Proteínas' },
  { id: 'f28', name: 'Patinho Bovino Moído/Grelhado', portion: '1 porção média (100g)', calories: 219, protein: 35.9, carbs: 0.0, fat: 7.3, category: 'Proteínas' },
  { id: 'f29', name: 'Contrafilé Grelhado (sem gordura)', portion: '1 bife médio (100g)', calories: 194, protein: 32.4, carbs: 0.0, fat: 6.0, category: 'Proteínas' },
  { id: 'f30', name: 'Filé de Tilápia Grelhado', portion: '1 filé médio (100g)', calories: 128, protein: 26.0, carbs: 0.0, fat: 2.7, category: 'Proteínas' },
  { id: 'f31', name: 'Lombo Suíno Assado', portion: '1 fatia média (100g)', calories: 210, protein: 35.7, carbs: 0.0, fat: 6.4, category: 'Proteínas' },

  // Saladas & Gorduras
  { id: 'f32', name: 'Salada Verde (Alface, Tomate, Pepino)', portion: '1 prato cheio (100g)', calories: 18, protein: 1.0, carbs: 3.5, fat: 0.2, category: 'Vegetais' },
  { id: 'f33', name: 'Brócolis e Cenoura no Vapor', portion: '1 xícara (100g)', calories: 35, protein: 2.4, carbs: 7.0, fat: 0.3, category: 'Vegetais' },
  { id: 'f34', name: 'Azeite de Oliva Extra Virgem', portion: '1 colher de sopa (10ml)', calories: 88, protein: 0.0, carbs: 0.0, fat: 10.0, category: 'Gorduras' },
  { id: 'f35', name: 'Castanha-do-Pará', portion: '2 unidades (10g)', calories: 66, protein: 1.4, carbs: 1.2, fat: 6.6, category: 'Gorduras' }
];

export const MEALS_CONFIG = [
  { id: 'cafe', title: 'Café da Manhã', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', time: '07:00 - 09:30' },
  { id: 'almoco', title: 'Almoço', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', time: '12:00 - 14:00' },
  { id: 'lanche', title: 'Lanche da Tarde', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', time: '16:00 - 17:30' },
  { id: 'jantar', title: 'Jantar', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', time: '19:30 - 21:30' }
];

export const PRESET_DAYS = {
  cutting: {
    name: 'Dia Foco em Emagrecimento',
    meals: {
      cafe: [
        { uid: 'p1', foodId: 'f1', name: 'Pão Francês', portion: '1 unidade (50g)', multiplier: 1, calories: 150, protein: 4.7, carbs: 29.3, fat: 1.5, category: 'Padaria' },
        { uid: 'p2', foodId: 'f2', name: 'Ovo de Galinha Cozido/Mexido', portion: '1 unidade média (50g)', multiplier: 2, calories: 73, protein: 6.6, carbs: 0.3, fat: 4.8, category: 'Proteínas' }
      ],
      almoco: [
        { uid: 'p3', foodId: 'f19', name: 'Arroz Branco Cozido', portion: '100g (aprox. 4 col. sopa)', multiplier: 1, calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, category: 'Prato Principal' },
        { uid: 'p4', foodId: 'f21', name: 'Feijão Carioca Cozido (50% caldo)', portion: '1 concha média (100g)', multiplier: 1, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, category: 'Prato Principal' },
        { uid: 'p5', foodId: 'f27', name: 'Peito de Frango Grelhado', portion: '1 filé médio (100g)', multiplier: 1.5, calories: 159, protein: 32.0, carbs: 0.0, fat: 2.5, category: 'Proteínas' },
        { uid: 'p6', foodId: 'f32', name: 'Salada Verde (Alface, Tomate, Pepino)', portion: '1 prato cheio (100g)', multiplier: 1, calories: 18, protein: 1.0, carbs: 3.5, fat: 0.2, category: 'Vegetais' }
      ],
      lanche: [
        { uid: 'p7', foodId: 'f10', name: 'Iogurte Natural Desnatado', portion: '1 pote (170g)', multiplier: 1, calories: 70, protein: 6.8, carbs: 9.8, fat: 0.3, category: 'Laticínios' },
        { uid: 'p8', foodId: 'f13', name: 'Whey Protein Concentrado', portion: '1 scoop (30g)', multiplier: 1, calories: 120, protein: 24.0, carbs: 3.0, fat: 1.5, category: 'Suplementos' },
        { uid: 'p9', foodId: 'f14', name: 'Banana Prata', portion: '1 unidade média (65g)', multiplier: 1, calories: 64, protein: 0.8, carbs: 16.9, fat: 0.1, category: 'Frutas' }
      ],
      jantar: [
        { uid: 'p10', foodId: 'f28', name: 'Patinho Bovino Moído/Grelhado', portion: '1 porção média (100g)', multiplier: 1.2, calories: 219, protein: 35.9, carbs: 0.0, fat: 7.3, category: 'Proteínas' },
        { uid: 'p11', foodId: 'f23', name: 'Batata Doce Cozida', portion: '100g (1 rodela grande)', multiplier: 1.5, calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, category: 'Carboidratos' },
        { uid: 'p12', foodId: 'f34', name: 'Azeite de Oliva Extra Virgem', portion: '1 colher de sopa (10ml)', multiplier: 0.5, calories: 88, protein: 0.0, carbs: 0.0, fat: 10.0, category: 'Gorduras' }
      ]
    }
  }
};
