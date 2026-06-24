import React, { useState } from 'react';
import { User, BookOpen, LogOut, Heart, ExternalLink, Info, Star, X } from 'lucide-react';

function Profile({ user, isPremium, onLogout }) {
  // Stato per gestire l'apertura dei Modali
  const [activeModal, setActiveModal] = useState(null); // può essere 'guide' o 'about'

  // --- CONTENUTI DEI MODALI ---

  const guideContent = (
    <div className="space-y-4 text-left">
      <div className="flex items-start gap-3">
        <span className="text-xl">🍷</span>
        <p className="text-sm text-gray-600"><strong>Aggiungi:</strong> Inserisci i tuoi vini e la loro data d'acquisto per iniziare la tua collezione.</p>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-xl">🚨</span>
        <p className="text-sm text-gray-600"><strong>Sommelier:</strong> Ricevi avvisi intelligenti quando un vino è al picco della maturazione o rischia di invecchiare troppo.</p>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-xl">✨</span>
        <p className="text-sm text-gray-600"><strong>Degusta:</strong> Registra le tue sensazioni dopo ogni apertura per creare un archivio unico dei tuoi ricordi.</p>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-xl">⭐</span>
        <p className="text-sm text-gray-600"><strong>Premium:</strong> Sblocca l'inserimento illimitato di bottiglie e funzioni avanzate.</p>
      </div>
    </div>
  );

  const aboutContent = (
    <div className="space-y-4 text-left">
      <p className="text-sm text-gray-700 leading-relaxed">
        <strong>WineDiary</strong> è il cuore digitale dell'ecosistema <strong>WineLink</strong>, un progetto vincitore del bando <strong>"IDEA INNOVATIVA LAZIO"</strong>.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed">
        La nostra missione è unire la passione per l'enologia alla tecnologia, offrendo uno strumento intelligente per gestire la propria cantina e scoprire la cultura del vino.
      </p>
      <p className="text-xs text-gray-400 italic">
        WineDiary fa parte di un universo più ampio che include WineAcademy e il portale informativo WineLink.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800">Il Mio Profilo</h2>

      {/* 1. CARD ACCOUNT */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="bg-winelink-red/10 w-16 h-16 rounded-full flex items-center justify-center text-winelink-red shadow-inner">
          <User size={32} />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Utente</p>
          <p className="text-lg font-bold text-gray-800">{user?.email}</p>
          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
            {isPremium ? <Star size={10} className="fill-yellow-700" /> : null}
            {isPremium ? 'Account Premium' : 'Utente Free'}
          </span>
        </div>
      </div>

      {/* 2. SEZIONE SUPPORTO (Nuovi tasti con Modal) */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Supporto e Info</h3>
        
        <button 
          onClick={() => setActiveModal('guide')}
          className="w-full flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-winelink-red" />
            <span className="text-sm font-bold text-gray-700">Guida all'App</span>
          </div>
          <X size={16} className="text-gray-300 rotate-45" />
        </button>

        <button 
          onClick={() => setActiveModal('about')}
          className="w-full flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <Info size={20} className="text-winelink-red" />
            <span className="text-sm font-bold text-gray-700">Chi Siamo</span>
          </div>
          <X size={16} className="text-gray-300 rotate-45" />
        </button>
      </div>

      {/* 3. BANNER PREMIUM (Solo se Free) */}
      {!isPremium && (
        <div className="bg-gradient-to-br from-winelink-red to-red-900 p-6 rounded-[2rem] shadow-lg text-white space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Star size={20} className="fill-white" /> WineDiary è un'App Gratuita
          </div>
          <p className="text-sm opacity-90">Sblocca la tua cantina e inserisci tutte le bottiglie che desideri senza limiti e solo se ti va, sostieni il progetto!</p>
          
          <a 
            href="https://www.winelink.info/winediary-app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-white text-winelink-red p-3 rounded-xl font-bold text-center block hover:bg-gray-100 transition-all shadow-md active:scale-95"
          >
            Richiedi Premium Gratuitamente ❤️
          </a>
        </div>
      )}

      {/* 4. AZIONI ACCOUNT */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Gestione</h3>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all">
          <LogOut size={20}/> Esci dall'Account
        </button>
      </div>

      {/* 5. FOOTER CREDITS */}
      <div className="text-center pt-8 pb-4 space-y-3">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          App progettata con il <Heart size={12} className="text-red-500 fill-red-500" /> da <span className="font-bold">SuPeR</span>
        </p>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          per il progetto "Idea Innovativa Lazio" WineLink
        </p>
        <a href="https://www.winelink.info/support" target="_blank" rel="noreferrer" className="text-xs text-winelink-red font-bold flex items-center justify-center gap-1 hover:underline">
          Supporto e Info <ExternalLink size={12}/>
        </a>
      </div>

      {/* --- MODALI (Overlay) --- */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-winelink-red p-6 text-white flex justify-between items-center">
              <h2 className="font-black uppercase tracking-widest">Guida Rapida</h2>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-8">{guideContent}</div>
            <div className="p-4 bg-gray-50 text-center">
              <button onClick={() => setActiveModal(null)} className="w-full py-3 text-winelink-red font-black uppercase text-xs">Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'about' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-winelink-red p-6 text-white flex justify-between items-center">
              <h2 className="font-black uppercase tracking-widest">Chi Siamo</h2>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-8">{aboutContent}</div>
            <div className="p-4 bg-gray-50 text-center">
              <button onClick={() => setActiveModal(null)} className="w-full py-3 text-winelink-red font-black uppercase text-xs">Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;