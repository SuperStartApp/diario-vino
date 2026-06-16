import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Wine, MapPin, Calendar, Percent, DollarSign, ArrowLeft, Edit, CheckCircle, Trash2, Package } from 'lucide-react';
import { supabase } from './supabaseClient';

function WineDetail({ wine, onBack, onTast, onEdit, onSnooze }) {
  const qrValue = `https://winelink.app/wine/${wine.id}`;

  const handleDelete = async () => {
    if (window.confirm(`Sei sicuro di voler eliminare definitivamente ${wine.nome_vino}?`)) {
      const { error } = await supabase.from('diar_wines').delete().eq('id', wine.id);
      if (error) alert('Errore durante l\'eliminazione');
      else onBack(); // Torna alla lista
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-winelink-red font-medium"><ArrowLeft size={20}/> Torna</button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-gray-600 text-sm border hover:text-winelink-red transition-colors"><Edit size={16}/> Modifica</button>
          <button onClick={handleDelete} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-red-600 text-sm border hover:bg-red-50 transition-colors"><Trash2 size={16}/> Elimina</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className={`p-6 text-white ${wine.tipologia === 'Rossi' ? 'bg-red-800' : 'bg-green-700'}`}>
          <h2 className="text-3xl font-bold">{wine.nome_vino}</h2>
          <p className="opacity-90">{wine.cantina} • {wine.anno_imbottigliamento}</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <InfoRow icon={<MapPin size={18}/>} label="Regione" value={wine.regione} />
            <InfoRow icon={<Wine size={18}/>} label="Uvaggio" value={wine.uvaggio} />
            <InfoRow icon={<Wine size={18}/>} label="Tipologia" value={wine.tipologia} />
            <InfoRow icon={<Calendar size={18}/>} label="Imbottigliamento" value={wine.anno_imbottigliamento} />
            <InfoRow icon={<Calendar size={18}/>} label="Data Acquisto" value={wine.data_acquisto} />
            <InfoRow icon={<Percent size={18}/>} label="Gradazione" value={wine.gradazione ? `${wine.gradazione}%` : 'Non specificata'} />
            <InfoRow icon={<DollarSign size={18}/>} label="Prezzo" value={wine.prezzo_acquisto ? `€ ${wine.prezzo_acquisto}` : 'Non specificato'} />
            <InfoRow icon={<Package size={18}/>} label="Quantità" value={`${wine.quantita || 1} bottiglie`} />
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
            <QRCodeCanvas value={qrValue} size={150} className="bg-white p-2 rounded-lg shadow-sm mb-4" />
            <button onClick={onSnooze} className="mb-4 flex items-center gap-2 text-xs text-green-600 font-bold hover:underline"><CheckCircle size={14}/> Tutto ok, rimandalo a tra 3 mesi</button>
            <button onClick={onTast} className="w-full bg-winelink-red text-white p-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">🍷 Degusta Ora</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-gray-700">
      <span className="text-winelink-red">{icon}</span>
      <span className="text-sm font-medium text-gray-400 w-28">{label}:</span>
      <span className="text-sm font-bold">{value || 'Non specificato'}</span>
    </div>
  );
}
export default WineDetail;