// src/utils/sommelierLogic.js

const pairingMatrix = {
  occasion: {
    'Amici': { 'Bollicine': 15, 'Rosati': 12, 'Bianchi': 8, 'Rossi': 5, 'Dolci/Passito': 2 },
    'Lavoro': { 'Bianchi': 15, 'Rossi': 10, 'Bollicine': 8, 'Rosati': 5, 'Dolci/Passito': 2 },
    'Relax': { 'Rossi': 15, 'Bianchi': 10, 'Dolci/Passito': 12, 'Bollicine': 8, 'Rosati': 5 },
    'Altro': { 'Bianchi': 10, 'Rossi': 10, 'Bollicine': 10, 'Rosati': 10, 'Dolci/Passito': 5 }
  },
  food: {
    'Carne Rossa': { 'Rossi': 20, 'Rosati': 5, 'Bianchi': 0, 'Bollicine': 0 },
    'Carne Bianca': { 'Bianchi': 15, 'Rosati': 10, 'Rossi': 8, 'Bollicine': 10 },
    'Pesce': { 'Bianchi': 20, 'Bollicine': 15, 'Rosati': 10, 'Rossi': 0 },
    'Verdure': { 'Bianchi': 12, 'Rosati': 12, 'Rossi': 5, 'Bollicine': 10 },
    'Pasta': { 'Bianchi': 10, 'Rossi': 10, 'Rosati': 8, 'Bollicine': 5 },
    'Tagliere': { 'Bollicine': 15, 'Bianchi': 12, 'Rossi': 10, 'Rosati': 8 },
    'Formaggi Duri': { 'Rossi': 15, 'Dolci/Passito': 15, 'Bianchi': 8 },
    'Formaggi Erborinati': { 'Dolci/Passito': 20, 'Rossi': 12, 'Bianchi': 0 },
  },
  climate: {
    'Caldo': { 'Bianchi': 12, 'Bollicine': 15, 'Rosati': 12, 'Rossi': -5 },
    'Freddo': { 'Rossi': 15, 'Dolci/Passito': 12, 'Bianchi': -5, 'Bollicine': 0 },
    'Tiepido': { 'Rossi': 5, 'Bianchi': 5, 'Rosati': 5, 'Bollicine': 5 }
  },
  // NUOVO: Modificatori basati sul sapore/cottura
  flavorModifiers: {
    'Leggero': { 'Bianchi': 10, 'Bollicine': 10, 'Rosati': 5, 'Rossi': -5 },
    'Sapido': { 'Bianchi': 12, 'Bollicine': 8, 'Rossi': 5 },
    'Speziato': { 'Rosati': 15, 'Bianchi': 10, 'Rossi': 10, 'Dolci/Passito': 5 },
    'Ricco/Grasso': { 'Rossi': 12, 'Bollicine': 15, 'Bianchi': 5 }
  }
};

const adjectives = {
  'Bianchi': ['freschezza', 'sapidità', 'note agrumate', 'eleganza'],
  'Rossi': ['struttura', 'tannini', 'corpo', 'intensità'],
  'Bollicine': ['perlage', 'vivacità', 'croccantezza', 'raffinatezza'],
  'Rosati': ['freschezza estiva', 'corpo leggero', 'vivacità'],
  'Dolci/Passito': ['dolcezza', 'complessità', 'note mielate', 'persistenza']
};

export const calculateBestWine = (wines, choices) => {
  const { occasion, food, climate, flavor } = choices;
  
  const scoredWines = wines.map(wine => {
    let score = 0;
    const tipo = wine.tipologia || 'Non specificato';
    
    score += (pairingMatrix.occasion[occasion]?.[tipo] || 0);
    score += (pairingMatrix.food[food]?.[tipo] || 0);
    score += (pairingMatrix.climate[climate]?.[tipo] || 0);
    
    // Applica il modificatore di sapore se presente
    if (flavor) {
      score += (pairingMatrix.flavorModifiers[flavor]?.[tipo] || 0);
    }
    
    return { ...wine, finalScore: score };
  });

  const maxScore = Math.max(...scoredWines.map(w => w.finalScore));
  const candidates = scoredWines.filter(w => w.finalScore >= maxScore * 0.8 && w.finalScore > 0);

  if (candidates.length === 0) return { error: "No perfect match", fallback: true };

  const selectedWine = candidates[Math.floor(Math.random() * candidates.length)];

  const tipo = selectedWine.tipologia;
  const adjList = adjectives[tipo] || adjectives['Bianchi'];
  const randomAdj = adjList[Math.floor(Math.random() * adjList.length)];
  const uvaggio = selectedWine.uvaggio ? ` basato su ${selectedWine.uvaggio}` : '';

  // Messaggi evoluti che includono il sapore
  const flavorText = flavor ? `Considerando che il piatto è ${flavor.toLowerCase()}, ` : '';

  const messages = {
    'Lavoro': `${flavorText}per un contesto professionale l'eleganza è d'obbligo. Per accompagnare ${food}, ti suggerisco il ${selectedWine.nome_vino}. La sua ${randomAdj}${uvaggio} saprà sostenere il piatto con estrema classe.`,
    'Amici': `${flavorText}serata tra amici! Per contrastare ${food} in questo clima ${climate}, il ${selectedWine.nome_vino} è l'ideale. Un vino che punta su ${randomAdj}${uvaggio}, perfetto per stimolare la conversazione.`,
    'Relax': `${flavorText}momento di puro relax. Per accompagnare ${food}, ti consiglio il ${selectedWine.nome_vino}. La sua ${randomAdj}${uvaggio} creerà l'atmosfera perfetta per staccare la spina.`,
    'Altro': `${flavorText}analizzando la tua cantina, il ${selectedWine.nome_vino} risulta la scelta più equilibrata per ${food}. Un vino che esprime ${randomAdj}${uvaggio} in modo armonioso.`
  };

  return {
    wine: selectedWine,
    message: messages[occasion] || messages['Altro'],
    icon: '🍷'
  };
};