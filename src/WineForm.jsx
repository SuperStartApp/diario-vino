import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Save, X, Wine, MapPin, Calendar, DollarSign, Percent, Package } from 'lucide-react';

const TIPOLOGIE = ['Rossi', 'Bianchi', 'Rosati', 'Bollicine', 'Champagne', 'Passito/Dolce', 'Macerato'];
const REGIONI = ['Piemonte', 'Valle d\'Aosta', 'Lombardia', 'Trentino-Alto Adige', 'Veneto', 'Friuli Venezia Giulia', 'Liguria', 'Emilia-Romagna', 'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Molise', 'Campania', 'Puglia', 'Basilicata', 'Calabria', 'Sardegna', 'Sicilia', 'Estero'];

const DRAFT_KEY = 'winelink_wine_draft';

function WineForm({ existingWine, onSave, onCancel, isPremium, winesCount }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (existingWine) return existingWine;
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try { return JSON.parse(savedDraft); } catch (e) { console.error(e); }
    }
    return {
      nome_vino: '', cantina: '', uvaggio: '', tipologia: 'Rossi', denominazione: '',
      anno_imbottigliamento: '', regione: 'Toscana', gradazione: '', prezzo_acquisto: '',
      data_acquisto: new Date().toISOString().split('T')[0], posizione: '', note_generali: '', in_stock: true,
      quantita: 1
    };
  });

  useEffect(() => { if (existingWine) setFormData(existingWine); }, [existingWine]);
  useEffect(() => { if (!existingWine) localStorage.setItem(DRAFT_KEY, JSON.stringify(formData)); }, [formData, existingWine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const cleanData = (data) => {
    const cleaned = { ...data };
    const numericFields = ['anno_imbottigliamento', 'gradazione', 'prezzo_acquisto', 'quantita'];
    numericFields.forEach(field => { if (cleaned[field] === '') cleaned[field] = null; });
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ BLOCCO 25 VINI: Se non è premium, ha già 25 vini e sta aggiungendo un nuovo vino
    if (!isPremium && winesCount >= 25 && !existingWine) {
      alert("Hai raggiunto il limite di 25 bottiglie per l'account gratuito. Passa a Premium per sbloccare la tua cantina! 🍷");
      return;
    }

    setLoading(true);
    try {
      const dataToSave = cleanData(formData);
      if (existingWine) {
        const { error } = await supabase.from('diar_wines').update(dataToSave).eq('id', existingWine.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utente non autenticato");
        const { error } = await supabase.from('diar_wines').insert([{ ...dataToSave, user_id: user.id }]);
        if (error) throw error;
        localStorage.removeItem(DRAFT_KEY);
      }
      onSave();
    } catch (error) {
      alert('Errore: ' + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-winelink-red flex items-center gap-2"><Wine /> {existingWine ? 'Modifica Bottiglia' : 'Nuova Bottiglia'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome del Vino</label>
          <input required name="nome_vino" value={formData.nome_vino} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" />
        </div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Cantina</label><input name="cantina" value={formData.cantina} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Uvaggio</label><input name="uvaggio" value={formData.uvaggio} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipologia</label>
          <select name="tipologia" value={formData.tipologia} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none">
            {TIPOLOGIE.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Denominazione</label><input name="denominazione" value={formData.denominazione} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Regione</label>
          <select name="regione" value={formData.regione} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none">
            {REGIONI.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Anno Imbott.</label><input type="number" name="anno_imbottigliamento" value={formData.anno_imbottigliamento} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Data Acquisto</label><input type="date" name="data_acquisto" value={formData.data_acquisto} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Gradazione</label><input type="number" step="0.1" name="gradazione" value={formData.gradazione} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Prezzo</label><input type="number" step="0.01" name="prezzo_acquisto" value={formData.prezzo_acquisto} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Package size={12}/> Quantità</label>
          <input type="number" name="quantita" value={formData.quantita} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" min="1" />
        </div>
        <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Posizione</label><input name="posizione" value={formData.posizione} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none" /></div>
        <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase ml-1">Note</label><textarea name="note_generali" value={formData.note_generali} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none h-24" /></div>
        <div className="md:col-span-2 mt-4">
          <button disabled={loading} className="w-full bg-winelink-red text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-800 transition-all shadow-lg disabled:bg-gray-400">
            <Save size={20}/> {loading ? 'Salvataggio...' : 'Salva Bottiglia'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default WineForm;