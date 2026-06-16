import { differenceInMonths, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const getSommelierAlert = (dataAcquisto, tipologia, lastCheckDate) => {
  if (!dataAcquisto) return null;

  // Se è stato controllato negli ultimi 3 mesi, non dare l'alert (Snooze)
  if (lastCheckDate) {
    const monthsSinceCheck = differenceInMonths(new Date(), new Date(lastCheckDate));
    if (monthsSinceCheck < 3) return null;
  }

  const months = differenceInMonths(new Date(), new Date(dataAcquisto));
  const distance = formatDistanceToNow(new Date(dataAcquisto), { addSuffix: true, locale: it });

  if ((tipologia === 'Bianchi' || tipologia === 'Rosati') && months >= 12) {
    return {
      message: `⚠️ ATTENZIONE: Questo vino è qui da ${distance}. Bevilo subito prima che perda il suo splendore!`,
      color: 'text-winelink-red',
      bg: 'bg-red-100',
      icon: '🚨'
    };
  }

  if ((tipologia === 'Rossi' || tipologia === 'Bollicine' || tipologia === 'Champagne') && months >= 24) {
    return {
      message: `✨ Un piccolo tesoro! Invecchia da ${distance}. Forse è arrivato il momento perfetto?`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: '⭐'
    };
  }

  if (months >= 3) {
    return {
      message: `Ehilà! Questa bottiglia è in cantina da ${distance}, non l'hai dimenticata?`,
      color: 'text-winelink-yellow',
      bg: 'bg-yellow-50',
      icon: '🍷'
    };
  }

  return null;
};