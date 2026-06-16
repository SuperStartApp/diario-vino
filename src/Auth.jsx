import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Wine, Mail, Lock, User, ArrowRight } from 'lucide-react';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // REGISTRAZIONE
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: userName } // Salviamo il nome nei metadati dell'utente
        }
      });
      if (error) alert(error.message);
      else alert('Account creato! Benvenuto in WineLink 🍷');
    } else {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="bg-winelink-red w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wine className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">WineLink</h1>
          <p className="text-gray-500">{isSignUp ? 'Crea il tuo diario dei vini' : 'Bentornato, Sommelier!'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" placeholder="Nome completo" required
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-winelink-red"
                value={userName} onChange={e => setUserName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="email" placeholder="Email" required
              className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-winelink-red"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="password" placeholder="Password" required
              className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-winelink-red"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-winelink-red text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-800 transition-all shadow-lg disabled:bg-gray-400"
          >
            {loading ? 'Caricamento...' : (isSignUp ? 'Crea Account' : 'Accedi')} 
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-500 hover:text-winelink-red transition-colors font-medium"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Nuovo qui? Crea un account gratuito'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;