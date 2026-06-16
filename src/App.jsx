import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getSommelierAlert } from './utils/sommelier';
import { Wine, PlusCircle, History, LayoutDashboard, Search } from 'lucide-react';
import WineForm from './WineForm'; 
import WineDetail from './WineDetail';
import TastingForm from './TastingForm';
import Auth from './Auth'; // Import della pagina di Login/Registrazione

function App() {
  const [view, setView] = useState('dashboard'); 
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // Stato per l'utente loggato
  const [selectedWine, setSelectedWine] = useState(null);
  const [isTasting, setIsTasting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 1. Controllo sessione iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchWines();
      else setLoading(false);
    });

    // 2. Ascolto cambiamenti di stato (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchWines();
      else {
        setWines([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchWines() {
    setLoading(true);
    const { data, error } = await supabase
      .from('diar_wines')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Errore fetch:', error);
    else setWines(data || []);
    setLoading(false);
  }

  async function handleSnooze(wineId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('diar_wines')
      .update({ last_check_date: today })
      .eq('id', wineId);

    if (error) alert('Errore durante il rinvio dell\'alert.');
    else {
      alert('Ricevuto! Il Sommelier tornerà a trovarvi tra 3 mesi. 🍷');
      fetchWines();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setWines([]);
  }

  const statsMap = wines.reduce((acc, wine) => {
    const tipo = wine.tipologia || 'Non specificato';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  // SE NON È LOGGATO, MOSTRA LA PAGINA DI LOGIN
  if (loading) return <div className="flex justify-center items-center h-screen text-gray-500 font-medium">Caricamento... 🍷</div>;
  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <header className="bg-winelink-red text-white p-6 shadow-lg sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wine /> WineLink <span className="text-sm font-light opacity-80">| Cantina</span>
        </h1>
        <button 
          onClick={handleLogout}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
        >
          Esci
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {/* VISTA DASHBOARD */}
        {view === 'dashboard' && !selectedWine && !isEditing && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Totale" value={wines.length} color="bg-white" />
              <StatCard label="In Stock" value={wines.filter(w => w.in_stock).length} color="bg-winelink-green text-white" />
              {Object.entries(statsMap).map(([tipo, count]) => (
                <StatCard key={tipo} label={tipo} value={count} color="bg-gray-100" />
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">Consigli del Sommelier</h2>
              {wines.filter(w => w.in_stock).map(wine => {
                const alert = getSommelierAlert(wine.data_acquisto, wine.tipologia, wine.last_check_date);
                return alert ? (
                  <div key={wine.id} className={`${alert.bg} ${alert.color} p-4 rounded-xl border border-current flex items-start justify-between gap-3 shadow-sm mb-3`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{alert.icon}</span>
                      <div>
                        <p className="font-bold">{wine.nome_vino}</p>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                    </div>
                    <button onClick={() => handleSnooze(wine.id)} className="bg-white/80 hover:bg-white text-gray-700 text-xs font-bold py-2 px-3 rounded-lg border border-current transition-colors shadow-sm">✓ OK</button>
                  </div>
                ) : null;
              })}
              {wines.filter(w => w.in_stock && getSommelierAlert(w.data_acquisto, w.tipologia, w.last_check_date)).length === 0 && (
                <p className="text-gray-500 italic text-center py-4">Tutto in ordine in cantina! 🥂</p>
              )}
            </div>
          </div>
        )}

        {/* VISTA INVENTARIO */}
            {view === 'inventory' && !selectedWine && !isEditing && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-gray-800">La mia Cantina</h2>
                <div className="grid gap-3">
                  {wines.filter(w => w.in_stock).map(wine => (
                    <div 
                      key={wine.id} 
                      onClick={() => setSelectedWine(wine)}
                      className="bg-white p-4 rounded-lg shadow flex justify-between items-center border-l-4 border-winelink-red cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-lg leading-tight">{wine.nome_vino}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{wine.cantina}</span> • {wine.anno_imbottigliamento}
                        </p>
                        {/* NUOVA RIGA DI DETTAGLI RAPIDI */}
                        <p className="text-[11px] text-gray-400 flex flex-wrap gap-x-2">
                          <span>🍇 {wine.uvaggio || 'Uvaggio non specificato'}</span>
                          <span>🍷 {wine.gradazione ? `${wine.gradazione}%` : 'Grad. N/D'}</span>
                          <span>📅 Acq: {wine.data_acquisto || 'Data N/D'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full font-medium">{wine.tipologia}</span>
                      </div>
                    </div>
                  ))}
                  {wines.filter(w => w.in_stock).length === 0 && (
                    <p className="text-center text-gray-500 py-10">La cantina è vuota. Aggiungi un vino!</p>
                  )}
                </div>
              </div>
            )}

        {/* VISTA DETTAGLIO VINO */}
        {selectedWine && !isEditing && (
          <WineDetail 
            wine={selectedWine} 
            onBack={() => setSelectedWine(null)} 
            onTast={() => setIsTasting(true)} 
            onEdit={() => setIsEditing(true)}
            onSnooze={() => handleSnooze(selectedWine.id)}
          />
        )}

        {/* VISTA MODIFICA VINO */}
        {isEditing && (
          <div className="max-w-2xl mx-auto">
            <WineForm 
              existingWine={selectedWine} 
              onSave={() => { setIsEditing(false); fetchWines(); }} 
              onCancel={() => { setIsEditing(false); setSelectedWine(null); }} 
            />
          </div>
        )}

        {/* VISTA AGGIUNGI VINO */}
        {view === 'add' && !isEditing && (
          <div className="max-w-2xl mx-auto">
            <WineForm 
              onSave={() => { fetchWines(); setView('dashboard'); }} 
              onCancel={() => setView('dashboard')} 
            />
          </div>
        )}

        {/* VISTA STORICO */}
        {view === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Vini Degustati</h2>
            <div className="grid gap-3">
              {wines.filter(w => !w.in_stock).map(wine => (
                <div key={wine.id} className="bg-gray-100 p-4 rounded-lg shadow flex justify-between items-center border-l-4 border-gray-400 opacity-75">
                  <div><p className="font-bold text-lg line-through">{wine.nome_vino}</p><p className="text-sm text-gray-500">{wine.cantina}</p></div>
                  <span className="text-xs bg-gray-300 px-2 py-1 rounded-full">Bevuto</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODALE DEGUSTAZIONE */}
      {isTasting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <TastingForm 
            wine={selectedWine} 
            onCancel={() => setIsTasting(false)} 
            onComplete={() => { setIsTasting(false); setSelectedWine(null); fetchWines(); setView('history'); }} 
          />
        </div>
      )}

      {/* NAVIGAZIONE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 shadow-2xl z-50">
        <NavButton active={view === 'dashboard' && !selectedWine && !isEditing} onClick={() => {setView('dashboard'); setSelectedWine(null); setIsEditing(false);}} icon={<LayoutDashboard />} label="Home" />
        <NavButton active={view === 'inventory' && !selectedWine && !isEditing} onClick={() => {setView('inventory'); setSelectedWine(null); setIsEditing(false);}} icon={<Search />} label="Cantina" />
        <NavButton active={view === 'add' && !isEditing} onClick={() => {setView('add'); setSelectedWine(null); setIsEditing(false);}} icon={<PlusCircle />} label="Aggiungi" />
        <NavButton active={view === 'history' && !selectedWine && !isEditing} onClick={() => {setView('history'); setSelectedWine(null); setIsEditing(false);}} icon={<History />} label="Bevuti" />
      </nav>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} p-4 rounded-2xl shadow-sm border border-gray-100 text-center transition-transform hover:scale-105`}>
      <p className="text-[10px] uppercase font-bold text-gray-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-winelink-red' : 'text-gray-400'}`}>
      {icon}<span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default App;