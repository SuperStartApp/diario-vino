import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, CheckCircle, Lock, Star, Trophy, AlertCircle, Wine, X } from 'lucide-react';
import { supabase } from './supabaseClient';

// [CONFIGURAZIONE] Titoli per i livelli
const LEVEL_TITLES = {
  1: { title: 'Sognatore', subtitle: 'Iniziante', color: 'bg-blue-100 text-blue-700', icon: '🌱' },
  2: { title: 'Esploratore', subtitle: 'Appassionato', color: 'bg-green-100 text-green-700', icon: '🔍' },
  3: { title: 'Custode', subtitle: 'Conoscitore', color: 'bg-yellow-100 text-yellow-700', icon: '🔑' },
  4: { title: 'Wine Master', subtitle: 'Esperto', color: 'bg-orange-100 text-orange-700', icon: '🎓' },
  5: { title: 'Gran Maestro', subtitle: 'Leggenda', color: 'bg-purple-100 text-purple-700', icon: '👑' },
};

// [CONFIGURAZIONE] Tutti i 6 percorsi sono già ATTIVI qui sotto
const PATHS = [
  { id: 'general', name: 'Basi del Vino', label: 'Modulo General' },
  { id: 'territory', name: 'Territori & Vigneti', label: 'Modulo Territori' },
  { id: 'pairing', name: 'L\'Arte dell\'Abbinamento', label: 'Modulo Abbinamenti' },
  { id: 'vinification', name: 'Vino e Vinificazione', label: 'Modulo Enologia' },
  { id: 'sensory', name: 'Analisi Sensoriale', label: 'Modulo Degustazione' },
  { id: 'service', name: 'Servizio e Etichetta', label: 'Modulo Sommelier' },
];

