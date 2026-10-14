export interface ExerciseType {
  id: string;
  name: string;
  category: 'musculacao' | 'cardio' | 'luta' | 'esporte' | 'mobilidade';
  met: number; // Metabolic Equivalent of Task
  iconName: string;
  description: string;
}

export const EXERCISE_TYPES: ExerciseType[] = [
  { id: 'w1', name: 'Musculação (Intensa / Hipertrofia)', category: 'musculacao', met: 6.0, iconName: 'Dumbbell', description: 'Treino de força, descanso curto e alta sobrecarga' },
  { id: 'w2', name: 'Musculação (Moderada / Geral)', category: 'musculacao', met: 4.0, iconName: 'Dumbbell', description: 'Treino resistido tradicional com pausas regulares' },
  { id: 'w3', name: 'Corrida na Esteira / Rua (8 a 10 km/h)', category: 'cardio', met: 9.8, iconName: 'Activity', description: 'Trote contínuo moderado a intenso' },
  { id: 'w4', name: 'Caminhada Rápida (5 a 6 km/h)', category: 'cardio', met: 3.8, iconName: 'Footprints', description: 'Caminhada acelerada para queima de gordura' },
  { id: 'w5', name: 'Ciclismo / Bike Ergométrica', category: 'cardio', met: 6.8, iconName: 'Bike', description: 'Pedalada contínua em ritmo moderado' },
  { id: 'w6', name: 'Pular Corda', category: 'cardio', met: 10.0, iconName: 'Zap', description: 'Cardio de alta intensidade e queima rápida' },
  { id: 'w7', name: 'Natação (Crawl)', category: 'cardio', met: 7.0, iconName: 'Waves', description: 'Estilo livre contínuo em ritmo médio' },
  { id: 'w8', name: 'Luta / Boxe / Muay Thai', category: 'luta', met: 8.5, iconName: 'Shield', description: 'Treino de rounds, socos, chutes e esquivas' },
  { id: 'w9', name: 'Alongamento / Yoga / Mobilidade', category: 'mobilidade', met: 2.5, iconName: 'Heart', description: 'Recuperação articular, postura e flexibilidade' }
];

export function calculateCaloriesBurned(met: number, weightKg: number, minutes: number): number {
  // Fórmula científica padrão: Gasto (kcal) = MET * Peso(kg) * (Minutos / 60)
  return Math.round(met * weightKg * (minutes / 60));
}
