import React, { useState } from 'react';
import { Wine, MapPin, Calendar, Percent, DollarSign, ArrowLeft, Edit, CheckCircle, Trash2, Package, AlertTriangle } from 'lucide-react';
import { supabase } from './supabaseClient';

function WineDetail({ wine, onBack, onTast, onEdit, onSnooze }) {
  // STATO PER LA CONFERMA ELIMINAZIONE
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startDeleteProcess = () => {
    setIsConfirmingDelete(true);
  };

  const cancelDeleteProcess = () => {
    setIsConfirmingDelete(false);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('diar_wines')
        .delete()
        .eq('id', wine.id);

      if (error) {
        alert('Errore durante l\'eliminazione: ' + error.message);
      } else {
        onBack();
      }
    } catch (err) {
      alert('Errore imprevisto: ' + err.message);
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      {/* HEADER CON BOTTONI */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-winelink-red font-medium">
          <ArrowLeft size={20}/> Torna
        </button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-gray-600 text-sm border hover:text-winelink-red transition-colors">
            <Edit size={16}/> Modifica
          </button>
          {!isConfirmingDelete && (
            <button 
              onClick={startDeleteProcess} 
              className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-red-600 text-sm border hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16}/> Elimina
            </button>
          )}
        </div>
      </div>

      {/* MODALE DI CONFERMA ELIMINAZIONE */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-red-100 animate-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
            <h3 className="text-center text-lg font-bold text-gray-800 mb-2">Sei sicuro?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              Vuoi eliminare definitivamente <span className="font-bold text-gray-700">{wine.nome_vino}</span>? Questa azione non può essere annullata.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 disabled:bg-red-300 transition-all"
              >
                {isDeleting ? 'Eliminazione...' : 'Sì, elimina tutto'}
              </button>
              <button 
                onClick={cancelDeleteProcess}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold active:scale-95 transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENUTO PRINCIPALE */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className={`p-6 text-white ${wine.tipologia === 'Rossi' ? 'bg-red-800' : 'bg-green-700'}`}>
          <h2 className="text-3xl font-bold">{wine.nome_vino}</h2>
          <p className="opacity-90">{wine.cantina} • {wine.anno_imbottigliamento}</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLONNA INFO */}
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

          {/* AREA AZIONI (Senza QR Code) */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
            <div className="mb-6">
              <div className="bg-winelink-red/10 p-4 rounded-full inline-block mb-4">
                <Wine className="text-winelink-red" size={40} />
              </div>
              <p className="text-gray-500 text-sm italic">Pronto per scoprire i segreti di questa bottiglia?</p>
            </div>
            
            <button 
              onClick={onSnooze} 
              className="mb-6 flex items-center gap-2 text-xs text-green-600 font-bold hover:underline transition-all"
            >
              <CheckCircle size={14}/> Tutto ok, rimandalo a tra 3 mesi
            </button>
            
            <button 
              onClick={onTast} 
              className="w-full bg-winelink-red text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              🍷 Degusta Ora
            </button>
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