function Academy({ session, userProgress, fetchProgress }) {
  const [academyView, setAcademyView] = useState('menu'); 
  const [currentQuiz, setCurrentQuiz] = useState({ category: '', level: 1 });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState({ passed: false, score: 0 });

  useEffect(() => { fetchProgress(); }, []);

  const startQuiz = async (category, level) => {
    if (level > 1) {
      const completedPrev = userProgress.find(p => p.category === category && p.level === level - 1 && p.completed);
      if (!completedPrev) { alert(`Devi prima superare il Livello ${level - 1}!`); return; }
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('diar_quizzes').select('*').eq('category', category).eq('level', level);
      if (error) throw error;
      setQuizQuestions(data || []);
      setCurrentQuestionIdx(0);
      setMistakes(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setUserAnswers([]);
      setCurrentQuiz({ category, level });
      setAcademyView('quiz');
    } catch (e) { alert("Errore caricamento quiz. Assicurati di aver inserito le domande nel DB!"); } finally { setLoading(false); }
  };

  const handleAnswer = async (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    setUserAnswers(prev => [...prev, option]);

    const currentQ = quizQuestions[currentQuestionIdx];
    const isCorrect = option === currentQ.correct_option;
    let currentMistakesCount = mistakes;
    if (!isCorrect) currentMistakesCount += 1;
    setMistakes(currentMistakesCount);

    setTimeout(async () => {
      if (currentQuestionIdx < quizQuestions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        const totalMistakes = currentMistakesCount;
        const passed = totalMistakes <= 3;
        const score = quizQuestions.length - totalMistakes;
        
        await supabase.from('diar_academy_progress').upsert(
          { user_id: session.user.id, category: currentQuiz.category, level: currentQuiz.level, completed: passed, score: score },
          { onConflict: 'user_id,category,level' }
        );
        setLastResult({ passed, score });
        setShowResult(true);
      }
    }, 1500);
  };

  const resetToMenu = async () => {
    setShowResult(false);
    setAcademyView('menu');
    await fetchProgress(); 
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 font-bold">Caricamento... 🎓</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Scegli un Percorso</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Diventa un Maestro del Vino</p>
      </div>

      {academyView === 'menu' ? (
        <div className="grid gap-8">
          {PATHS.map(path => (
            <div key={path.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                  {path.name}
                </h3>
                <div className="bg-winelink-red/10 text-winelink-red px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {path.label}
                </div>
              </div>
              <div className="grid gap-3 relative z-10">
                {[1, 2, 3, 4, 5].map(lvl => {
                  const completed = userProgress.some(p => p.category === path.id && p.level === lvl && p.completed);
                  const isLocked = lvl > 1 && !userProgress.some(p => p.category === path.id && p.level === lvl - 1 && p.completed);
                  const titleInfo = LEVEL_TITLES[lvl];
                  return (
                    <button 
                      key={lvl} 
                      disabled={isLocked} 
                      onClick={() => startQuiz(path.id, lvl)} 
                      className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all border-2 ${completed ? 'bg-green-50 border-green-200' : isLocked ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : 'bg-white border-gray-100 hover:border-winelink-red shadow-sm active:scale-95'}`}
                    >
                      <div className="text-left flex items-center gap-3">
                        <span className="text-xl">{titleInfo.icon}</span>
                        <div>
                          <p className={`font-black text-lg ${completed ? 'text-green-700' : 'text-gray-800'}`}>{titleInfo.title}</p>
                          <p className="text-xs font-medium text-gray-400 uppercase">{titleInfo.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${completed ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>{completed ? '✓' : lvl}</span>
                        {isLocked && <Lock size={16} className="text-gray-300" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : academyView === 'quiz' ? (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in zoom-in duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
            <div className="h-full bg-winelink-red transition-all duration-500" style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }} />
          </div>
          <div className="flex justify-between items-center mb-8 mt-2">
            <button onClick={() => setAcademyView('menu')} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-winelink-red"><ArrowLeft size={14}/> Torna</button>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Domanda {currentQuestionIdx + 1} / {quizQuestions.length}</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-10 text-center leading-tight">{quizQuestions[currentQuestionIdx]?.question}</h3>
          <div className="grid gap-4">
            {['a', 'b', 'c', 'd'].map(opt => {
              const optionText = quizQuestions[currentQuestionIdx]?.[`option_${opt}`];
              if (!optionText) return null;
              const isCorrect = quizQuestions[currentQuestionIdx]?.correct_option === opt.toUpperCase();
              let btnClass = "p-5 rounded-2xl border-2 text-left transition-all duration-300 font-bold ";
              if (!isAnswered) btnClass += "border-gray-100 hover:border-winelink-red hover:bg-red-50 text-gray-700";
              else if (selectedOption === opt) btnClass += isCorrect ? "border-green-500 bg-green-100 text-green-700 shadow-lg" : "border-red-500 bg-red-100 text-red-700 shadow-lg";
              else if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200";
              else btnClass += "border-gray-100 opacity-40 text-gray-400";
              return <button key={opt} onClick={() => handleAnswer(opt.toUpperCase())} className={btnClass}>{optionText}</button>;
            })}
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
              <AlertCircle size={14} className={mistakes > 0 ? "text-red-400" : ""}/> Errori: {mistakes} / 3
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Revisione Errori</h3>
            <button onClick={() => setAcademyView('menu')} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
          </div>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {quizQuestions.map((q, idx) => {
              const userAns = userAnswers[idx];
              if (userAns === q.correct_option) return null;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                  <p className="text-sm font-bold text-gray-800 leading-snug">Domanda {idx + 1}: {q.question}</p>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                      <span>Tua risposta: {q[`option_${userAns?.toLowerCase()}`] || 'Nessuna'}</span>
                      <X size={14} />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                      <span>Corretta: {q[`option_${q.correct_option.toLowerCase()}`]}</span>
                      <CheckCircle size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={resetToMenu} className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">Torna al Menu</button>
        </div>
      )}

      {showResult && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden text-center animate-in zoom-in duration-300">
            <div className={`p-10 ${lastResult.passed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {lastResult.passed ? <Trophy size={64} className="mx-auto mb-4 animate-bounce" /> : <AlertCircle size={64} className="mx-auto mb-4" />}
              <h2 className="text-3xl font-black uppercase tracking-tighter">{lastResult.passed ? 'Superato!' : 'Fallito'}</h2>
              <p className="text-sm opacity-90 font-medium">Punteggio: {lastResult.score} / {quizQuestions.length}</p>
            </div>
            <div className="p-8 space-y-3">
              <p className="text-gray-600 mb-6">
                {lastResult.passed ? "Ottimo lavoro! Il nuovo livello è sbloccato. 🍷" : "Non è andata come speravi. Riprova per sbloccare il badge!"}
              </p>
              <button onClick={resetToMenu} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg">
                {lastResult.passed ? 'Continua' : 'Riprova'}
              </button>
              {mistakes > 0 && (
                <button onClick={() => { setShowResult(false); setAcademyView('review'); }} className="w-full py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95">
                  Analizza Errori
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Academy;