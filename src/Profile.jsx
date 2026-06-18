import React from 'react';
import { User, BookOpen, CreditCard, LogOut, Heart, ExternalLink } from 'lucide-react';

function Profile({ user, isPremium, onLogout }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800">Il Mio Profilo</h2>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="bg-winelink-red w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg">
          <User size={32} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Account Utente</p>
          <p className="text-lg font-bold text-gray-800">{user?.email}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
            {isPremium ? '✨ Account Premium' : 'Utente Free'}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <BookOpen size={18} className="text-winelink-red"/> Guida Rapida
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>🍷 <span className="font-medium">Aggiungi:</span> Inserisci i tuoi vini e la loro data d'acquisto.</li>
          <li>🚨 <span className="font-medium">Sommelier:</span> L'app ti avvisa quando un vino è pronto o rischia di scadere.</li>
          <li>🥂 <span className="font-medium">Degusta:</span> Quando bevi una bottiglia, usa "Degusta Ora" per spostarla nello storico.</li>
          <li>⭐ <span className="font-medium">Premium:</span> Sblocca l'inserimento illimitato di bottiglie.</li>
        </ul>
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-br from-winelink-red to-red-900 p-6 rounded-3xl shadow-lg text-white space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <CreditCard /> Passa a WineLink Premium
          </div>
          <p className="text-sm opacity-90">Sblocca la tua cantina e inserisci tutte le bottiglie che desideri senza limiti!</p>
          <button className="w-full bg-white text-winelink-red p-3 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-md active:scale-95">
            Abbonamento Annuale € 7,90
          </button>
        </div>
      )}

      <div className="text-center py-8 space-y-2">
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

      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors">
        <LogOut size={20}/> Esci dall'Account
      </button>
    </div>
  );
}
export default Profile;