import { differenceInMonths, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const getSommelierAlert = (dataAcquisto, tipologia, lastCheckDate, annoImbottigliamento) => {
  // 1. Gestione Snooze: se è stato controllato negli ultimi 3 mesi, taciamo
  if (lastCheckDate) {
    const monthsSinceCheck = differenceInMonths(new Date(), new Date(lastCheckDate));
    if (monthsSinceCheck < 3) return null;
  }

  const currentYear = new Date().getFullYear();
  const ageSinceBottling = currentYear - annoImbottigliamento;

  // ==========================================================================
  // LIVELLO 1: ALERT SU ANNATA (Maturità del vino)
  // Questo scatta anche se l'hai comprato ieri!
  // ==========================================================================
  
  // Allarme per Bianchi e Rosati: oltre i 5 anni iniziano a essere rischiosi
  if ((tipologia === 'Bianchi' || tipologia === 'Rosati') && ageSinceBottling >= 5) {
    return {
      message: `⚠️ ATTENZIONE: Questo vino è un ${annoImbottigliamento}. I bianchi/rosati dopo 5 anni perdono freschezza. Bevilo subito!`,
      color: 'text-winelink-red',
      bg: 'bg-red-100',
      icon: '🚨'
    };
  }

  // Allarme per Rossi/Bollicine: dopo 10 anni è un "pezzo d'epoca"
  if ((tipologia === 'Rossi' || tipologia === 'Bollicine' || tipologia === 'Champagne') && ageSinceBottling >= 10) {
    return {
      message: `✨ UN CLASSICO: Questo vino è un ${annoImbottigliamento}. È arrivato al picco della sua maturazione, momento perfetto per l'apertura!`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: '⭐'
    };
  }

  // ==========================================================================
  // LIVELLO 2: ALERT SU DATA ACQUISTO (Dimenticanza in cantina)
  // ==========================================================================
  if (!dataAcquisto) return null;

  const monthsSincePurchase = differenceInMonths(new Date(), new Date(dataAcquisto));
  const distance = formatDistanceToNow(new Date(dataAcquisto), { addSuffix: true, locale: it });

  // Allarme Bianco/Rosato dimenticato (oltre 12 mesi)
  if ((tipologia === 'Bianchi' || tipologia === 'Rosati') && monthsSincePurchase >= 12) {
    return {
      message: `⚠️ ATTENZIONE: Questo vino è in cantina da ${distance}. Bevilo prima che perda il suo splendore!`,
      color: 'text-winelink-red',
      bg: 'bg-red-100',
      icon: '🚨'
    };
  }

  // Promemoria standard (oltre 3 mesi)
  if (monthsSincePurchase >= 3) {
    return {
      message: `Ehilà! Questa bottiglia è in cantina da ${distance}, non l'hai dimenticata?`,
      color: 'text-winelink-yellow',
      bg: 'bg-yellow-50',
      icon: '🍷'
    };
  }

  return null;
};