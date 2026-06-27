import React, { useState } from 'react';
// FIX: Import corretto senza i due slash //
import { User, BookOpen, LogOut, Heart, ExternalLink, Info, Star, X, ArrowRight, GraduationCap, Award } from 'lucide-react';

function Profile({ user, isPremium, onLogout, userProgress, statsMap, setView }) {
  const [activeModal, setActiveModal] = useState(null); 
  const safeUserProgress = userProgress || [];
  const safeStatsMap = statsMap || {};

  const cellarCategories = [
    { id: 'Rossi', icon: '🍷' },
    { id: 'Bianchi', icon: '⚪' },
    { id: 'Rosati', icon: '🌸' },
    { id: 'Champagne', icon: '🍾' },
    { id: 'Bollicine', icon: '🥂' },
    { id: 'Dolci/Passito', icon: '🍯' },
  ];

  const getCellarBadge = (count) => {
    if (!count || count === 0) return { label: 'Inizia!', color: 'bg-gray-100 text-gray-400', border: 'border-gray-200' };
    if (count <= 5) return { label: 'Apprendista', color: 'bg-orange-100 text-orange-600', border: 'border-orange-300' };
    if (count <= 15) return { label: 'Custode', color: 'bg-slate-200 text-slate-600', border: 'border-slate-400' };
    return { label: 'Maestro', color: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-400' };
  };

  const getGlobalLevel = () => {
    let maxLevel = 0;
    safeUserProgress.forEach(p => {
      if (p.completed && p.level > maxLevel) maxLevel = p.level;
    });
    return maxLevel;
  };

  const globalLevel = getGlobalLevel();

  const guideContent = (
    <div className="space-y-4 text-left">
      <div className="flex items-start gap-3"><span className="text-xl">🍷</span><p className="text-sm text-gray-600"><strong>Aggiungi:</strong> Inserisci i tuoi vini per iniziare la collezione.</p></div>
      <div className="flex items-start gap-3"><span className="text-xl">🚨</span><p className="text-sm text-gray-600"><strong>Sommelier:</strong> Ricevi avvisi sulla maturazione.</p></div>
      <div className="flex items-start gap-3"><span className="text-xl">✨</span><p className="text-sm text-gray-600"><strong>Degusta:</strong> Registra le tue sensazioni.</p></div>
      <div className="flex items-start gap-3"><span className="text-xl">⭐</span><p className="text-sm text-gray-600"><strong>Premium:</strong> Sblocca l'inserimento illimitato.</p></div>
    </div>
  );

  const aboutContent = (
    <div className="space-y-4 text-left">
      <p className="text-sm text-gray-700 leading-relaxed"><strong>WineDiary</strong> è il cuore digitale dell'ecosistema <strong>WineLink</strong>.</p>
      <p className="text-sm text-gray-600 leading-relaxed">Uniamo la passione per l'enologia alla tecnologia.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <h2 className="text-2xl font-bold text-gray-800">Il Mio Profilo</h2>

      {/* 1. ACCOUNT */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="bg-winelink-red/10 w-16 h-16 rounded-full flex items-center justify-center text-winelink-red shadow-inner">
          <User size={32} />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Utente</p>
          <p className="text-lg font-bold text-gray-800">{user?.email || 'Utente'}</p>
          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
            {isPremium && <Star size={10} className="fill-yellow-700" />}
            {isPremium ? 'Account Premium' : 'Utente Free'}
          </span>
        </div>
      </div>

      {/* 2. PRESTIGIO GLOBALE */}
      <div className="bg-gray-800 p-6 rounded-[2rem] shadow-lg text-white flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Titolo Onorifico</p>
          <h3 className="text-xl font-black uppercase tracking-tight">
            {globalLevel > 0 ? (
              globalLevel === 1 ? 'Sognatore' : 
              globalLevel === 2 ? 'Esploratore' : 
              globalLevel === 3 ? 'Custode' : 
              globalLevel === 4 ? 'Wine Master' : 'Gran Maestro'
            ) : 'Novizio'}
          </h3>
        </div>
        <Star size={40} className={globalLevel > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
      </div>

      {/* 3. PERCORSI ACADEMY */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
          <GraduationCap size={14}/> I tuoi Percorsi Academy
        </h3>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          {['general', 'territory', 'pairing'].map(pathId => {
            const pathNames = { general: 'Basi del Vino', territory: 'Territori', pairing: 'Abbinamenti' };
            const pathIcons = { general: '🍇', territory: '🗺️', pairing: '🍽️' };
            const completedLevels = safeUserProgress
              .filter(p => p.category === pathId && p.completed)
              .map(p => p.level);
            const currentPathLevel = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;

            return (
              <div key={pathId} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{pathIcons[pathId]}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{pathNames[pathId]}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Livello {currentPathLevel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={12} className={star <= currentPathLevel ? "fill-winelink-red text-winelink-red" : "text-gray-200"} />
                  ))}
                  <ArrowRight size={14} className="text-gray-300 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CANTINA BADGES */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
          <Award size={14}/> Titoli di Collezione
        </h3>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            {cellarCategories.map(cat => {
              const count = safeStatsMap[cat.id] || 0;
              const badge = getCellarBadge(count);
              return (
                <div key={cat.id} className={`flex flex-col justify-between p-3 rounded-2xl border ${badge.border} ${badge.color} min-h-[70px]`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[11px] font-black uppercase truncate">{cat.id}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-[9px] font-black uppercase opacity-80">{badge.label}</span>
                    <span className="text-[10px] font-bold">{count} btl</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. SUPPORTO & GESTIONE */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Supporto e Info</h3>
        <button onClick={() => setActiveModal('guide')} className="w-full flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all">
          <div className="flex items-center gap-3"><BookOpen size={20} className="text-winelink-red" /><span className="text-sm font-bold text-gray-700">Guida all'App</span></div>
          <X size={16} className="text-gray-300 rotate-45" />
        </button>
        <button onClick={() => setActiveModal('about')} className="w-full flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all">
          <div className="flex items-center gap-3"><Info size={20} className="text-winelink-red" /><span className="text-sm font-bold text-gray-700">Chi Siamo</span></div>
          <X size={16} className="text-gray-300 rotate-45" />
        </button>
        {!isPremium && (
          <div className="bg-gradient-to-br from-winelink-red to-red-900 p-6 rounded-[2rem] shadow-lg text-white space-y-4 mt-6">
            <div className="flex items-center gap-2 font-bold text-lg"><Star size={20} className="fill-white" /> WineDiary è un'App Gratuita</div>
            <p className="text-sm opacity-90">Sblocca la tua cantina e inserisci tutte le bottiglie che desideri senza limiti.</p>
            <button 
              onClick={() => setView('premium_unlock')} 
              className="w-full bg-white text-winelink-red p-3 rounded-xl font-bold text-center block hover:bg-gray-100 transition-all shadow-md active:scale-95"
            >
              Attiva Premium Gratuitamente ❤️
            </button>
          </div>
        )}
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all mt-4">
          <LogOut size={20}/> Esci dall'Account
        </button>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-8 pb-4 space-y-3">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">App progettata con il <Heart size={12} className="text-red-500 fill-red-500" /> da <span className="font-bold">SuPeR</span></p>
        <a href="https://www.winelink.info/support" target="_blank" rel="noreferrer" className="text-xs text-winelink-red font-bold flex items-center justify-center gap-1 hover:underline">Supporto e Info <ExternalLink size={12}/></a>
      </div>

      {/* MODALI */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-winelink-red p-6 text-white flex justify-between items-center"><h2 className="font-black uppercase tracking-widest">Guida Rapida</h2><button onClick={() => setActiveModal(null)}><X size={24} /></button></div>
            <div className="p-8">{guideContent}</div>
            <div className="p-4 bg-gray-50 text-center"><button onClick={() => setActiveModal(null)} className="w-full py-3 text-winelink-red font-black uppercase text-xs">Chiudi</button></div>
          </div>
        </div>
      )}

      {activeModal === 'about' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-winelink-red p-6 text-white flex justify-between items-center"><h2 className="font-black uppercase tracking-widest">Chi Siamo</h2><button onClick={() => setActiveModal(null)}><X size={24} /></button></div>
            <div className="p-8">{aboutContent}</div>
            <div className="p-4 bg-gray-50 text-center"><button onClick={() => setActiveModal(null)} className="w-full py-3 text-winelink-red font-black uppercase text-xs">Chiudi</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;