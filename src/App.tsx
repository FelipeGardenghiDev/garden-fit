import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Utensils, Plus, Trash2, Calculator,
  Check, Search, PlusCircle, Droplets,
  Coffee, Pill, Scale, AlertTriangle,
  Download, Upload, RefreshCw, X, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_FOODS, 
  MEALS_CONFIG, 
  INITIAL_USER_STATS,
  INITIAL_MEDICATIONS,
  FoodItem, 
  MealFoodItem, 
  UserStats, 
  DailyGoals,
  MedicationItem,
  WeightEntry
} from './data/tacoDatabase';

export function App() {
  // Aba ativa de navegação mobile
  const [activeTab, setActiveTab] = useState<'meals' | 'water_coffee' | 'meds' | 'weight'>('meals');

  // 1. Perfil personalizado do Felipe (75kg -> 65kg, 1.74m)
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('bodymonitor_stats');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATS;
  });

  // 2. Metas diárias calculadas (com déficit para 65kg)
  const [goals, setGoals] = useState<DailyGoals>(() => {
    const saved = localStorage.getItem('bodymonitor_goals');
    return saved ? JSON.parse(saved) : { calories: 1850, protein: 150, carbs: 180, fat: 55 };
  });

  // 3. Alimentos & Refeições
  const [foodsList, setFoodsList] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('bodymonitor_foods');
    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });

  const [meals, setMeals] = useState<Record<string, MealFoodItem[]>>(() => {
    const saved = localStorage.getItem('bodymonitor_meals');
    return saved ? JSON.parse(saved) : {
      cafe: [],
      almoco: [],
      lanche: [],
      jantar: []
    };
  });

  // 4. Hidratação (ml)
  const [waterMl, setWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem('bodymonitor_water_ml');
    return saved ? JSON.parse(saved) : 500;
  });

  // 5. Monitor de Café & Cafeína
  const [coffeeCups, setCoffeeCups] = useState<number>(() => {
    const saved = localStorage.getItem('bodymonitor_coffee_cups');
    return saved ? JSON.parse(saved) : 2;
  });
  const [coffeeLimit, setCoffeeLimit] = useState<number>(() => {
    const saved = localStorage.getItem('bodymonitor_coffee_limit');
    return saved ? JSON.parse(saved) : 3;
  });
  const [lastCoffeeTime, setLastCoffeeTime] = useState<string | null>(() => {
    return localStorage.getItem('bodymonitor_last_coffee') || null;
  });

  // 6. Checklist de Remédios & Suplementos
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

  // Form novo alimento
  const [newFood, setNewFood] = useState({
    name: '', portion: '100g', calories: '', protein: '', carbs: '', fat: '', category: 'Personalizado'
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
  useEffect(() => { localStorage.setItem('bodymonitor_coffee_cups', JSON.stringify(coffeeCups)); }, [coffeeCups]);
  useEffect(() => { localStorage.setItem('bodymonitor_coffee_limit', JSON.stringify(coffeeLimit)); }, [coffeeLimit]);
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
    const w = parseFloat(userStats.weight as any) || 75;
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

  // Registro de Café
  const handleAddCoffee = (cupsToAdd: number) => {
    const next = Math.max(0, coffeeCups + cupsToAdd);
    setCoffeeCups(next);
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setLastCoffeeTime(nowTime);

    if (next >= coffeeLimit) {
      showToast(`☕ Você atingiu o limite de ${coffeeLimit} cafés hoje!`);
    } else {
      showToast(`Café registrado às ${nowTime}!`);
    }
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
      scheduledTime: newMed.scheduledTime.trim() || 'Horário livre',
      takenToday: false
    };
    setMedications(prev => [...prev, item]);
    setIsAddMedModalOpen(false);
    setNewMed({ name: '', dosage: '1 comprimido', scheduledTime: '08:00' });
    showToast('Remédio adicionado ao seu checklist!');
  };

  const handleResetDailyMeds = () => {
    if (window.confirm('Deseja desmarcar todos os remédios para iniciar um novo dia?')) {
      setMedications(prev => prev.map(m => ({ ...m, takenToday: false, takenAt: undefined })));
      showToast('Checklist reiniciado para hoje!');
    }
  };

  // Registro de Pesagem (75kg -> 65kg)
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeightInput);
    if (!w || w <= 0) return;

    setUserStats(prev => ({ ...prev, weight: w }));
    const entry: WeightEntry = {
      id: `w_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      weight: w
    };
    setWeightHistory(prev => [entry, ...prev]);
    showToast(`Peso atualizado para ${w} kg!`);
  };

  // Totais consumidos no dia
  const dailyTotals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        calories += item.calories * item.multiplier;
        protein += item.protein * item.multiplier;
        carbs += item.carbs * item.multiplier;
        fat += item.fat * item.multiplier;
      });
    });
    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10
    };
  }, [meals]);

  // Déficit e O que Falta atingir
  const missingNutrients = useMemo(() => {
    const remCalories = Math.max(0, goals.calories - dailyTotals.calories);
    const remProtein = Math.max(0, Math.round((goals.protein - dailyTotals.protein) * 10) / 10);
    const remCarbs = Math.max(0, Math.round((goals.carbs - dailyTotals.carbs) * 10) / 10);
    const remFat = Math.max(0, Math.round((goals.fat - dailyTotals.fat) * 10) / 10);

    return {
      calories: remCalories,
      protein: remProtein,
      carbs: remCarbs,
      fat: remFat
    };
  }, [goals, dailyTotals]);

  // Alimentos filtrados
  const filteredFoods = useMemo(() => {
    return foodsList.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'Todos' || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [foodsList, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set(foodsList.map(f => f.category));
    return ['Todos', ...Array.from(set)];
  }, [foodsList]);

  const handleAddFoodToMeal = (food: FoodItem, mealId: string) => {
    const mult = selectedMultiplier[food.id] || 1;
    const newItem: MealFoodItem = {
      ...food,
      uid: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      foodId: food.id,
      multiplier: mult
    };

    setMeals(prev => ({
      ...prev,
      [mealId]: [...(prev[mealId] || []), newItem]
    }));

    setSelectedMultiplier(prev => ({ ...prev, [food.id]: 1 }));
    showToast(`${food.name} adicionado!`);
  };

  const handleRemoveMealItem = (mealId: string, uid: string) => {
    setMeals(prev => ({
      ...prev,
      [mealId]: prev[mealId].filter(item => item.uid !== uid)
    }));
  };

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name.trim()) return;
    const p = parseFloat(newFood.protein) || 0;
    const c = parseFloat(newFood.carbs) || 0;
    const f = parseFloat(newFood.fat) || 0;
    const cal = parseFloat(newFood.calories) || Math.round((p * 4) + (c * 4) + (f * 9));

    const created: FoodItem = {
      id: `custom_${Date.now()}`,
      name: newFood.name.trim(),
      portion: newFood.portion || '100g',
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      category: newFood.category || 'Personalizado'
    };

    setFoodsList(prev => [created, ...prev]);
    setIsCustomFoodModalOpen(false);
    setNewFood({ name: '', portion: '100g', calories: '', protein: '', carbs: '', fat: '', category: 'Personalizado' });
    showToast('Alimento cadastrado com sucesso!');
  };

  // Exportar Backup JSON com 1 Clique
  const handleExportBackup = () => {
    const backupData = {
      userStats,
      goals,
      meals,
      waterMl,
      coffeeCups,
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
        if (parsed.coffeeCups !== undefined) setCoffeeCups(parsed.coffeeCups);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-4 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400/30 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Scale className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-white">BodyMonitor</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                75kg ➔ 65kg
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Rotina Pessoal de Saúde</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'meals' && (
            <button
              onClick={() => setIsCustomFoodModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Alimento</span>
            </button>
          )}

          <button
            onClick={() => setIsGoalsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Metas</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* =========================================================================
            ABA 1: ALIMENTAÇÃO & NUTRIENTES (O QUE FALTA)
        ========================================================================= */}
        {activeTab === 'meals' && (
          <div className="space-y-4">
            {/* Card Principal: Calorias & Déficit */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Meta para 65kg (Cutting)</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-black text-white">{dailyTotals.calories}</span>
                    <span className="text-xs text-slate-400">/ {goals.calories} kcal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Restam Hoje</span>
                  <span className={`text-xl font-black font-mono ${missingNutrients.calories === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {missingNutrients.calories} kcal
                  </span>
                </div>
              </div>

              {/* Barra de Progresso de Calorias */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className={`h-full transition-all duration-500 ${
                    dailyTotals.calories > goals.calories ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (dailyTotals.calories / (goals.calories || 1)) * 100)}%` }}
                />
              </div>

              {/* Status "O QUE ESTÁ FALTANDO HOJE" */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Balanço de Nutrientes Restantes
                  </span>
                  <span className="text-[10px] text-slate-500">Meta Diária</span>
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
            </div>

            {/* As 4 Refeições */}
            <div className="space-y-3">
              {MEALS_CONFIG.map(meal => {
                const items = meals[meal.id] || [];
                const mealCals = items.reduce((s, i) => s + (i.calories * i.multiplier), 0);
                const mealProt = items.reduce((s, i) => s + (i.protein * i.multiplier), 0);

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
                          <span className="text-[10px] text-rose-400 font-mono">{Math.round(mealProt)}g prot</span>
                        </div>
                        <button
                          onClick={() => setActiveMealModal(meal.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-black text-emerald-400 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1.5 text-center bg-slate-950/40 rounded-xl">
                        Nenhum alimento registrado. Toque no + para adicionar.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {items.map(item => (
                          <div key={item.uid} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px]">
                            <div>
                              <span className="font-semibold text-slate-200">{item.name}</span>
                              <span className="text-[10px] text-slate-500 ml-1.5">({item.multiplier}x {item.portion})</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-emerald-400 font-bold">{Math.round(item.calories * item.multiplier)} kcal</span>
                              <button
                                onClick={() => handleRemoveMealItem(meal.id, item.uid)}
                                className="text-slate-600 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
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
            ABA 2: HIDRATAÇÃO (2.6L) & MONITOR DE CAFÉ (DESMAME)
        ========================================================================= */}
        {activeTab === 'water_coffee' && (
          <div className="space-y-4">
            {/* Bloco 1: Hidratação */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-center">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Hidratação Diária</h3>
                    <p className="text-[10px] text-slate-400">Meta de 35ml/kg ({userStats.weight}kg = {waterGoalMl}ml)</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl">
                  {Math.round((waterMl / (waterGoalMl || 1)) * 100)}%
                </span>
              </div>

              {/* Indicador de Volume */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-3xl font-black text-white">{waterMl}</span>
                <span className="text-xs font-bold text-slate-400 ml-1">/ {waterGoalMl} ml</span>
                
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-800">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (waterMl / (waterGoalMl || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Botões de Água */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleAddWater(200)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+200ml</span>
                </button>

                <button
                  onClick={() => handleAddWater(300)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+300ml</span>
                </button>

                <button
                  onClick={() => handleAddWater(500)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+500ml</span>
                </button>

                <button
                  onClick={() => handleAddWater(1000)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs font-bold transition flex flex-col items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>+1.0L</span>
                </button>
              </div>

              {waterMl > 0 && (
                <button
                  onClick={() => handleAddWater(-250)}
                  className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                >
                  Desfazer (-250ml)
                </button>
              )}
            </div>

            {/* Bloco 2: Monitor & Redução de Café */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    coffeeCups > coffeeLimit ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Consumo de Café</h3>
                    <p className="text-[10px] text-slate-400">Meta: Diminuir o excesso diário</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-base font-black font-mono ${
                    coffeeCups > coffeeLimit ? 'text-rose-400' : coffeeCups === coffeeLimit ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {coffeeCups} / {coffeeLimit} xícaras
                  </span>
                </div>
              </div>

              {/* Status do Café */}
              <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                coffeeCups > coffeeLimit 
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  : coffeeCups === coffeeLimit
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  {coffeeCups > coffeeLimit ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>
                    {coffeeCups > coffeeLimit 
                      ? '⚠️ Limite ultrapassado! Evite café agora para não prejudicar seu sono.'
                      : coffeeCups === coffeeLimit
                      ? '🟡 Limite atingido! Tente substituir o próximo por água.'
                      : '🟢 Consumo moderado dentro da meta.'}
                  </span>
                </div>
              </div>

              {lastCoffeeTime && (
                <p className="text-[10px] text-slate-500 text-center">
                  Último café registrado às <strong>{lastCoffeeTime}</strong>
                </p>
              )}

              {/* Botões de Ação de Café */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAddCoffee(1)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Xícara (Cafezinho)</span>
                </button>

                <button
                  onClick={() => setCoffeeCups(prev => Math.max(0, prev - 1))}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs text-slate-400 transition"
                >
                  Desfazer (-1)
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Limite diário desejado:</span>
                <div className="flex items-center gap-1">
                  {[2, 3, 4].map(lim => (
                    <button
                      key={lim}
                      onClick={() => setCoffeeLimit(lim)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        coffeeLimit === lim ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lim}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: CHECKLIST DE REMÉDIOS & SUPLEMENTOS
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
                    <p className="text-[10px] text-slate-400">Não esqueça suas doses diárias</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddMedModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo</span>
                </button>
              </div>

              {/* Barra de progresso dos remédios */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status de hoje:</span>
                <span className="font-bold text-purple-400 font-mono">
                  {takenMedsCount} de {medications.length} tomados ({medications.length > 0 ? Math.round((takenMedsCount / medications.length) * 100) : 0}%)
                </span>
              </div>

              {/* Lista com Checkboxes Grandes para toque móvel */}
              <div className="space-y-2">
                {medications.map(med => (
                  <div
                    key={med.id}
                    onClick={() => handleToggleMedication(med.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between select-none ${
                      med.takenToday 
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200' 
                        : 'bg-slate-950 border-slate-800 text-white hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                        med.takenToday 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
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

                    <div className="text-right">
                      {med.takenToday ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Tomado {med.takenAt && `às ${med.takenAt}`}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center text-[11px]">
                <button
                  onClick={handleResetDailyMeds}
                  className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
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
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Backup</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition"
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
          MODAL: ADICIONAR ALIMENTO (TABELA TACO)
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
                <p className="text-[10px] text-slate-400">Tabela TACO / IBGE</p>
              </div>
              <button
                onClick={() => setActiveMealModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar alimento (ex: Frango, Arroz, Whey...)"
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
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition ${
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
                      <span className="text-[10px] text-slate-500 font-mono">
                        P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={mult}
                        onChange={(e) => setSelectedMultiplier({ ...selectedMultiplier, [food.id]: parseFloat(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-white"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                      </select>

                      <button
                        onClick={() => handleAddFoodToMeal(food, activeMealModal)}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
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
              <button onClick={() => setIsAddMedModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nome do Medicamento / Suplemento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vitamina C, Losartana, Creatina"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Dosagem</label>
                <input
                  type="text"
                  placeholder="Ex: 1 cápsula, 50mg, 1 scoop"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Horário Previsto</label>
                <input
                  type="text"
                  placeholder="Ex: 08:00 (Jejum) ou Após Almoço"
                  value={newMed.scheduledTime}
                  onChange={(e) => setNewMed({ ...newMed, scheduledTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Salvar no Checklist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ALIMENTO PERSONALIZADO
      ========================================================================= */}
      {isCustomFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                Cadastrar Alimento Próprio
              </h3>
              <button onClick={() => setIsCustomFoodModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Nome do Alimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Crepioca com Queijo"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
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

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs mt-2"
              >
                Salvar Alimento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DEFINIR METAS (CALORIAS & MACROS)
      ========================================================================= */}
      {isGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Ajustar Metas Nutricionais
              </h3>
              <button onClick={() => setIsGoalsModalOpen(false)} className="text-slate-400 hover:text-white">
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

              <button
                onClick={() => { setIsGoalsModalOpen(false); showToast('Metas salvas!'); }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
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
