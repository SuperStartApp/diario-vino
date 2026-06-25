import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getSommelierAlert, getSommelierSuggestion } from './utils/sommelier';
import { App as CapacitorApp } from '@capacitor/app'; 
import { Wine, PlusCircle, History, LayoutDashboard, Search, Star, Calendar, CheckCircle2, ArrowLeft, ArrowRight, X, Sparkles, GraduationCap } from 'lucide-react';
import WineForm from './WineForm'; 
import WineDetail from './WineDetail';
import TastingForm from './TastingForm';
import Auth from './Auth';
import Profile from './Profile';
import Academy from './Academy'; 

function App() {
  const [view, setView] = useState('dashboard'); 
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [session, setSession] = useState(null);
  const [selectedWine, setSelectedWine] = useState(null);
  const [isTasting, setIsTasting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tutti');
  const [isPremium, setIsPremium] = useState(false);
  const [isViewingTasting, setIsViewingTasting] = useState(false);
  const [tastingData, setTastingData] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [userProgress, setUserProgress] = useState([]); 

  async function fetchProfile(userId) {
    if (!userId) return;
    try {
      const { data } = await supabase.from('diar_profiles').select('is_premium, current_level, total_score, badges, progress').eq('id', userId).single();
      if (data) setIsPremium(data.is_premium);
    } catch (e) { console.error("Errore profilo:", e); }
  }

  async function fetchWines() {
    try {
      const { data, error } = await supabase.from('diar_wines').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setWines(data || []);
    } catch (error) { console.error('Errore fetch vini:', error); }
  }

  async function fetchAcademyProgress() {
    if (!session?.user) return;
    try {
      const { data } = await supabase.from('diar_academy_progress').select('*').eq('user_id', session.user.id);
      setUserProgress(data || []);
    } catch (e) { console.error("Errore progressi:", e); }
  }

  useEffect(() => {
    const setupDeepLinks = async () => {
      await CapacitorApp.addListener('appUrlOpen', async (event) => {
        const url = event.url;
        if (url && url.includes('access_token')) {
          const hash = url.split('#')[1];
          if (hash) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            }
          }
        }
      });
    };

    async function initializeAuth() {
      try {
        await setupDeepLinks();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          await Promise.all([fetchWines(), fetchProfile(currentSession.user.id), fetchAcademyProgress()]);
        }
      } catch (error) { console.error("Errore inizializzazione:", error); } finally { setLoading(false); }
    }
    initializeAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) { fetchWines(); fetchProfile(session.user.id); fetchAcademyProgress(); } else { setWines([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function openTastingExperience(wine) {
    if (!wine) return;
    setLoading(true);
    setSelectedWine(wine);
    try {
      const { data, error } = await supabase.from('diar_tastings').select('*').eq('wine_id', wine.id).order('data_degustazione', { ascending: false }).limit(1);
      if (error) setTastingData(null); else setTastingData(data && data.length > 0 ? data[0] : null);
    } catch (e) { setTastingData(null); } finally { setIsViewingTasting(true); setLoading(false); }
  }

  async function handleSnooze(wineId) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('diar_wines').update({ last_check_date: today }).eq('id', wineId);
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

  const askSommelier = () => {
    const suggestion = getSommelierSuggestion(inStockWines);
    if (suggestion) { setSuggestion(suggestion); setIsSuggestionModalOpen(true); } 
    else { alert("La tua cantina è vuota!"); }
  };

  const safeWines = Array.isArray(wines) ? wines : [];
  const inStockWines = safeWines.filter(w => w && w.in_stock === true);
  const totalBottlesHistory = safeWines.reduce((acc, wine) => acc + (wine ? Number(wine.quantita || 1) : 0), 0);
  const inStockBottlesCount = inStockWines.reduce((acc, wine) => acc + (wine ? Number(wine.quantita || 1) : 0), 0);
  const totalValue = inStockWines.reduce((acc, wine) => {
    const price = wine ? Number(wine.prezzo_acquisto || 0) : 0;
    const qty = wine ? Number(wine.quantita || 1) : 0;
    return acc + (isNaN(price) ? 0 : price) * (isNaN(qty) ? 0 : qty);
  }, 0);
  const statsMap = inStockWines.reduce((acc, wine) => {
    if (!wine) return acc;
    const tipo = wine.tipologia || 'Non specificato';
    const qty = Number(wine.quantita || 1);
    acc[tipo] = (acc[tipo] || 0) + (isNaN(qty) ? 0 : qty);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500">Sintonizzando la cantina... 🍷</div>;
  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-winelink-red text-white p-6 shadow-lg sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wine /> WineDiary <span className="text-sm font-light opacity-80">| Cantina</span>
        </h1>
        <button onClick={() => setView('profile')} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">Profilo</button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {view === 'dashboard' && !selectedWine && !isEditing && !isTasting && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Riepilogo Cantina</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center border-r border-gray-100"><p className="text-2xl font-black text-gray-800">{totalBottlesHistory}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Totale</p></div>
                <div className="text-center border-r border-gray-100"><p className="text-2xl font-black text-winelink-green">{inStockBottlesCount}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Stock</p></div>
                <div className="text-center"><p className="text-2xl font-black text-winelink-red">€{totalValue.toLocaleString()}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Valore</p></div>
              </div>
            </div>

            <button onClick={askSommelier} className="w-full py-5 bg-winelink-red text-white rounded-[1.5rem] font-black uppercase tracking-[0.1em] text-sm shadow-xl shadow-winelink-red/20 flex items-center justify-center gap-3 hover:bg-red-700 transition-all active:scale-95">
              <Sparkles size={20} /> Indeciso su cosa bere?
            </button>

            <div className="space-y-3">
              <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-[2px] bg-winelink-red/20"></span> Tipologie in Cantina
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statsMap).map(([tipo, count]) => (
                  <button key={tipo} onClick={() => { setFilterType(tipo); setView('inventory'); }} className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-2 transition-all hover:scale-105 hover:border-winelink-red active:scale-95 group">
                    <span className="w-2 h-2 rounded-full bg-winelink-red group-hover:scale-125 transition-transform"></span>
                    <span className="text-xs font-bold text-gray-700">{tipo}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-black group-hover:bg-winelink-red/10 group-hover:text-winelink-red transition-colors">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {inStockWines.some(wine => {
              if (!wine || !wine.data_acquisto) return false;
              try { return getSommelierAlert(wine.data_acquisto, wine.tipologia, wine.last_check_date, wine.anno_imbottigliamento) !== null; } catch { return false; }
            }) && (
              <div className="space-y-3 pt-4">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-gray-300"></span> Avvisi Sommelier
                </h2>
                {inStockWines.map(wine => {
                  if (!wine || !wine.data_acquisto) return null;
                  try {
                    const alert = getSommelierAlert(wine.data_acquisto, wine.tipologia, wine.last_check_date, wine.anno_imbottigliamento);
                    return alert ? (
                      <div key={wine.id} className={`${alert.bg} ${alert.color} p-3 rounded-xl border border-current flex items-center justify-between gap-3 shadow-sm mb-2`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{alert.icon}</span>
                          <div><p className="font-bold text-sm leading-tight">{wine.nome_vino}</p><p className="text-[11px] opacity-80">{alert.message}</p></div>
                        </div>
                        <button onClick={() => handleSnooze(wine.id)} className="bg-white/80 hover:bg-white text-gray-700 text-[10px] font-bold py-1 px-2 rounded-md border border-current transition-colors shadow-sm">OK</button>
                      </div>
                    ) : null;
                  } catch { return null; }
                })}
              </div>
            )}
          </div>
        )}

        {view === 'academy' && (
          <Academy session={session} userProgress={userProgress} fetchProgress={fetchAcademyProgress} />
        )}

        {view === 'inventory' && !selectedWine && !isEditing && !isTasting && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800">La mia Cantina</h2>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" placeholder="Cerca per nome o cantina..." className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-winelink-red outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-winelink-red outline-none transition-all cursor-pointer" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="Tutti">Tutte le Tipologie</option>
                {Object.keys(statsMap).map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
              </select>
            </div>
            <div className="grid gap-3">
              {inStockWines.filter(w => (w.nome_vino?.toLowerCase().includes(searchTerm.toLowerCase()) || w.cantina?.toLowerCase().includes(searchTerm.toLowerCase())) && (filterType === 'Tutti' || w.tipologia === filterType)).map(wine => (
                <div key={wine.id} onClick={() => setSelectedWine(wine)} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-winelink-red cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all group">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-bold text-lg leading-tight group-hover:text-winelink-red transition-colors flex-1">{wine.nome_vino}</p>
                    <span className="text-[10px] bg-winelink-red/10 text-winelink-red px-2 py-1 rounded-full font-bold whitespace-nowrap">{wine.tipologia}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><span className="font-semibold">{wine.cantina}</span> • {wine.anno_imbottigliamento}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">🍇 {wine.uvaggio || 'N/D'}</span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">🍷 {wine.gradazione ? `${wine.gradazione}%` : 'Grad. N/D'}</span>
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">📅 Acq: {wine.data_acquisto || 'N/D'}</span>
                      <span className="flex items-center gap-1 bg-winelink-green/10 text-winelink-green px-2 py-1 rounded-md border border-winelink-green/20 font-bold">📦 {wine.quantita || 1} bottiglie</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedWine && !isEditing && !isViewingTasting && !isTasting && (
          <WineDetail wine={selectedWine} onBack={() => setSelectedWine(null)} onTast={() => setIsTasting(true)} onEdit={() => setIsEditing(true)} onSnooze={() => handleSnooze(selectedWine.id)} />
        )}

        {isTasting && selectedWine && (
          <div className="animate-in zoom-in duration-300">
             <TastingForm wine={selectedWine} onSave={() => { setIsTasting(false); fetchWines(); }} onCancel={() => setIsTasting(false)} />
          </div>
        )}

        {isViewingTasting && selectedWine && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-gray-800 p-6 text-white relative">
                <button onClick={() => setIsViewingTasting(false)} className="absolute right-4 top-4 text-white/60 hover:text-white"><X size={24} /></button>
                <h2 className="text-xl font-black uppercase tracking-tight">{selectedWine.nome_vino}</h2>
                <p className="text-xs opacity-80 font-medium">{selectedWine.cantina} • {tastingData?.data_degustazione || 'N/D'}</p>
              </div>
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {tastingData ? (
                  <>
                    <div className="flex items-center justify-between bg-winelink-yellow/10 p-3 rounded-2xl">
                      <span className="text-sm font-bold text-winelink-yellow uppercase">Valutazione</span>
                      <div className="flex items-center gap-1"><Star className="fill-winelink-yellow text-winelink-yellow" size={20} /><span className="text-lg font-black text-winelink-yellow">{tastingData.voto_stelle}</span></div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dettaglio Sensoriale</p>
                      <DetailRow label="Acidità" value={tastingData.acidita} />
                      <DetailRow label="Tannicità" value={tastingData.tannicita} />
                      <DetailRow label="Morbidezza" value={tastingData.morbidezza} />
                      <DetailRow label="Intensità" value={tastingData.intensita} />
                      <DetailRow label="Persistenza" value={tastingData.persistenza} />
                      <DetailRow label="Alcolicità" value={tastingData.alcolicita} />
                      <DetailRow label="Dolcezza" value={tastingData.dolcezza} />
                    </div>
                    {tastingData.fis_conclusione && (
                      <div className="pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Note</p>
                        <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">"{tastingData.fis_conclusione}"</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-10">Nessuna nota registrata.</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <button onClick={() => setIsViewingTasting(false)} className="w-full py-3 text-winelink-red font-black uppercase text-xs tracking-widest">Chiudi</button>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="max-w-2xl mx-auto">
            <WineForm existingWine={selectedWine} isPremium={isPremium} winesCount={wines.length} onSave={() => { setIsEditing(false); fetchWines(); }} onCancel={() => { setIsEditing(false); setSelectedWine(null); }} onLimitReached={() => setView('profile')} />
          </div>
        )}

        {view === 'add' && !isEditing && !isTasting && (
          <div className="max-w-2xl mx-auto">
            <WineForm isPremium={isPremium} winesCount={wines.length} onSave={() => { fetchWines(); setView('dashboard'); }} onCancel={() => setView('dashboard')} onLimitReached={() => setView('profile')} />
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Vini Degustati</h2>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" placeholder="Cerca nei tuoi ricordi..." className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-winelink-red outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-winelink-red outline-none transition-all cursor-pointer" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="Tutti">Tutte le Tipologie</option>
                {Object.keys(statsMap).map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
              </select>
            </div>
            <div className="grid gap-5">
              {wines.filter(w => !w.in_stock).filter(w => (w.nome_vino?.toLowerCase().includes(searchTerm.toLowerCase()) || w.cantina?.toLowerCase().includes(searchTerm.toLowerCase())) && (filterType === 'Tutti' || w.tipologia === filterType)).map(wine => (
                <div key={wine.id} onClick={() => { setSelectedWine(wine); openTastingExperience(wine); }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-winelink-red/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-black text-lg text-gray-800 group-hover:text-winelink-red transition-colors uppercase tracking-tight">{wine.nome_vino}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase">{wine.cantina} • {wine.anno_imbottigliamento}</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                         <span className="text-[11px] font-bold text-winelink-red flex items-center gap-1">🍇 {wine.uvaggio || 'N/D'}</span>
                         <span className="text-[11px] font-bold text-winelink-red flex items-center gap-1">🍷 {wine.gradazione ? `${wine.gradazione}%` : 'N/D'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-winelink-red/5 text-winelink-red border border-winelink-red/20 px-3 py-1 rounded-lg font-black uppercase tracking-wider">{wine.tipologia}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wide"><Calendar size={14}/> {wine.data_acquisto || 'N/D'}</div>
                    <div className="text-winelink-red text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">Dettagli <ArrowRight size={14}/></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <MiniScore label="A" val={wine.acidita} color="text-yellow-500" />
                    <MiniScore label="T" val={wine.tannicita} color="text-red-700" />
                    <MiniScore label="M" val={wine.morbidezza} color="text-blue-400" />
                    <MiniScore label="I" val={wine.intensita} color="text-purple-500" />
                    <MiniScore label="P" val={wine.persistenza} color="text-orange-500" />
                    <MiniScore label="Al" val={wine.alcolicita} color="text-red-400" />
                    <MiniScore label="D" val={wine.dolcezza} color="text-pink-400" />
                  </div>
                </div>
              ))}
              {wines.filter(w => !w.in_stock && (w.nome_vino?.toLowerCase().includes(searchTerm.toLowerCase()) || w.cantina?.toLowerCase().includes(searchTerm.toLowerCase())) && (filterType === 'Tutti' || w.tipologia === filterType)).length === 0 && (
                <div className="text-center py-10 text-gray-400"><p>Nessun ricordo trovato... 🍷</p></div>
              )}
            </div>
          </div>
        )}

        {view === 'profile' && (
          <Profile 
            user={session?.user} 
            isPremium={isPremium} 
            onLogout={handleLogout} 
            userProgress={userProgress} 
            statsMap={statsMap} 
          />
        )}
      </main>

      {isSuggestionModalOpen && suggestion && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-winelink-red p-8 text-white text-center relative">
              <button onClick={() => setIsSuggestionModalOpen(false)} className="absolute right-4 top-4 text-white/60 hover:text-white"><X size={24} /></button>
              <div className="text-5xl mb-4">{suggestion.icon}</div>
              <h2 className="text-xl font-black uppercase tracking-tight">Il Sommelier consiglia:</h2>
            </div>
            <div className="p-8 text-center">
              <p className="text-lg font-bold text-gray-800 mb-2">{suggestion.wineName}</p>
              <p className="text-md italic text-gray-600 leading-relaxed">"{suggestion.message}"</p>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button onClick={() => setIsSuggestionModalOpen(false)} className="w-full py-3 text-winelink-red font-black uppercase text-xs tracking-widest">Capito! 🍷</button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 shadow-2xl z-50">
        <NavButton active={view === 'dashboard' && !selectedWine && !isEditing && !isTasting} onClick={() => {setView('dashboard'); setSelectedWine(null); setIsEditing(false); setIsTasting(false);}} icon={<LayoutDashboard />} label="Home" />
        <NavButton active={view === 'inventory' && !selectedWine && !isEditing && !isTasting} onClick={() => {setView('inventory'); setSelectedWine(null); setIsEditing(false); setIsTasting(false);}} icon={<Search />} label="Cantina" />
        <NavButton active={view === 'add' && !selectedWine && !isEditing && !isTasting} onClick={() => {setView('add'); setSelectedWine(null); setIsEditing(false); setIsTasting(false);}} icon={<PlusCircle />} label="Aggiungi" />
        <NavButton active={view === 'history' && !selectedWine && !isEditing && !isTasting} onClick={() => {setView('history'); setSelectedWine(null); setIsEditing(false); setIsTasting(false);}} icon={<History />} label="Bevuti" />
        <NavButton active={view === 'academy' && !selectedWine && !isEditing && !isTasting} onClick={() => {setView('academy'); setSelectedWine(null); setIsEditing(false); setIsTasting(false);}} icon={<GraduationCap />} label="Academy" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-winelink-red' : 'text-gray-400'}`}>{icon}<span className="text-[10px] font-medium">{label}</span></button>;
}

function MiniScore({ label, val, color }) {
  if (val === undefined || val === null) return null; 
  const numVal = Number(val);
  if (isNaN(numVal)) return null;
  return (
    <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
      <span className="text-[8px] font-black text-gray-400 uppercase">{label}</span>
      <span className={`text-[9px] font-black ${color}`}>{numVal.toFixed(1)}</span>
    </div>
  );
}

function DetailRow({ label, value }) {
  const numVal = value ? Number(value) : null;
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-1">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <span className="text-xs font-black text-winelink-red">{numVal !== null && !isNaN(numVal) ? numVal.toFixed(1) : 'N/D'}</span>
    </div>
  );
}

export default App;