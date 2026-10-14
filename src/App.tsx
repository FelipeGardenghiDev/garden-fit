import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, Utensils, Plus, Trash2, Calculator, Settings, 
  Check, Search, PlusCircle, Droplets,
  Dumbbell, Activity, Timer, RotateCcw, Play, Pause,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_FOODS, 
  MEALS_CONFIG, 
  PRESET_DAYS, 
  FoodItem, 
  MealFoodItem, 
  UserStats, 
  DailyGoals,
  WorkoutSession
} from './data/tacoDatabase';
import { EXERCISE_TYPES, calculateCaloriesBurned } from './data/workoutDatabase';
import { playTimerCompletionAlert } from './utils/timerSound';

export function App() {
  // 1. Aba ativa de navegação mobile
  const [activeTab, setActiveTab] = useState<'meals' | 'water' | 'workout' | 'profile'>('meals');

  // 2. Estados de Alimentos & Refeições
  const [foodsList, setFoodsList] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('gardenfit_foods');
    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });

  const [goals, setGoals] = useState<DailyGoals>(() => {
    const saved = localStorage.getItem('gardenfit_goals');
    return saved ? JSON.parse(saved) : { calories: 2100, protein: 150, carbs: 225, fat: 65 };
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('gardenfit_stats');
    return saved ? JSON.parse(saved) : {
      gender: 'M',
      age: 28,
      weight: 76,
      height: 175,
      activity: '1.55',
      objective: 'cut',
      proteinPerKg: 2.0
    };
  });

  const [meals, setMeals] = useState<Record<string, MealFoodItem[]>>(() => {
    const saved = localStorage.getItem('gardenfit_meals');
    return saved ? JSON.parse(saved) : PRESET_DAYS.cutting.meals;
  });

  // 3. Estado de Hidratação
  const [waterMl, setWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem('gardenfit_water_ml');
    return saved ? JSON.parse(saved) : 1250;
  });

  // 4. Estado de Treinos / Exercícios
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('gardenfit_workouts');
    return saved ? JSON.parse(saved) : [
      {
        id: 'w_init_1',
        date: new Date().toLocaleDateString('pt-BR'),
        type: 'w1',
        title: 'Musculação (Peito & Tríceps)',
        durationMinutes: 50,
        intensity: 'high',
        caloriesBurned: 380,
        notes: 'Supino reto pesado e paralelas'
      }
    ];
  });

  // 5. Timer de Descanso de Academia
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerInitial, setTimerInitial] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Modais e UI
  const [activeMealModal, setActiveMealModal] = useState<string | null>(null);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState<boolean>(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState<boolean>(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedMultiplier, setSelectedMultiplier] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form de novo alimento customizado
  const [newFood, setNewFood] = useState({
    name: '',
    portion: '100g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    category: 'Personalizado'
  });

  // Form de novo treino
  const [newWorkout, setNewWorkout] = useState<{
    exerciseId: string;
    customTitle: string;
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
    notes: string;
  }>({
    exerciseId: 'w1',
    customTitle: '',
    durationMinutes: 45,
    intensity: 'high',
    notes: ''
  });

  // Persistência em LocalStorage
  useEffect(() => { localStorage.setItem('gardenfit_foods', JSON.stringify(foodsList)); }, [foodsList]);
  useEffect(() => { localStorage.setItem('gardenfit_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('gardenfit_stats', JSON.stringify(userStats)); }, [userStats]);
  useEffect(() => { localStorage.setItem('gardenfit_meals', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('gardenfit_water_ml', JSON.stringify(waterMl)); }, [waterMl]);
  useEffect(() => { localStorage.setItem('gardenfit_workouts', JSON.stringify(workouts)); }, [workouts]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cronômetro de descanso
  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playTimerCompletionAlert();
            showToast('⏰ Tempo de descanso encerrado! Próxima série!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const handleStartTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  // Meta de água calculada: 35ml por kg de peso
  const waterGoalMl = useMemo(() => {
    const w = parseFloat(userStats.weight as any) || 70;
    return Math.round(w * 35);
  }, [userStats.weight]);

  const handleAddWater = (ml: number) => {
    setWaterMl((prev) => {
      const next = Math.max(0, prev + ml);
      if (prev < waterGoalMl && next >= waterGoalMl) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        showToast('🎉 Parabéns! Meta de hidratação atingida hoje!');
      }
      return next;
    });
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

  // Total gasto em treinos no dia
  const totalBurnedCalories = useMemo(() => {
    return workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  }, [workouts]);

  // Saldo Calórico Líquido (Consumido - Queimado)
  const netCalories = dailyTotals.calories - totalBurnedCalories;

  // Cálculo de TMB & TDEE (Mifflin-St Jeor)
  const calculatedPreview = useMemo(() => {
    const w = parseFloat(userStats.weight as any) || 70;
    const h = parseFloat(userStats.height as any) || 170;
    const a = parseFloat(userStats.age as any) || 25;
    const act = parseFloat(userStats.activity) || 1.2;
    const protRatio = parseFloat(userStats.proteinPerKg as any) || 2.0;

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += userStats.gender === 'M' ? 5 : -161;
    const tdee = bmr * act;

    let targetCalories = tdee;
    if (userStats.objective === 'cut') targetCalories = tdee - 450;
    if (userStats.objective === 'bulk') targetCalories = tdee + 350;

    targetCalories = Math.max(1200, Math.round(targetCalories));
    const targetProtein = Math.round(w * protRatio);
    const targetFat = Math.round(w * 0.9);
    const remainingCals = targetCalories - (targetProtein * 4) - (targetFat * 9);
    const targetCarbs = Math.max(50, Math.round(remainingCals / 4));
    const finalCalories = (targetProtein * 4) + (targetCarbs * 4) + (targetFat * 9);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: finalCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat
    };
  }, [userStats]);

  const handleApplyCalculatedGoals = () => {
    setGoals({
      calories: calculatedPreview.calories,
      protein: calculatedPreview.protein,
      carbs: calculatedPreview.carbs,
      fat: calculatedPreview.fat
    });
    setIsGoalsModalOpen(false);
    showToast('Metas diárias atualizadas!');
  };

  const handleAddFoodToMeal = (food: FoodItem, mealId: string) => {
    const mult = selectedMultiplier[food.id] || 1;
    const newItem: MealFoodItem = {
      ...food,
      uid: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      foodId: food.id,
      multiplier: mult
    };

    setMeals((prev) => ({
      ...prev,
      [mealId]: [...(prev[mealId] || []), newItem]
    }));

    setSelectedMultiplier((prev) => ({ ...prev, [food.id]: 1 }));
    showToast(`${food.name} adicionado ao ${MEALS_CONFIG.find(m => m.id === mealId)?.title}!`);
  };

  const handleRemoveMealItem = (mealId: string, uid: string) => {
    setMeals((prev) => ({
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

    setFoodsList((prev) => [created, ...prev]);
    setIsCustomFoodModalOpen(false);
    setNewFood({ name: '', portion: '100g', calories: '', protein: '', carbs: '', fat: '', category: 'Personalizado' });
    showToast('Alimento personalizado cadastrado!');
  };

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = EXERCISE_TYPES.find(t => t.id === newWorkout.exerciseId) || EXERCISE_TYPES[0];
    const userW = parseFloat(userStats.weight as any) || 70;
    const burned = calculateCaloriesBurned(typeObj.met, userW, newWorkout.durationMinutes);

    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      type: typeObj.id,
      title: newWorkout.customTitle.trim() || typeObj.name,
      durationMinutes: newWorkout.durationMinutes,
      intensity: newWorkout.intensity,
      caloriesBurned: burned,
      notes: newWorkout.notes.trim()
    };

    setWorkouts((prev) => [session, ...prev]);
    setIsWorkoutModalOpen(false);
    showToast(`Treino registrado! -${burned} kcal gastas.`);
  };

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

  const caloriePct = Math.min(100, Math.round((dailyTotals.calories / (goals.calories || 1)) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 selection:bg-emerald-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/30 animate-bounce">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                Garden<span className="text-emerald-400">Fit</span>
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TACO &middot; APK
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Nutrição, Hidratação & Treino</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'meals' && (
            <button
              onClick={() => setIsCustomFoodModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Criar Alimento</span>
            </button>
          )}

          <button
            onClick={() => setIsGoalsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-transform active:scale-95"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Metas</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* =========================================================================
            ABA 1: ALIMENTAÇÃO & REFEIÇÕES
        ========================================================================= */}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            {/* Resumo Circular e Balanço Calórico */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Gráfico circular */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 * (1 - caloriePct / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-white">{dailyTotals.calories}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">de {goals.calories} kcal</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 mt-2">{caloriePct}% da Meta</span>
                </div>

                {/* Macros Bars */}
                <div className="sm:col-span-7 space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-400 flex items-center gap-1">🥩 Proteína</span>
                      <span>{dailyTotals.protein}g / <span className="text-slate-400">{goals.protein}g</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (dailyTotals.protein / (goals.protein || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-400 flex items-center gap-1">🌾 Carboidrato</span>
                      <span>{dailyTotals.carbs}g / <span className="text-slate-400">{goals.carbs}g</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (dailyTotals.carbs / (goals.carbs || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-sky-400 flex items-center gap-1">🥑 Gordura</span>
                      <span>{dailyTotals.fat}g / <span className="text-slate-400">{goals.fat}g</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (dailyTotals.fat / (goals.fat || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {totalBurnedCalories > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">🔥 Gasto em Treinos:</span>
                      <span className="text-emerald-400 font-bold">-{totalBurnedCalories} kcal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* As 4 Refeições */}
            <div className="space-y-4">
              {MEALS_CONFIG.map(meal => {
                const items = meals[meal.id] || [];
                const mealCals = items.reduce((s, i) => s + (i.calories * i.multiplier), 0);
                const mealProt = items.reduce((s, i) => s + (i.protein * i.multiplier), 0);

                return (
                  <div key={meal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${meal.bg} ${meal.color}`}>
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{meal.title}</h3>
                          <span className="text-[11px] text-slate-400">{meal.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">{Math.round(mealCals)} kcal</span>
                          <span className="text-[10px] text-slate-400">{Math.round(mealProt)}g prot</span>
                        </div>
                        <button
                          onClick={() => setActiveMealModal(meal.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-black text-emerald-400 transition-colors cursor-pointer"
                          title="Adicionar Alimento"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lista de alimentos na refeição */}
                    {items.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-950/40 rounded-xl">
                        Nenhum alimento registrado ainda. Toque no + para adicionar.
                      </p>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {items.map(item => (
                          <div key={item.uid} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                            <div>
                              <span className="font-semibold text-slate-200">{item.name}</span>
                              <span className="text-[10px] text-slate-400 ml-2">({item.multiplier}x {item.portion})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-emerald-400 font-bold">{Math.round(item.calories * item.multiplier)} kcal</span>
                              <button
                                onClick={() => handleRemoveMealItem(meal.id, item.uid)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
            ABA 2: HIDRATAÇÃO
        ========================================================================= */}
        {activeTab === 'water' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Droplets className="w-8 h-8 fill-sky-500/20" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">Controle de Hidratação</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Meta calculada com base no seu peso ({userStats.weight}kg &times; 35ml = {waterGoalMl}ml diários).
                </p>
              </div>

              {/* Garrafa / Progresso */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(1, waterMl / (waterGoalMl || 1)))}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{waterMl}</span>
                  <span className="text-xs uppercase font-bold text-sky-400">/ {waterGoalMl} ml</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {Math.round((waterMl / (waterGoalMl || 1)) * 100)}% da Meta
                </span>
                {waterMl >= waterGoalMl && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Atingida
                  </span>
                )}
              </div>

              {/* Botões Rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={() => handleAddWater(200)}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>+200 ml</span>
                  <span className="text-[10px] text-slate-500 font-normal">Copo pequeno</span>
                </button>

                <button
                  onClick={() => handleAddWater(300)}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>+300 ml</span>
                  <span className="text-[10px] text-slate-500 font-normal">Copo cheio</span>
                </button>

                <button
                  onClick={() => handleAddWater(500)}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>+500 ml</span>
                  <span className="text-[10px] text-slate-500 font-normal">Garrafinha</span>
                </button>

                <button
                  onClick={() => handleAddWater(1000)}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>+1.000 ml</span>
                  <span className="text-[10px] text-slate-500 font-normal">Squeeze grande</span>
                </button>
              </div>

              {waterMl > 0 && (
                <button
                  onClick={() => handleAddWater(-250)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition"
                >
                  Desfazer (-250ml)
                </button>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: EXERCÍCIOS FÍSICOS & TREINOS
        ========================================================================= */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            {/* Header de Treinos & Botão de Registro */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    Rotina de Treinos
                  </h2>
                  <p className="text-xs text-slate-400">Registre exercícios e acompanhe o gasto calórico</p>
                </div>

                <button
                  onClick={() => setIsWorkoutModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Treino</span>
                </button>
              </div>

              {/* Saldo de calorias queimadas */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Gasto Hoje</span>
                  <span className="text-2xl font-black text-emerald-400">{totalBurnedCalories} kcal</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Balanço Líquido</span>
                  <span className={`text-2xl font-black ${netCalories > goals.calories ? 'text-rose-400' : 'text-sky-400'}`}>
                    {netCalories} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Cronômetro de Descanso entre Séries */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Timer de Descanso (Academia)</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                  {timerSeconds}s
                </span>
              </div>

              {/* Barra de progresso circular ou linear */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${timerInitial > 0 ? (timerSeconds / timerInitial) * 100 : 0}%` }}
                />
              </div>

              {/* Presets rápidos de segundos */}
              <div className="flex flex-wrap gap-2">
                {[30, 45, 60, 90, 120].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleStartTimer(sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      timerInitial === sec && isTimerRunning 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}

                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerRunning ? 'Pausar' : 'Continuar'}</span>
                </button>

                <button
                  onClick={() => { setIsTimerRunning(false); setTimerSeconds(timerInitial); }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs cursor-pointer"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lista de Sessões Realizadas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Histórico de Exercícios Hoje ({workouts.length})
              </h3>

              {workouts.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                  Nenhum treino registrado hoje. Toque em "+ Novo Treino".
                </div>
              ) : (
                workouts.map(w => (
                  <div key={w.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{w.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          {w.durationMinutes} min &middot; {w.intensity === 'high' ? 'Intenso' : w.intensity === 'moderate' ? 'Moderado' : 'Leve'}
                        </span>
                        {w.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{w.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-extrabold text-sm">
                        -{w.caloriesBurned} kcal
                      </span>
                      <button
                        onClick={() => setWorkouts(prev => prev.filter(item => item.id !== w.id))}
                        className="text-slate-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: PERFIL & METAS
        ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Configurações & Metas</h2>
                  <p className="text-xs text-slate-400">Fórmula científica de Mifflin-St Jeor</p>
                </div>
                <button
                  onClick={() => setIsGoalsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Recalcular Metas
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Peso</span>
                  <span className="text-lg font-black text-white">{userStats.weight} kg</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Altura</span>
                  <span className="text-lg font-black text-white">{userStats.height} cm</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">TMB (Basal)</span>
                  <span className="text-lg font-black text-emerald-400">{calculatedPreview.bmr} kcal</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Gasto Total (TDEE)</span>
                  <span className="text-lg font-black text-sky-400">{calculatedPreview.tdee} kcal</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">📱 Como Instalar no Celular (.apk / PWA)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Este app foi desenvolvido com Capacitor e suporte completo a APK nativo de Android. Você pode:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                  <li>Baixar o arquivo <code className="text-emerald-400 font-mono">.apk</code> gerado pelo workflow do GitHub Actions no repositório.</li>
                  <li>Ou abrir pelo Chrome no celular e tocar em <strong>"Adicionar à Tela Inicial"</strong> para usar como app PWA com tela cheia e offline!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (Mobile Native Bar)
      ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 py-2 px-6 flex items-center justify-around max-w-lg mx-auto shadow-2xl">
        <button
          onClick={() => setActiveTab('meals')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'meals' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">Alimentação</span>
        </button>

        <button
          onClick={() => setActiveTab('water')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'water' ? 'text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Droplets className="w-5 h-5" />
          <span className="text-[10px]">Água</span>
        </button>

        <button
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'workout' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px]">Treinos</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>

      {/* =========================================================================
          MODAL 1: ADICIONAR ALIMENTO A UMA REFEIÇÃO (TABELA TACO)
      ========================================================================= */}
      {activeMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  Adicionar ao {MEALS_CONFIG.find(m => m.id === activeMealModal)?.title}
                </h3>
                <p className="text-xs text-slate-400">Selecione da Tabela TACO/IBGE ou Alimentos Criados</p>
              </div>
              <button
                onClick={() => setActiveMealModal(null)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Fechar
              </button>
            </div>

            {/* Busca & Categorias */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar alimento (ex: Frango, Arroz, Whey...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat 
                        ? 'bg-emerald-500 text-slate-950 font-bold' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista com Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredFoods.map(food => {
                const mult = selectedMultiplier[food.id] || 1;
                return (
                  <div key={food.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">{food.name}</span>
                      <span className="text-[10px] text-slate-400 block">{food.portion} &middot; <span className="text-emerald-400 font-semibold">{food.calories} kcal</span></span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={mult}
                        onChange={(e) => setSelectedMultiplier({ ...selectedMultiplier, [food.id]: parseFloat(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                      </select>

                      <button
                        onClick={() => handleAddFoodToMeal(food, activeMealModal)}
                        className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                        title="Adicionar"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
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
          MODAL 2: DEFINIR METAS (TMB / GET / MACROS)
      ========================================================================= */}
      {isGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Definir Metas Calóricas & Macros
              </h3>
              <button
                onClick={() => setIsGoalsModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={userStats.weight}
                  onChange={(e) => setUserStats({ ...userStats, weight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={userStats.height}
                  onChange={(e) => setUserStats({ ...userStats, height: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Idade</label>
                <input
                  type="number"
                  value={userStats.age}
                  onChange={(e) => setUserStats({ ...userStats, age: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sexo</label>
                <select
                  value={userStats.gender}
                  onChange={(e) => setUserStats({ ...userStats, gender: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nível de Atividade</label>
              <select
                value={userStats.activity}
                onChange={(e) => setUserStats({ ...userStats, activity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="1.2">Sedentário (pouco exercício)</option>
                <option value="1.375">Levemente Ativo (1 a 3 dias/sem)</option>
                <option value="1.55">Moderadamente Ativo (3 a 5 dias/sem)</option>
                <option value="1.725">Muito Ativo (6 a 7 dias/sem)</option>
                <option value="1.9">Atleta / Treino Intenso Diário</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Objetivo</label>
              <select
                value={userStats.objective}
                onChange={(e) => setUserStats({ ...userStats, objective: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="cut">Definição / Emagrecimento (-450 kcal)</option>
                <option value="maintain">Manutenção de Peso (Normocalórica)</option>
                <option value="bulk">Ganho de Massa Muscular (+350 kcal)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Resultado Calculado:</span>
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-white">Calorias: {calculatedPreview.calories} kcal</span>
                <span className="text-rose-400">P: {calculatedPreview.protein}g</span>
                <span className="text-amber-400">C: {calculatedPreview.carbs}g</span>
                <span className="text-sky-400">G: {calculatedPreview.fat}g</span>
              </div>
            </div>

            <button
              onClick={handleApplyCalculatedGoals}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Aplicar Metas Calculadas
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CRIAR ALIMENTO PERSONALIZADO
      ========================================================================= */}
      {isCustomFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Cadastrar Alimento Personalizado
              </h3>
              <button
                onClick={() => setIsCustomFoodModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Shake Hipercalórico Caseiro"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Porção</label>
                  <input
                    type="text"
                    placeholder="Ex: 1 copo (300ml)"
                    value={newFood.portion}
                    onChange={(e) => setNewFood({ ...newFood, portion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Shakes"
                    value={newFood.category}
                    onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-rose-400 block mb-1">Prot (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-amber-400 block mb-1">Carbo (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-sky-400 block mb-1">Gord (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Calorias (opcional)</label>
                <input
                  type="number"
                  placeholder="Automático"
                  value={newFood.calories}
                  onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Salvar Alimento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NOVO TREINO / EXERCÍCIO
      ========================================================================= */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Registrar Novo Treino
              </h3>
              <button
                onClick={() => setIsWorkoutModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateWorkout} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Modalidade</label>
                <select
                  value={newWorkout.exerciseId}
                  onChange={(e) => setNewWorkout({ ...newWorkout, exerciseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {EXERCISE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Título Personalizado (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Treino de Perna Completo"
                  value={newWorkout.customTitle}
                  onChange={(e) => setNewWorkout({ ...newWorkout, customTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newWorkout.durationMinutes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, durationMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Intensidade</label>
                  <select
                    value={newWorkout.intensity}
                    onChange={(e) => setNewWorkout({ ...newWorkout, intensity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="low">Leve</option>
                    <option value="moderate">Moderada</option>
                    <option value="high">Intensa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Anotações / Exercícios feitos</label>
                <input
                  type="text"
                  placeholder="Ex: Agachamento 4x10, Leg Press, Extensora"
                  value={newWorkout.notes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400">Estimativa de Queima:</span>
                <span className="font-bold text-emerald-400">
                  {calculateCaloriesBurned(
                    EXERCISE_TYPES.find(t => t.id === newWorkout.exerciseId)?.met || 5,
                    parseFloat(userStats.weight as any) || 70,
                    newWorkout.durationMinutes
                  )} kcal
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Salvar Treino
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
