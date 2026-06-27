import React, { useState } from 'react';
import { supabase } from './supabaseClient';
// AGGIUNTO 'Info' QUI SOTTO 👇
import { Star, Save, Info } from 'lucide-react';

function TastingForm({ wine, onSave, onComplete, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    voto_stelle: 3,
    acidita: 5.0,
    tannicita: 5.0,
    morbidezza: 5.0,
    intensita: 5.0,
    persistenza: 5.0,
    alcolicita: 5.0,
    dolcezza: 1.0,
    note_veloci: ''
  });

  const handleSliderChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: tasteError } = await supabase
        .from('diar_tastings')
        .insert([{ 
          wine_id: wine.id,
          voto_stelle: formData.voto_stelle,
          acidita: formData.acidita,
          tannicita: formData.tannicita,
          morbidezza: formData.morbidezza,
          intensita: formData.intensita,
          persistenza: formData.persistenza,
          alcolicita: formData.alcolicita,
          dolcezza: formData.dolcezza,
          fis_visivo: `A:${formData.acidita}, T:${formData.tannicita}`,
          fis_olfattivo: `M:${formData.morbidezza}, I:${formData.intensita}`,
          fis_gustativo: `Al:${formData.alcolicita}, D:${formData.dolcezza}`,
          fis_conclusione: formData.note_veloci
        }]);

      if (tasteError) throw tasteError;

      const currentQty = wine.quantita || 1;
      const newQty = currentQty - 1;
      const updateData = { quantita: newQty };
      if (newQty <= 0) updateData.in_stock = false;

      const { error: stockError } = await supabase
        .from('diar_wines')
        .update(updateData)
        .eq('id', wine.id);

      if (stockError) throw stockError;

      alert(newQty > 0 ? 'Degustazione salvata! 🍷' : 'Ultima bottiglia bevuta! 🥂');
      
      if (onSave) {
        onSave();
      } else if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Errore:", error);
      alert(`Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-winelink-red uppercase tracking-tighter">Degustazione</h2>
        <button onClick={onCancel} className="text-gray-400 font-bold text-xl">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center py-4 bg-gray-50 rounded-3xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Valuta il vino</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <Star 
                key={num} 
                onClick={() => setFormData({...formData, voto_stelle: num})}
                className={`cursor-pointer transition-all ${num <= formData.voto_stelle ? 'fill-winelink-yellow text-winelink-yellow scale-125' : 'text-gray-300'}`}
                size={36}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* PASS IAMO LE DESCRIZIONI A OGNI SLIDER */}
          <SensorySlider 
            label="Acidità" 
            value={formData.acidita} 
            onChange={(v) => handleSliderChange('acidita', v)} 
            color="bg-yellow-400" 
            info="La sensazione di freschezza o vivacità sulla lingua."
          />
          <SensorySlider 
            label="Tannicità" 
            value={formData.tannicita} 
            onChange={(v) => handleSliderChange('tannicita', v)} 
            color="bg-red-700" 
            info="La sensazione di astringenza (che 'asciuga' la bocca)."
          />
          <SensorySlider 
            label="Morbidezza" 
            value={formData.morbidezza} 
            onChange={(v) => handleSliderChange('morbidezza', v)} 
            color="bg-blue-400" 
            info="Quanto il vino risulta vellutato e non aggressivo."
          />
          <SensorySlider 
            label="Intensità" 
            value={formData.intensita} 
            onChange={(v) => handleSliderChange('intensita', v)} 
            color="bg-purple-500" 
            info="La forza dei profumi e dei sapori percepiti."
          />
          <SensorySlider 
            label="Persistenza" 
            value={formData.persistenza} 
            onChange={(v) => handleSliderChange('persistenza', v)} 
            color="bg-orange-500" 
            info="Quanto a lungo il sapore resta in bocca dopo il sorso."
          />
          <SensorySlider 
            label="Alcolicità" 
            value={formData.alcolicita} 
            onChange={(v) => handleSliderChange('alcolicita', v)} 
            color="bg-red-400" 
            info="La percezione del calore alcolico in gola."
          />
          <SensorySlider 
            label="Dolcezza (Solo vini dolci o passiti)" 
            value={formData.dolcezza} 
            onChange={(v) => handleSliderChange('dolcezza', v)} 
            color="bg-pink-400" 
            info="Intensità di note dolci sul palato."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Note Veloci</label>
          <input 
            type="text"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-winelink-red outline-none text-sm"
            placeholder="Es: Note di ciliegia..."
            value={formData.note_veloci}
            onChange={e => setFormData({...formData, note_veloci: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-winelink-red text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Salvataggio...' : <><Save size={22}/> Conferma Degustazione</>}
        </button>
      </form>
    </div>
  );
}

// COMPONENTE SLIDER CON LOGICA INFO
function SensorySlider({ label, value, onChange, color, info }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">{label}</label>
          {/* ICONA INFO */}
          <button 
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-400 hover:text-winelink-red transition-colors"
          >
            <Info size={14} />
          </button>
        </div>
        <span className="text-xs font-black text-winelink-red">{value.toFixed(1)}</span>
      </div>

      {/* TESTO INFORMATIVO (Appare solo se cliccato) */}
      {showInfo && (
        <div className="text-[10px] text-gray-500 italic bg-gray-50 p-2 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200 border-l-2 border-winelink-red ml-1">
          {info}
        </div>
      )}

      <input 
        type="range" min="1" max="10" step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-winelink-red ${color}`}
      />
    </div>
  );
}

export default TastingForm;