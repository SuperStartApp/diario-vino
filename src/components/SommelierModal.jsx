import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Users, Utensils, CloudSun, Palette } from 'lucide-react';
import { calculateBestWine } from '../utils/sommelierLogic';

const SommelierModal = ({ isOpen, onClose, wines }) => {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState({ occasion: '', food: '', flavor: '', climate: '' });
  const [suggestion, setSuggestion] = useState(null);

  if (!isOpen) return null;

  const handleChoice = (key, value) => {
    const newChoices = { ...choices, [key]: value };
    setChoices(newChoices);

    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      // REGOLA DEL SOMMELIER: Se è formaggio, salta la domanda sul sapore/cottura
      if (value.includes('Formaggi')) {
        setStep(3); // Salta direttamente al clima
      } else {
        setStep(2); // Vai alla domanda sul sapore
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const result = calculateBestWine(wines, newChoices);
      if (result.error) {
        alert("Il Sommelier non trova l'abbinamento perfetto in cantina, prova a cambiare portata o clima!");
      } else {
        setSuggestion(result);
        setStep(4);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setChoices({ occasion: '', food: '', flavor: '', climate: '' });
    setSuggestion(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        
        <div className="bg-winelink-red p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h2 className="text-lg font-black uppercase tracking-tight">Sommelier Digitale</h2>
          </div>
          <button onClick={reset} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          {step < 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Users size={40} className="mx-auto text-winelink-red mb-2" />
                    <p className="font-bold text-gray-800">Che tipo di serata è?</p>
                  </div>
                  <div className="grid gap-3">
                    {['Amici', 'Lavoro', 'Relax', 'Altro'].map(opt => (
                      <button key={opt} onClick={() => handleChoice('occasion', opt)} className="w-full py-3 px-4 rounded-xl border-2 border-gray-100 hover:border-winelink-red hover:bg-red-50 font-bold text-gray-700 transition-all active:scale-95 text-left flex justify-between items-center">
                        {opt} <ArrowRight size={16} className="text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Utensils size={40} className="mx-auto text-winelink-red mb-2" />
                    <p className="font-bold text-gray-800">Cosa state mangiando?</p>
                  </div>
                  <div className="grid gap-3">
                    {['Carne Rossa', 'Carne Bianca', 'Pesce', 'Pasta', 'Tagliere', 'Verdure', 'Formaggi Duri', 'Formaggi Erborinati'].map(opt => (
                      <button key={opt} onClick={() => handleChoice('food', opt)} className="w-full py-3 px-4 rounded-xl border-2 border-gray-100 hover:border-winelink-red hover:bg-red-50 font-bold text-gray-700 transition-all active:scale-95 text-left flex justify-between items-center">
                        {opt} <ArrowRight size={16} className="text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Palette size={40} className="mx-auto text-winelink-red mb-2" />
                    <p className="font-bold text-gray-800">Com'è il profilo del piatto?</p>
                    <p className="text-xs text-gray-400 italic">Il condimento cambia l'abbinamento</p>
                  </div>
                  <div className="grid gap-3">
                    {['Leggero', 'Sapido', 'Speziato', 'Ricco/Grasso'].map(opt => (
                      <button key={opt} onClick={() => handleChoice('flavor', opt)} className="w-full py-3 px-4 rounded-xl border-2 border-gray-100 hover:border-winelink-red hover:bg-red-50 font-bold text-gray-700 transition-all active:scale-95 text-left flex justify-between items-center">
                        {opt} <ArrowRight size={16} className="text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <CloudSun size={40} className="mx-auto text-winelink-red mb-2" />
                    <p className="font-bold text-gray-800">Com'è il clima esterno?</p>
                  </div>
                  <div className="grid gap-3">
                    {['Caldo', 'Freddo', 'Tiepido'].map(opt => (
                      <button key={opt} onClick={() => handleChoice('climate', opt)} className="w-full py-3 px-4 rounded-xl border-2 border-gray-100 hover:border-winelink-red hover:bg-red-50 font-bold text-gray-700 transition-all active:scale-95 text-left flex justify-between items-center">
                        {opt} <ArrowRight size={16} className="text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && suggestion && (
            <div className="text-center space-y-6 animate-in zoom-in duration-300">
              <div className="text-6xl mb-2">{suggestion.icon}</div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Il Sommelier consiglia:</h2>
              <p className="text-2xl font-black text-winelink-red leading-tight">{suggestion.wine.nome_vino}</p>
              <p className="text-sm italic text-gray-600 leading-relaxed px-2">"{suggestion.message}"</p>
              
              <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 leading-tight italic px-4">
                  "Il Sommelier Digitale suggerisce l'abbinamento basandosi su principi enologici. 
                  Tuttavia, l'ultima parola spetta sempre al tuo palato e alla tua sensibilità."
                </p>
              </div>
            </div>
          )}
        </div>

        {step === 4 && (
          <div className="p-6 bg-gray-50 text-center border-t border-gray-100 shrink-0">
            <button onClick={reset} className="w-full py-4 bg-winelink-red text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-md">
              Capito! 🍷
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SommelierModal;