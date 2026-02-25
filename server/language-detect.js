/**
 * Language Detection Helper
 * Quick heuristic + Deepgram's detection for routing language context
 */

const LANGUAGE_KEYWORDS = {
  es: [
    'hola', 'gracias', 'por favor', 'buenos días', 'buenas tardes',
    'sí', 'no sé', 'ayuda', 'deuda', 'dinero', 'cuánto', 'español',
  ],
  pt: [
    'olá', 'obrigado', 'obrigada', 'por favor', 'bom dia', 'boa tarde',
    'sim', 'não', 'ajuda', 'dívida', 'dinheiro', 'quanto', 'português',
  ],
  fr: [
    'bonjour', 'merci', 's\'il vous plaît', 'bonsoir', 'oui', 'non',
    'aide', 'dette', 'argent', 'combien', 'français',
  ],
  ht: [
    'bonjou', 'mèsi', 'souple', 'ki jan', 'wi', 'non', 'kreyòl',
    'ede', 'dèt', 'lajan', 'konbyen',
  ],
};

/**
 * Quick heuristic language detection from text
 * @param {string} text
 * @returns {string|null} language code or null if uncertain
 */
export function detectLanguage(text) {
  const lower = text.toLowerCase().trim();

  let bestLang = null;
  let bestScore = 0;

  for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  // Need at least 1 keyword match to be confident
  return bestScore >= 1 ? bestLang : null;
}

/**
 * Get language name for the LLM context
 */
export function languageName(code) {
  const names = {
    en: 'English', es: 'Spanish', pt: 'Portuguese',
    fr: 'French', ht: 'Haitian Creole',
  };
  return names[code] || 'English';
}
