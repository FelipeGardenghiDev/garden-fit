import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Utensils, Plus, Trash2, Calculator,
  Check, Search, PlusCircle, Droplets,
  Coffee, Pill, Scale, AlertTriangle,
  Download, Upload, RefreshCw, X, Sparkles, HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_FOODS, 
  MEALS_CONFIG, 
  INITIAL_USER_STATS,
  INITIAL_MEDICATIONS,
  MAX_SAFE_CAFFEINE_MG,
  MAX_RECOMMENDED_SODIUM_MG,
  MAX_RECOMMENDED_SUGAR_G,
  FoodItem, 
  MealFoodItem, 
  UserStats, 
  DailyGoals,
  MedicationItem,
  WeightEntry
} from './data/tacoDatabase';

const STORAGE_VERSION_TAG = 'bodymonitor_routine_v5';

export function App() {
  // Garantir migração inicial para a nova rotina personalizada com novos itens (fast food e bebidas)
  if (typeof window !== 'undefined') {
    const isV5 = localStorage.getItem(STORAGE_VERSION_TAG) === 'true';
    if (!isV5) {
      localStorage.setItem('bodymonitor_foods', JSON.stringify(INITIAL_FOODS));
      localStorage.setItem('bodymonitor_meds', JSON.stringify(INITIAL_MEDICATIONS));
      localStorage.setItem('bodymonitor_goals', JSON.stringify({
        calories: 1850,
        protein: 150,
        carbs: 180,
        fat: 55,
        sodiumLimit: MAX_RECOMMENDED_SODIUM_MG,
        sugarLimit: MAX_RECOMMENDED_SUGAR_G
      }));
      
      const currentMealsStr = localStorage.getItem('bodymonitor_meals');
      const parsedMeals = currentMealsStr ? JSON.parse(currentMealsStr) : {};
      parsedMeals.cafe = parsedMeals.cafe || [];
      parsedMeals.almoco = parsedMeals.almoco || [];
      parsedMeals.lanche = parsedMeals.lanche || [];
      parsedMeals.jantar = parsedMeals.jantar || [];
      parsedMeals.ceia = parsedMeals.ceia || [];
      localStorage.setItem('bodymonitor_meals', JSON.stringify(parsedMeals));
      
      localStorage.setItem(STORAGE_VERSION_TAG, 'true');
    }
  }

  // Aba ativa de navegação mobile
  const [activeTab, setActiveTab] = useState<'meals' | 'water_coffee' | 'meds' | 'weight'>('meals');

  // 1. Perfil personalizado do Felipe (75kg -> 65kg, 1.74m)
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('bodymonitor_stats');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATS;
  });

  // 2. Metas diárias calculadas (com déficit para 65kg, sódio 2000mg e açúcar 30g)
  const [goals, setGoals] = useState<DailyGoals>(() => {
    const saved = localStorage.getItem('bodymonitor_goals');
    return saved ? JSON.parse(saved) : { 
      calories: 1850, 
      protein: 150, 
      carbs: 180, 
      fat: 55, 
      sodiumLimit: MAX_RECOMMENDED_SODIUM_MG, 
      sugarLimit: MAX_RECOMMENDED_SUGAR_G 
    };
  });

  // 3. Alimentos & Refeições
  const [foodsList, setFoodsList] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('bodymonitor_foods');
    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });

  const [meals, setMeals] = useState<Record<string, MealFoodItem[]>>(() => {
    const saved = localStorage.getItem('bodymonitor_meals');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        cafe: parsed.cafe || [],
        almoco: parsed.almoco || [],
        lanche: parsed.lanche || [],
        jantar: parsed.jantar || [],
        ceia: parsed.ceia || []
      };
    }
    return {
      cafe: [],
      almoco: [],
      lanche: [],
      jantar: [],
      ceia: []
    };
  });

  // 4. Hidratação (ml)
  const [waterMl, setWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem('bodymonitor_water_ml');
    return saved ? JSON.parse(saved) : 500;
  });

  // 5. Monitor de Café & Cafeína discriminado por copos plásticos (50ml e 200ml)
  const [coffeeSmallCups, setCoffeeSmallCups] = useState<number>(() => {
    const saved = localStorage.getItem('bodymonitor_coffee_small_cups');
    return saved ? JSON.parse(saved) : 0;
  });
  const [coffeeLargeCups, setCoffeeLargeCups] = useState<number>(() => {
    const saved = localStorage.getItem('bodymonitor_coffee_large_cups');
    return saved ? JSON.parse(saved) : 0;
  });
  const [lastCoffeeTime, setLastCoffeeTime] = useState<string | null>(() => {
    return localStorage.getItem('bodymonitor_last_coffee') || null;
  });

  // 6. Checklist de Remédios (Omeprazol e Olmesartana às 08:00)
  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    const saved = localStorage.getItem('bodymonitor_meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  // 7. Histórico de Pesagem (75kg -> 65kg)
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem('bodymonitor_weight_history');
    return saved ? JSON.parse(saved) : [
      { id: 'w1', date: new Date().toLocaleDateString('pt-BR'), weight: 75.0 }
    ];
  });
  const [newWeightInput, setNewWeightInput] = useState<string>('75.0');

  // Modais e UI
  const [activeMealModal, setActiveMealModal] = useState<string | null>(null);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState<boolean>(false);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState<boolean>(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedMultiplier, setSelectedMultiplier] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form novo alimento com sódio e açúcar
  const [newFood, setNewFood] = useState({
    name: '', 
    portion: '1 porção', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '', 
    sodium: '', 
    sugar: '', 
    category: 'Personalizado'
  });

  // Form novo remédio
  const [newMed, setNewMed] = useState({
    name: '', dosage: '1 comprimido', scheduledTime: '08:00'
  });

  // Persistência automática em LocalStorage (armazenamento permanente do APK no celular)
  useEffect(() => { localStorage.setItem('bodymonitor_stats', JSON.stringify(userStats)); }, [userStats]);
  useEffect(() => { localStorage.setItem('bodymonitor_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('bodymonitor_foods', JSON.stringify(foodsList)); }, [foodsList]);
  useEffect(() => { localStorage.setItem('bodymonitor_meals', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('bodymonitor_water_ml', JSON.stringify(waterMl)); }, [waterMl]);
  useEffect(() => { localStorage.setItem('bodymonitor_coffee_small_cups', JSON.stringify(coffeeSmallCups)); }, [coffeeSmallCups]);
  useEffect(() => { localStorage.setItem('bodymonitor_coffee_large_cups', JSON.stringify(coffeeLargeCups)); }, [coffeeLargeCups]);
  useEffect(() => {
    if (lastCoffeeTime) {
      localStorage.setItem('bodymonitor_last_coffee', lastCoffeeTime);
    }
  }, [lastCoffeeTime]);
  useEffect(() => { localStorage.setItem('bodymonitor_meds', JSON.stringify(medications)); }, [medications]);
  useEffect(() => { localStorage.setItem('bodymonitor_weight_history', JSON.stringify(weightHistory)); }, [weightHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Meta hídrica recomendada: 35ml por kg corporal (75kg * 35ml = 2625ml)
  const waterGoalMl = useMemo(() => {
    const w = parseFloat(userStats.weight as unknown as string) || 75;
    return Math.round(w * 35);
  }, [userStats.weight]);

  const handleAddWater = (ml: number) => {
    setWaterMl(prev => {
      const next = Math.max(0, prev + ml);
      if (prev < waterGoalMl && next >= waterGoalMl) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast('🎉 Meta de hidratação de 2.6L batida hoje!');
      }
      return next;
    });
  };

  // Cálculos de Café e Cafeína
  // Copinho pequeno de café: 50 ml (~40 mg de cafeína)
  // Copo plástico comum: 200 ml (~160 mg de cafeína)
  const totalCoffeeMl = useMemo(() => {
    return (coffeeSmallCups * 50) + (coffeeLargeCups * 200);
  }, [coffeeSmallCups, coffeeLargeCups]);

  const totalCaffeineMg = useMemo(() => {
    return (coffeeSmallCups * 40) + (coffeeLargeCups * 160);
  }, [coffeeSmallCups, coffeeLargeCups]);

  const caffeinePct = Math.min(100, Math.round((totalCaffeineMg / MAX_SAFE_CAFFEINE_MG) * 100));

  const handleAddSmallCoffee = (delta: number) => {
    const next = Math.max(0, coffeeSmallCups + delta);
    setCoffeeSmallCups(next);
    if (delta > 0) {
      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastCoffeeTime(nowTime);
      showToast(`+1 Copinho (50ml) registrado às ${nowTime}!`);
    }
  };

  const handleAddLargeCoffee = (delta: number) => {
    const next = Math.max(0, coffeeLargeCups + delta);
    setCoffeeLargeCups(next);
    if (delta > 0) {
      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastCoffeeTime(nowTime);
      showToast(`+1 Copo Comum (200ml) registrado às ${nowTime}!`);
    }
  };

  const handleResetCoffee = () => {
    setCoffeeSmallCups(0);
    setCoffeeLargeCups(0);
    showToast('Consumo de café zerado para hoje!');
  };

  // Checklist de Remédios
  const handleToggleMedication = (id: string) => {
    setMedications(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.takenToday;
        const nowTime = nextState ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined;
        return { ...m, takenToday: nextState, takenAt: nowTime };
      }
      return m;
    }));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name.trim()) return;
    const item: MedicationItem = {
      id: `med_${Date.now()}`,
      name: newMed.name.trim(),
      dosage: newMed.dosage.trim() || '1 comprimido',
      scheduledTime: newMed.scheduledTime.trim() || '08:00',
      takenToday: false
    };
    setMedications(prev => [...prev, item]);
    setNewMed({ name: '', dosage: '1 comprimido', scheduledTime: '08:00' });
    setIsAddMedModalOpen(false);
    showToast('Medicamento adicionado ao checklist!');
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    showToast('Medicamento removido.');
  };

  const handleResetDailyMeds = () => {
    setMedications(prev => prev.map(m => ({ ...m, takenToday: false, takenAt: undefined })));
    showToast('Checklist de remédios resetado para hoje!');
  };

  // Alimentos das Refeições
  const handleAddFoodToMeal = (food: FoodItem, mealId: string) => {
    const mult = selectedMultiplier[food.id] || 1;
    const item: MealFoodItem = {
      ...food,
      uid: `${food.id}_${Date.now()}`,
      foodId: food.id,
      multiplier: mult
    };

    setMeals(prev => ({
      ...prev,
      [mealId]: [...(prev[mealId] || []), item]
    }));

    setActiveMealModal(null);
    showToast(`Adicionado ${food.name} (${mult}x)`);
  };

  const handleRemoveMealItem = (mealId: string, uid: string) => {
    setMeals(prev => ({
      ...prev,
      [mealId]: (prev[mealId] || []).filter(item => item.uid !== uid)
    }));
  };

  // Criar alimento personalizado com Sódio e Açúcar
  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim()) return;

    const prot = parseFloat(newFood.protein) || 0;
    const carb = parseFloat(newFood.carbs) || 0;
    const fat = parseFloat(newFood.fat) || 0;
    const sod = parseFloat(newFood.sodium) || 0;
    const sug = parseFloat(newFood.sugar) || 0;
    const cals = Math.round((prot * 4) + (carb * 4) + (fat * 9));

    const customItem: FoodItem = {
      id: `custom_${Date.now()}`,
      name: newFood.name.trim(),
      portion: newFood.portion.trim() || '1 porção',
      calories: cals,
      protein: prot,
      carbs: carb,
      fat: fat,
      sodium: sod,
      sugar: sug,
      category: newFood.category.trim() || 'Personalizado'
    };

    setFoodsList(prev => [customItem, ...prev]);
    setIsCustomFoodModalOpen(false);
    setNewFood({ 
      name: '', 
      portion: '1 porção', 
      calories: '', 
      protein: '', 
      carbs: '', 
      fat: '', 
      sodium: '', 
      sugar: '', 
      category: 'Personalizado' 
    });
    showToast('Alimento cadastrado com sucesso!');
  };

  // Registrar nova pesagem
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeightInput);
    if (!w || isNaN(w)) return;

    setUserStats(prev => ({ ...prev, weight: w }));
    const newEntry: WeightEntry = {
      id: `w_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      weight: w
    };
    setWeightHistory(prev => [newEntry, ...prev]);
    showToast(`Peso atualizado para ${w} kg!`);
  };

  // Totais consumidos no dia (soma de todas as 5 refeições, incluindo sódio e açúcar)
  const dailyTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let sodium = 0;
    let sugar = 0;

    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        calories += item.calories * item.multiplier;
        protein += item.protein * item.multiplier;
        carbs += item.carbs * item.multiplier;
        fat += item.fat * item.multiplier;
        sodium += (item.sodium || 0) * item.multiplier;
        sugar += (item.sugar || 0) * item.multiplier;
      });
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      sodium: Math.round(sodium),
      sugar: Math.round(sugar * 10) / 10
    };
  }, [meals]);

  // "O QUE ESTÁ ME FALTANDO HOJE" - Balanço de Nutrientes
  const missingNutrients = useMemo(() => {
    const sodLimit = goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG;
    const sugLimit = goals.sugarLimit || MAX_RECOMMENDED_SUGAR_G;

    return {
      calories: Math.max(0, goals.calories - dailyTotals.calories),
      protein: Math.max(0, goals.protein - dailyTotals.protein),
      carbs: Math.max(0, goals.carbs - dailyTotals.carbs),
      fat: Math.max(0, goals.fat - dailyTotals.fat),
      sodiumRemaining: Math.max(0, sodLimit - dailyTotals.sodium),
      sodiumExcess: Math.max(0, dailyTotals.sodium - sodLimit),
      sugarRemaining: Math.max(0, sugLimit - dailyTotals.sugar),
      sugarExcess: Math.max(0, dailyTotals.sugar - sugLimit)
    };
  }, [goals, dailyTotals]);

  // Categorias dinâmicas baseadas na lista de alimentos atual
  const categories = useMemo(() => {
    const cats = Array.from(new Set(foodsList.map(f => f.category)));
    return ['Todos', ...cats];
  }, [foodsList]);

  const filteredFoods = useMemo(() => {
    return foodsList.filter(food => {
      const matchQuery = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Todos' || food.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [foodsList, searchQuery, selectedCategory]);

  // Exportar Backup JSON com 1 Clique
  const handleExportBackup = () => {
    const backupData = {
      userStats,
      goals,
      meals,
      waterMl,
      coffeeSmallCups,
      coffeeLargeCups,
      medications,
      weightHistory,
      foodsList,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bodymonitor_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Backup exportado com sucesso!');
  };

  // Restaurar Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.userStats) setUserStats(parsed.userStats);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.meals) setMeals(parsed.meals);
        if (parsed.waterMl !== undefined) setWaterMl(parsed.waterMl);
        if (parsed.coffeeSmallCups !== undefined) setCoffeeSmallCups(parsed.coffeeSmallCups);
        if (parsed.coffeeLargeCups !== undefined) setCoffeeLargeCups(parsed.coffeeLargeCups);
        if (parsed.medications) setMedications(parsed.medications);
        if (parsed.weightHistory) setWeightHistory(parsed.weightHistory);
        if (parsed.foodsList) setFoodsList(parsed.foodsList);
        showToast('Dados restaurados com sucesso!');
      } catch {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  // Progresso do peso: 75kg até 65kg
  const weightProgressPct = Math.max(0, Math.min(100, Math.round(((75 - userStats.weight) / (75 - userStats.targetWeight)) * 100)));
  const totalWeightToLose = (userStats.weight - userStats.targetWeight).toFixed(1);

  // Contagem de remédios tomados
  const takenMedsCount = medications.filter(m => m.takenToday).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Fixo Mobile */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
              BM
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                BodyMonitor
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Felipe &middot; 75➔65kg
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Nutrição, Hidratação, Sódio & Saúde</p>
            </div>
          </div>

          <button
            onClick={() => setIsGoalsModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
            title="Ajustar Metas Diárias"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold">{goals.calories} kcal</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal com Abas */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        {/* =========================================================================
            ABA 1: NUTRIENTES, SÓDIO, AÇÚCAR & AS 5 REFEIÇÕES (COM CEIA)
        ========================================================================= */}
        {activeTab === 'meals' && (
          <div className="space-y-4">
            {/* Bloco de Resumo Calórico & "O Que Está Me Faltando" */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Balanço Diário
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono">{dailyTotals.calories}</span>
                    <span className="text-xs text-slate-400 font-mono">/ {goals.calories} kcal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Restante</span>
                  <span className={`text-base font-black font-mono ${
                    missingNutrients.calories > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {missingNutrients.calories > 0 ? `-${missingNutrients.calories}` : 'Meta Atingida!'}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso de Calorias */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((dailyTotals.calories / goals.calories) * 100))}%` }}
                />
              </div>

              {/* Status "O QUE ESTÁ FALTANDO HOJE" - Macronutrientes */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Macronutrientes
                  </span>
                  <span className="text-[10px] text-slate-500">Meta: 150g prot</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-rose-400 font-bold block">Proteína</span>
                    <span className="text-sm font-black text-white">{dailyTotals.protein}g</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {missingNutrients.protein > 0 ? `Falta ${missingNutrients.protein}g` : '✅ Atingida'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold block">Carboidrato</span>
                    <span className="text-sm font-black text-white">{dailyTotals.carbs}g</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {missingNutrients.carbs > 0 ? `Resta ${missingNutrients.carbs}g` : '✅ Limite'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-sky-400 font-bold block">Gordura</span>
                    <span className="text-sm font-black text-white">{dailyTotals.fat}g</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {missingNutrients.fat > 0 ? `Resta ${missingNutrients.fat}g` : '✅ Limite'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NOVO: MONITOR DE SÓDIO & AÇÚCAR */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <HeartPulse className="w-3.5 h-3.5" />
                    Monitor de Sódio & Açúcar (Saúde Cardiovascular)
                  </span>
                  <span className="text-[9px] text-slate-500">Diretriz OMS</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-center">
                  {/* Card de Sódio */}
                  <div className={`p-2.5 rounded-xl border transition ${
                    dailyTotals.sodium > (goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG)
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                      : dailyTotals.sodium >= 1600
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block">Sódio Diário</span>
                    <span className="text-base font-black font-mono text-white block mt-0.5">
                      {dailyTotals.sodium} <span className="text-[10px] font-normal text-slate-400">/ {goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG} mg</span>
                    </span>
                    <span className={`text-[10px] font-bold block mt-1 ${
                      dailyTotals.sodium > (goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG)
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}>
                      {dailyTotals.sodium > (goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG)
                        ? `⚠️ +${missingNutrients.sodiumExcess}mg acima`
                        : `Resta ${missingNutrients.sodiumRemaining}mg`}
                    </span>
                  </div>

                  {/* Card de Açúcar */}
                  <div className={`p-2.5 rounded-xl border transition ${
                    dailyTotals.sugar > (goals.sugarLimit || MAX_RECOMMENDED_SUGAR_G)
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                      : dailyTotals.sugar >= 25
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Açúcar Diário</span>
                    <span className="text-base font-black font-mono text-white block mt-0.5">
                      {dailyTotals.sugar} <span className="text-[10px] font-normal text-slate-400">/ {goals.sugarLimit || MAX_RECOMMENDED_SUGAR_G} g</span>
                    </span>
                    <span className={`text-[10px] font-bold block mt-1 ${
                      dailyTotals.sugar > (goals.sugarLimit || MAX_RECOMMENDED_SUGAR_G)
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}>
                      {dailyTotals.sugar > (goals.sugarLimit || MAX_RECOMMENDED_SUGAR_G)
                        ? `⚠️ +${missingNutrients.sugarExcess}g acima`
                        : `Resta ${missingNutrients.sugarRemaining}g`}
                    </span>
                  </div>
                </div>

                {/* Alerta de Sódio para quem toma Olmesartana */}
                {dailyTotals.sodium > (goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG) && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[10px] text-rose-300 leading-snug flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Atenção à Olmesartana:</strong> Seu sódio ultrapassou 2.000 mg hoje ({dailyTotals.sodium} mg). O excesso de sódio retém líquidos e sobrecarrega a pressão arterial. Beba água para ajudar a excretar o excesso.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* As 5 Refeições (Café, Almoço, Lanche, Jantar e Ceia) */}
            <div className="space-y-3">
              {MEALS_CONFIG.map(meal => {
                const items = meals[meal.id] || [];
                const mealCals = items.reduce((s, i) => s + (i.calories * i.multiplier), 0);
                const mealProt = items.reduce((s, i) => s + (i.protein * i.multiplier), 0);
                const mealSod = items.reduce((s, i) => s + ((i.sodium || 0) * i.multiplier), 0);
                const mealSug = items.reduce((s, i) => s + ((i.sugar || 0) * i.multiplier), 0);

                return (
                  <div key={meal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${meal.bg} ${meal.color}`}>
                          <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">{meal.title}</h3>
                          <span className="text-[10px] text-slate-400">{meal.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">{Math.round(mealCals)} kcal</span>
                          <span className="text-[10px] text-rose-400 font-mono block">{Math.round(mealProt)}g prot</span>
                        </div>
                        <button
                          onClick={() => setActiveMealModal(meal.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-black text-emerald-400 transition cursor-pointer"
                          title={`Adicionar alimento ao ${meal.title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Resumo de Sódio e Açúcar da refeição se houver itens */}
                    {items.length > 0 && (
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 px-1">
                        <span className="flex items-center gap-1">
                          <strong className="text-cyan-400">{Math.round(mealSod)} mg</strong> sódio
                        </span>
                        <span className="text-slate-600">&middot;</span>
                        <span className="flex items-center gap-1">
                          <strong className="text-amber-400">{Math.round(mealSug * 10) / 10} g</strong> açúcar
                        </span>
                      </div>
                    )}

                    {items.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1.5 text-center bg-slate-950/40 rounded-xl">
                        Nenhum alimento registrado. Toque no + para adicionar.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {items.map(item => (
                          <div key={item.uid} className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="pr-2">
                                <span className="font-semibold text-slate-200 block">{item.name}</span>
                                <span className="text-[10px] text-slate-500">({item.multiplier}x {item.portion})</span>
                              </div>
                              <div className="flex items-center gap-2.5 shrink-0">
                                <span className="font-mono text-emerald-400 font-bold">{Math.round(item.calories * item.multiplier)} kcal</span>
                                <button
                                  onClick={() => handleRemoveMealItem(meal.id, item.uid)}
                                  className="text-slate-600 hover:text-rose-400 p-0.5 cursor-pointer"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Detalhes de macros, sódio e açúcar do item */}
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono border-t border-slate-900 pt-1">
                              <span>P: {Math.round(item.protein * item.multiplier)}g</span>
                              <span>&middot;</span>
                              <span>C: {Math.round(item.carbs * item.multiplier)}g</span>
                              <span>&middot;</span>
                              <span className="text-cyan-400">Na: {Math.round((item.sodium || 0) * item.multiplier)}mg</span>
                              <span>&middot;</span>
                              <span className="text-amber-400">Açúcar: {Math.round((item.sugar || 0) * item.multiplier)}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: HIDRATAÇÃO (2.6L) & MONITOR DE CAFÉ COM LIMITE SEGURO (400mg)
        ========================================================================= */}
        {activeTab === 'water_coffee' && (
          <div className="space-y-4">
            {/* Bloco 1: Hidratação Diária */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-center">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Hidratação Diária</h3>
                    <p className="text-[10px] text-slate-400">Meta: 35ml/kg ({userStats.weight}kg = {waterGoalMl}ml)</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl">
                  {Math.round((waterMl / (waterGoalMl || 1)) * 100)}%
                </span>
              </div>

              {/* Indicador de Volume de Água */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-3xl font-black font-mono text-white block">
                  {waterMl} <span className="text-sm font-normal text-slate-400">/ {waterGoalMl} ml</span>
                </span>

                <div className="w-full h-3 bg-slate-900 rounded-full mt-3 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (waterMl / (waterGoalMl || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Botões Rápidos de Hidratação */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  onClick={() => handleAddWater(200)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+200ml</span>
                </button>
                <button
                  onClick={() => handleAddWater(300)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+300ml</span>
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+500ml</span>
                </button>
                <button
                  onClick={() => handleAddWater(1000)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+1.0L</span>
                </button>
              </div>

              {waterMl > 0 && (
                <button
                  onClick={() => handleAddWater(-250)}
                  className="text-[10px] text-slate-500 hover:text-rose-400 transition cursor-pointer"
                >
                  Desfazer (-250ml)
                </button>
              )}
            </div>

            {/* Bloco 2: Monitor & Limite Diário de Café com Discriminação de Copos */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    totalCaffeineMg > MAX_SAFE_CAFFEINE_MG 
                      ? 'bg-rose-500/10 text-rose-400' 
                      : totalCaffeineMg >= 300 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Consumo de Café & Cafeína</h3>
                    <p className="text-[10px] text-slate-400">Máximo seguro recomendado: 400 mg</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black font-mono block ${
                    totalCaffeineMg > MAX_SAFE_CAFFEINE_MG 
                      ? 'text-rose-400' 
                      : totalCaffeineMg >= 300 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                  }`}>
                    {totalCaffeineMg} / 400 mg
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total: {totalCoffeeMl} ml
                  </span>
                </div>
              </div>

              {/* Barra de Progresso da Cafeína vs Teto Máximo */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Ingestão de Cafeína</span>
                  <span className={
                    totalCaffeineMg > MAX_SAFE_CAFFEINE_MG 
                      ? 'text-rose-400 font-bold' 
                      : totalCaffeineMg >= 300 
                      ? 'text-amber-400 font-bold' 
                      : 'text-emerald-400 font-bold'
                  }>
                    {caffeinePct}% do limite máximo diário
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalCaffeineMg > MAX_SAFE_CAFFEINE_MG 
                        ? 'bg-rose-500' 
                        : totalCaffeineMg >= 300 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(caffeinePct, totalCaffeineMg > 0 ? 5 : 0))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
                  <span>0 mg</span>
                  <span>200 mg (Moderado)</span>
                  <span>400 mg (Teto Seguro)</span>
                </div>
              </div>

              {/* Status com Base no Máximo Diário Recomendado */}
              <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                totalCaffeineMg > MAX_SAFE_CAFFEINE_MG 
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  : totalCaffeineMg >= 300
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : totalCaffeineMg > 0
                  ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                {totalCaffeineMg > MAX_SAFE_CAFFEINE_MG ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="leading-snug">
                  {totalCaffeineMg > MAX_SAFE_CAFFEINE_MG 
                    ? '⚠️ Acima do teto máximo recomendado (400 mg)! Risco de sobrecarga cardíaca, agitação e ansiedade.'
                    : totalCaffeineMg >= 300
                    ? '🟡 Atenção: Próximo ao limite máximo diário de 400 mg de cafeína.'
                    : totalCaffeineMg > 0
                    ? '🟢 Consumo moderado dentro da faixa segura e saudável.'
                    : 'Nenhum café registrado hoje.'}
                </span>
              </div>

              {/* Discriminação por Tipos de Copos Plásticos */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Discriminação de Recipientes & Quantidade:
                </span>

                {/* Copinho de Plástico Pequeno (50ml) */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Copinho de Plástico Pequeno</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">50 ml</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      ~40 mg cafeína/copinho &middot; <strong className="text-slate-300">{coffeeSmallCups} tomados</strong> ({coffeeSmallCups * 50} ml)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {coffeeSmallCups > 0 && (
                      <button
                        onClick={() => handleAddSmallCoffee(-1)}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center transition cursor-pointer"
                        title="Desfazer 1 copinho"
                      >
                        -
                      </button>
                    )}
                    <button
                      onClick={() => handleAddSmallCoffee(1)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+50ml</span>
                    </button>
                  </div>
                </div>

                {/* Copo Plástico Comum (200ml) */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Copo Plástico Comum</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold">200 ml</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      ~160 mg cafeína/copo &middot; <strong className="text-slate-300">{coffeeLargeCups} tomados</strong> ({coffeeLargeCups * 200} ml)
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {coffeeLargeCups > 0 && (
                      <button
                        onClick={() => handleAddLargeCoffee(-1)}
                        className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center transition cursor-pointer"
                        title="Desfazer 1 copo"
                      >
                        -
                      </button>
                    )}
                    <button
                      onClick={() => handleAddLargeCoffee(1)}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+200ml</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Informações Médicas Educativas */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200 block mb-0.5">Diretriz Médica Internacional (FDA / EFSA):</strong>
                Para um adulto de 75 kg, o limite máximo diário de segurança é de <strong>400 mg de cafeína</strong> (~500 ml de café coado). Isso equivale a no máximo <strong>8 copinhos pequenos de 50 ml</strong> ou <strong>2 copos plásticos comuns de 200 ml</strong> por dia.
              </div>

              {lastCoffeeTime && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Último café registrado às <strong>{lastCoffeeTime}</strong></span>
                  {(coffeeSmallCups > 0 || coffeeLargeCups > 0) && (
                    <button
                      onClick={handleResetCoffee}
                      className="text-rose-400/80 hover:text-rose-300 transition cursor-pointer"
                    >
                      Zerar cafés hoje
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: CHECKLIST DE REMÉDIOS (OMEPRAZOL & OLMESARTANA ÀS 08:00)
        ========================================================================= */}
        {activeTab === 'meds' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Checklist de Remédios</h2>
                    <p className="text-[10px] text-slate-400">Rotina diária matinal às 08:00</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddMedModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo</span>
                </button>
              </div>

              {/* Barra de Progresso dos Remédios */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">
                  {takenMedsCount === medications.length && medications.length > 0
                    ? '🎉 Todos os remédios tomados hoje!'
                    : `${takenMedsCount} de ${medications.length} tomados hoje`}
                </span>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {medications.length > 0 ? Math.round((takenMedsCount / medications.length) * 100) : 0}%
                </span>
              </div>

              {/* Lista dos Remédios com Checkbox Largo */}
              <div className="space-y-2">
                {medications.map(med => (
                  <div
                    key={med.id}
                    onClick={() => handleToggleMedication(med.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      med.takenToday
                        ? 'bg-purple-950/20 border-purple-500/40 text-purple-100'
                        : 'bg-slate-950 border-slate-800/90 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                        med.takenToday
                          ? 'bg-purple-500 border-purple-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {med.takenToday && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div>
                        <span className={`text-xs font-bold block ${med.takenToday ? 'line-through text-slate-400' : 'text-white'}`}>
                          {med.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {med.dosage} &middot; {med.scheduledTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {med.takenToday ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {med.takenAt ? `Tomado às ${med.takenAt}` : 'Tomado'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedication(med.id);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remover remédio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px]">
                <button
                  onClick={handleResetDailyMeds}
                  className="text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resetar para novo dia</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: MEU PESO & METAS (75kg -> 65kg)
        ========================================================================= */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            {/* Meta de Perda de Peso */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    Meta de Peso: 75kg ➔ 65kg
                  </h3>
                  <p className="text-[10px] text-slate-400">Altura: {userStats.height}cm &middot; Meta: -10 kg</p>
                </div>

                <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                  {userStats.weight} kg atual
                </span>
              </div>

              {/* Barra de Progresso Rumo aos 65kg */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Início: 75.0 kg</span>
                  <span className="text-emerald-400 font-bold">Meta: 65.0 kg</span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, weightProgressPct)}%` }}
                  />
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs text-slate-300 font-bold">
                    {parseFloat(totalWeightToLose) <= 0 
                      ? '🎉 Parabéns! Você chegou nos 65kg!' 
                      : `Faltam ${totalWeightToLose} kg para alcançar o objetivo`}
                  </span>
                </div>
              </div>

              {/* Registro de Nova Pesagem */}
              <form onSubmit={handleLogWeight} className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  placeholder="Peso hoje (ex: 74.5)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Registrar
                </button>
              </form>

              {/* Histórico recente */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Histórico de Pesagens</span>
                {weightHistory.slice(0, 5).map(h => (
                  <div key={h.id} className="flex justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400">{h.date}</span>
                    <span className="font-mono font-bold text-white">{h.weight} kg</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Armazenamento & Backup Seguro */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                Seus Dados & Backup no Celular
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                No app APK, todos os seus dados ficam salvos na memória privada do seu smartphone. Você pode exportar um backup a qualquer momento para garantir que nunca perderá seu histórico:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleExportBackup}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Backup</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (4 Abas do BodyMonitor)
      ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 py-2.5 px-4 flex items-center justify-around max-w-md mx-auto shadow-2xl">
        <button
          onClick={() => setActiveTab('meals')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'meals' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">Nutrientes</span>
        </button>

        <button
          onClick={() => setActiveTab('water_coffee')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'water_coffee' ? 'text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Droplets className="w-5 h-5" />
          <span className="text-[10px]">Água & Café</span>
        </button>

        <button
          onClick={() => setActiveTab('meds')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'meds' ? 'text-purple-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px]">Remédios</span>
        </button>

        <button
          onClick={() => setActiveTab('weight')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'weight' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span className="text-[10px]">Meta 65kg</span>
        </button>
      </nav>

      {/* =========================================================================
          MODAL: ADICIONAR ALIMENTO À REFEIÇÃO
      ========================================================================= */}
      {activeMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  Adicionar ao {MEALS_CONFIG.find(m => m.id === activeMealModal)?.title}
                </h3>
                <p className="text-[10px] text-slate-400">Alimentos da sua rotina</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomFoodModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Cadastrar Novo</span>
                </button>
                <button
                  onClick={() => setActiveMealModal(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar na sua lista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredFoods.map(food => {
                const mult = selectedMultiplier[food.id] || 1;
                return (
                  <div key={food.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">{food.name}</span>
                      <span className="text-[10px] text-slate-400 block">{food.portion} &middot; <strong className="text-emerald-400">{food.calories} kcal</strong></span>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-0.5">
                        <span>P: {food.protein}g</span>
                        <span>&middot;</span>
                        <span className="text-cyan-400 font-bold">Na: {food.sodium || 0}mg</span>
                        <span>&middot;</span>
                        <span className="text-amber-400 font-bold">Açúcar: {food.sugar || 0}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={mult}
                        onChange={(e) => setSelectedMultiplier({ ...selectedMultiplier, [food.id]: parseFloat(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-white cursor-pointer"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                      </select>

                      <button
                        onClick={() => handleAddFoodToMeal(food, activeMealModal)}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOVO REMÉDIO NO CHECKLIST
      ========================================================================= */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-purple-400" />
                Adicionar ao Checklist
              </h3>
              <button onClick={() => setIsAddMedModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nome do Medicamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Omeprazol, Olmesartana"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Dosagem</label>
                <input
                  type="text"
                  placeholder="Ex: 2 comprimidos, 1 cápsula"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Horário Previsto</label>
                <input
                  type="text"
                  placeholder="Ex: 08:00 (Manhã)"
                  value={newMed.scheduledTime}
                  onChange={(e) => setNewMed({ ...newMed, scheduledTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Salvar no Checklist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALIMENTO PERSONALIZADO COM SÓDIO & AÇÚCAR
      ========================================================================= */}
      {isCustomFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                Cadastrar Alimento na sua Rotina
              </h3>
              <button onClick={() => setIsCustomFoodModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Nome do Alimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salada de Frutas com Granola"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Porção de Referência</label>
                <input
                  type="text"
                  placeholder="Ex: 1 prato, 1 pote, 2 fatias"
                  value={newFood.portion}
                  onChange={(e) => setNewFood({ ...newFood, portion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-rose-400 block mb-0.5">Prot (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-amber-400 block mb-0.5">Carb (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-sky-400 block mb-0.5">Gord (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-cyan-400 block mb-0.5">Sódio (mg)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Ex: 350"
                    value={newFood.sodium}
                    onChange={(e) => setNewFood({ ...newFood, sodium: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-amber-400 block mb-0.5">Açúcar (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 12"
                    value={newFood.sugar}
                    onChange={(e) => setNewFood({ ...newFood, sugar: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs mt-2 cursor-pointer shadow"
              >
                Salvar Alimento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DEFINIR METAS (CALORIAS, MACROS, SÓDIO & AÇÚCAR)
      ========================================================================= */}
      {isGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Ajustar Metas Nutricionais & Saúde
              </h3>
              <button onClick={() => setIsGoalsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Meta Calórica Diária (kcal)</label>
                <input
                  type="number"
                  value={goals.calories}
                  onChange={(e) => setGoals({ ...goals, calories: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-rose-400 block mb-1">Prot (g)</label>
                  <input
                    type="number"
                    value={goals.protein}
                    onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-amber-400 block mb-1">Carb (g)</label>
                  <input
                    type="number"
                    value={goals.carbs}
                    onChange={(e) => setGoals({ ...goals, carbs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-sky-400 block mb-1">Gord (g)</label>
                  <input
                    type="number"
                    value={goals.fat}
                    onChange={(e) => setGoals({ ...goals, fat: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-[9px] text-cyan-400 block mb-1">Limite Sódio (mg) [OMS: 2000]</label>
                  <input
                    type="number"
                    value={goals.sodiumLimit || MAX_RECOMMENDED_SODIUM_MG}
                    onChange={(e) => setGoals({ ...goals, sodiumLimit: parseInt(e.target.value) || 2000 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-amber-400 block mb-1">Limite Açúcar (g) [OMS: 30]</label>
                  <input
                    type="number"
                    value={goals.sugarLimit || MAX_RECOMMENDED_SUGAR_G}
                    onChange={(e) => setGoals({ ...goals, sugarLimit: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <button
                onClick={() => { setIsGoalsModalOpen(false); showToast('Metas salvas!'); }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer shadow"
              >
                Salvar Metas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
