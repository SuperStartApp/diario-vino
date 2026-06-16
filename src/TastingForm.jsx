import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Star, Save, ChevronDown, ChevronUp } from 'lucide-react';

function TastingForm({ wine, onComplete, onCancel }) {
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    voto_stelle: 3,
    impressioni_rapide: '',
    fis_visivo: '',
    fis_olfattivo: '',
    fis_gustativo: '',
    fis_conclusione: '',
    abbinamento_cibo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Inserisci la degustazione nella tabella dei tasting
      const { error: tasteError } = await supabase
        .from('diar_tastings')
        .insert([{ ...formData, wine_id: wine.id }]);

      if (tasteError) throw tasteError;

      // 2. LOGICA QUANTITÀ: Sottrai 1 bottiglia dallo stock
      const currentQty = wine.quantita || 1;
      const newQty = currentQty - 1;
      
      const updateData = { quantita: newQty };
      
      // Se la quantità arriva a 0 o meno, il vino non è più in stock
      if (newQty <= 0) {
        updateData.in_stock = false;
      }

      const { error: stockError } = await supabase
        .from('diar_wines')
        .update(updateData)
        .eq('id', wine.id);

      if (stockError) throw stockError;

      alert(newQty > 0 
        ? `Degustazione salvata! Hai ancora ${newQty} bottiglie in cantina. 🍷` 
        : 'Ultima bottiglia bevuta! Spostata nello storico. 🥂'
      );
      
      onComplete();
    } catch (error) {
      console.error(error);
      alert('Errore durante il salvataggio della degustazione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in duration-300 max-w-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-winelink-red">Degustazione</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">X</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* VOTO STELLE */}
        <div className="text-center py-4 bg-gray-50 rounded-2xl">
          <p className="text-sm font-bold text-gray-500 mb-2 uppercase">Il tuo voto</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <Star 
                key={num} 
                onClick={() => setFormData({...formData, voto_stelle: num})}
                className={`cursor-pointer transition-all ${num <= formData.voto_stelle ? 'fill-winelink-yellow text-winelink-yellow scale-125' : 'text-gray-300'}`}
                size={32}
              />
            ))}
          </div>
        </div>

        {/* IMPRESSIONI RAPIDE */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Prime Impressioni</label>
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none"
            placeholder="Com'è il primo sorso?"
            value={formData.impressioni_rapide}
            onChange={e => setFormData({...formData, impressioni_rapide: e.target.value})}
          />
        </div>

        {/* TOGGLE ANALISI DETTAGLIATA */}
        <button 
          type="button"
          onClick={() => setIsFull(!isFull)}
          className="w-full flex items-center justify-between p-3 bg-winelink-red/10 text-winelink-red rounded-xl font-bold text-sm"
        >
          {isFull ? 'Chiudi Analisi' : 'Apri Analisi Dettagliata 📜'}
          {isFull ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
        </button>

        {isFull && (
          <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top duration-300">
            <FISInput label="Analisi Visiva" name="fis_visivo" value={formData.fis_visivo} onChange={setFormData} placeholder="Colore, limpidità..." />
            <FISInput label="Analisi Olfattiva" name="fis_olfattivo" value={formData.fis_olfattivo} onChange={setFormData} placeholder="Intensità, profumi..." />
            <FISInput label="Analisi Gustativa" name="fis_gustativo" value={formData.fis_gustativo} onChange={setFormData} placeholder="Equilibrio, persistenza..." />
            <FISInput label="Conclusione" name="fis_conclusione" value={formData.fis_conclusione} onChange={setFormData} placeholder="Giudizio finale..." />
            <FISInput label="Abbinamento Cibo" name="abbinamento_cibo" value={formData.abbinamento_cibo} onChange={setFormData} placeholder="Con cosa l'hai bevuto?" />
          </div>
        )}

        <button 
          disabled={loading}
          className="w-full bg-winelink-red text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 transition-all active:scale-95"
        >
          {loading ? 'Salvataggio...' : <><Save size={20}/> Conferma Degustazione</>}
        </button>
      </form>
    </div>
  );
}

function FISInput({ label, name, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
      <input 
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-winelink-red outline-none"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(prev => ({ ...prev, [name]: e.target.value }))}
      />
    </div>
  );
}

export default TastingForm;