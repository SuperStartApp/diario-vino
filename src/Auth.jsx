import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Wine, LogIn } from 'lucide-react';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ FUNZIONE LOGIN GOOGLE
  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Torna all'app dopo il login
      }
    });
    if (error) {
      alert('Errore Google Login: ' + error.message);
      setLoading(false);
    }
  }

  // LOGIN TRADIZIONALE (per chi ha già l'account)
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
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
          <p className="text-gray-500 mt-2">Il tuo sommelier personale in tasca</p>
        </div>

        <div className="space-y-4">
          {/* TASTO GOOGLE - Protagonista */}
          <button 
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:bg-gray-100"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continua con Google
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-bold">Oppure</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* LOGIN MANUALE */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" placeholder="Email" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-winelink-red"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-winelink-red"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button 
              disabled={loading}
              className="w-full bg-winelink-red text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-800 transition-all shadow-lg disabled:bg-gray-400"
            >
              {loading ? 'Accesso...' : <><LogIn size={20}/> Accedi</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;