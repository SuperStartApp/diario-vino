import { differenceInMonths, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// --- TRADUTTORE PER LA GRAMMATICA ---
// Questo oggetto trasforma il nome della categoria (plurale) 
// nel nome naturale del vino (singolare) per le frasi.
const tipologiaSingolare = {
  'Bianchi': 'bianco',
  'Rossi': 'rosso',
  'Rosati': 'rosato',
  'Bollicine': 'bollicina',
  'Champagne': 'champagne',
  'Passito/Dolce': 'dolce',
  'Macerato': 'macerato'
};

// Funzione di supporto per ottenere il nome corretto
const getSingular = (tipologia) => {
  return tipologiaSingolare[tipologia] || tipologia.toLowerCase();
};

// --- 1. GESTIONE ALERT (IL GUARDIANO) ---
export const getSommelierAlert = (dataAcquisto, tipologia, lastCheckDate, annoImbottigliamento) => {
  
  // Otteniamo la versione grammaticalmente corretta (es: "bianco" invece di "Bianchi")
  const singolare = getSingular(tipologia);

  // 1. Gestione Snooze
  if (lastCheckDate) {
    const monthsSinceCheck = differenceInMonths(new Date(), new Date(lastCheckDate));
    if (monthsSinceCheck < 3) return null;
  }

  const currentYear = new Date().getFullYear();
  const ageSinceBottling = currentYear - annoImbottigliamento;

  // ==========================================================================
  // LIVELLO 1: ALERT SU ANNATA (Maturità del vino)
  // ==========================================================================
  
  // Allarme per Bianchi e Rosati (3 anni)
  if ((tipologia === 'Bianchi' || tipologia === 'Rosati') && ageSinceBottling >= 3) {
    return {
      message: `⚠️ ATTENZIONE: Questo ${singolare} è del ${annoImbottigliamento}. Dopo 3 anni rischia di perdere la sua freschezza. Bevilo presto!`,
      color: 'text-winelink-red',
      bg: 'bg-red-100',
      icon: '🚨'
    };
  }

  // Allarme per Bollicine/Champagne (5 anni)
  if ((tipologia === 'Bollicine' || tipologia === 'Champagne') && ageSinceBottling >= 5) {
    return {
      message: `✨ UN CLASSICO: La tua ${singolare} del ${annoImbottigliamento} ha raggiunto il picco. Momento perfetto per l'apertura!`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: '⭐'
    };
  }

  // Allarme per Rossi (8 anni)
  if (tipologia === 'Rossi' && ageSinceBottling >= 8) {
    return {
      message: `✨ UN CLASSICO: Questo ${singolare} del ${annoImbottliamento} è un pezzo d'epoca. È nel suo momento d'oro!`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: '⭐'
    };
  }

  // ==========================================================================
  // LIVELLO 2: ALERT SU DATA ACQUISTO (Dimenticanza)
  // ==========================================================================
  if (!dataAcquisto) return null;

  const monthsSincePurchase = differenceInMonths(new Date(), new Date(dataAcquisto));
  const distance = formatDistanceToNow(new Date(dataAcquisto), { addSuffix: true, locale: it });

  // Allarme Bianco/Rosato dimenticato (12 mesi)
  if ((tipologia === 'Bianchi' || tipologia === 'Rosati') && monthsSincePurchase >= 12) {
    return {
      message: `⚠️ ATTENZIONE: Questo ${singolare} è in cantina da ${distance}. Bevilo prima che perda il suo splendore!`,
      color: 'text-winelink-red',
      bg: 'bg-red-100',
      icon: '🚨'
    };
  }

  // Promemoria standard (3 mesi)
  if (monthsSincePurchase >= 3) {
    return {
      message: `Ehilà! Questo ${singolare} è in cantina da ${distance}, non l'hai dimenticato?`,
      color: 'text-winelink-yellow',
      bg: 'bg-yellow-50',
      icon: '🍷'
    };
  }

  return null;
};

// --- 2. GESTIONE SUGGERIMENTI (IL CONNOISSEUR) ---
export const getSommelierSuggestion = (inStockWines) => {
  if (inStockWines.length === 0) return null;

  const month = new Date().getMonth();
  const isSummer = month >= 5 && month <= 8; 
  const isWinter = month === 11 || month === 0 || month === 1; 

  const wine = inStockWines[Math.floor(Math.random() * inStockWines.length)];
  const tipo = wine.tipologia;
  const singolare = getSingular(tipo); // Usiamo il singolare anche qui!

  const templates = {
    fresco: [
      `È una giornata splendida, che ne dici di un ${singolare} servito ben fresco? 🥂`,
      `Per rinfrescarti, ti suggerisco di stappare questo ${singolare}. 🧊`, 
      `Sento un desiderio di leggerezza... questo ${singolare} sarebbe perfetto! ✨`
    ],
    strutturato: [
      `Il clima invita alla convivialità... un ${singolare} strutturato sarebbe ideale. 🍷`,
      `C'è bisogno di carattere! Ti consiglio questo ${singolare} per una serata speciale. 🌟`,
      `Per una serata avvolgente, punta su questo ${singolare}. 🕯️`
    ],
    celebrativo: [
      `Perché aspettare? Celebra il momento con questa ${singolare}! 🍾`,
      `C'è qualcosa da brindare? Questa ${singolare} è la scelta giusta! 🥂`,
      `Rendi speciale la serata con questa splendida ${singolare}. ✨`
    ],
    generico: [
      `Se non sai cosa scegliere, questo ${singolare} non delude mai. 😊`,
      `Ti va di provare qualcosa di interessante? Vai con questo ${singolare}! 🍷`,
      `Il mio consiglio d'autore? Questo ${singolare} è una garanzia. ⭐`
    ]
  };

  let selectedTemplate;

  if (isSummer && (tipo === 'Bianchi' || tipo === 'Rosati' || tipo === 'Bollicine')) {
    selectedTemplate = templates.fresco[Math.floor(Math.random() * templates.fresco.length)];
  } else if (isWinter && (tipo === 'Rossi' || tipo === 'Passito/Dolce')) {
    selectedTemplate = templates.strutturato[Math.floor(Math.random() * templates.strutturato.length)];
  } else if (tipo === 'Bollicine' || tipo === 'Champagne') {
    selectedTemplate = templates.celebrativo[Math.floor(Math.random() * templates.celebrativo.length)];
  } else {
    const allTemplates = [...templates.fresco, ...templates.strutturato, ...templates.generico];
    selectedTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  }

  return {
    wineName: wine.nome_vino,
    message: selectedTemplate,
    icon: '✨'
  };
};