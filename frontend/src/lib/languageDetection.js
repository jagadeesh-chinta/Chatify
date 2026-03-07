/**
 * Language detection utility using Unicode script detection
 * Supports: English, Hindi, Telugu, Tamil, Kannada, and more
 */

// Unicode ranges for different scripts
const scriptRanges = {
  devanagari: /[\u0900-\u097F]/,   // Hindi, Sanskrit, Marathi
  telugu: /[\u0C00-\u0C7F]/,       // Telugu
  tamil: /[\u0B80-\u0BFF]/,        // Tamil
  kannada: /[\u0C80-\u0CFF]/,      // Kannada
  malayalam: /[\u0D00-\u0D7F]/,    // Malayalam
  bengali: /[\u0980-\u09FF]/,      // Bengali
  gujarati: /[\u0A80-\u0AFF]/,     // Gujarati
  punjabi: /[\u0A00-\u0A7F]/,      // Punjabi (Gurmukhi)
  arabic: /[\u0600-\u06FF]/,       // Arabic, Urdu
  chinese: /[\u4E00-\u9FFF]/,      // Chinese
  japanese: /[\u3040-\u309F\u30A0-\u30FF]/, // Japanese (Hiragana + Katakana)
  korean: /[\uAC00-\uD7AF]/,       // Korean (Hangul)
  cyrillic: /[\u0400-\u04FF]/,     // Russian, Ukrainian, etc.
  greek: /[\u0370-\u03FF]/,        // Greek
  thai: /[\u0E00-\u0E7F]/,         // Thai
};

// Map scripts to BCP 47 language codes for Speech Synthesis
const scriptToLangCode = {
  devanagari: "hi-IN",
  telugu: "te-IN",
  tamil: "ta-IN",
  kannada: "kn-IN",
  malayalam: "ml-IN",
  bengali: "bn-IN",
  gujarati: "gu-IN",
  punjabi: "pa-IN",
  arabic: "ar-SA",
  chinese: "zh-CN",
  japanese: "ja-JP",
  korean: "ko-KR",
  cyrillic: "ru-RU",
  greek: "el-GR",
  thai: "th-TH",
  latin: "en-US",  // Default for Latin script
};

// Speech recognition language codes (for voice input)
const speechRecognitionLangs = [
  "en-US",   // English (US)
  "en-GB",   // English (UK)
  "hi-IN",   // Hindi
  "te-IN",   // Telugu
  "ta-IN",   // Tamil
  "kn-IN",   // Kannada
  "ml-IN",   // Malayalam
  "bn-IN",   // Bengali
  "gu-IN",   // Gujarati
  "pa-IN",   // Punjabi
  "mr-IN",   // Marathi
  "es-ES",   // Spanish
  "fr-FR",   // French
  "de-DE",   // German
  "pt-BR",   // Portuguese
  "ja-JP",   // Japanese
  "ko-KR",   // Korean
  "zh-CN",   // Chinese (Simplified)
  "ar-SA",   // Arabic
  "ru-RU",   // Russian
];

/**
 * Detect script type from text
 * @param {string} text - Text to analyze
 * @returns {string} - Script name or 'latin' as default
 */
function detectScript(text) {
  if (!text || typeof text !== "string") return "latin";

  // Count characters for each script
  const scriptCounts = {};
  
  for (const [script, regex] of Object.entries(scriptRanges)) {
    const matches = text.match(new RegExp(regex.source, "g"));
    scriptCounts[script] = matches ? matches.length : 0;
  }

  // Find the script with most characters
  let maxScript = "latin";
  let maxCount = 0;

  for (const [script, count] of Object.entries(scriptCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxScript = script;
    }
  }

  // If no non-Latin script detected, default to Latin (English)
  return maxCount > 0 ? maxScript : "latin";
}

/**
 * Detect language from text and return BCP 47 language code
 * @param {string} text - Text to analyze
 * @returns {string} - BCP 47 language code (e.g., "en-US", "hi-IN")
 */
export function detectLanguage(text) {
  const script = detectScript(text);
  return scriptToLangCode[script] || "en-US";
}

/**
 * Get the best matching voice for a language code
 * @param {string} langCode - BCP 47 language code
 * @returns {SpeechSynthesisVoice|null} - Best matching voice or null
 */
export function getVoiceForLanguage(langCode) {
  if (!window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Try exact match first
  let voice = voices.find((v) => v.lang === langCode);
  
  // Try partial match (e.g., "hi" matches "hi-IN")
  if (!voice) {
    const langPrefix = langCode.split("-")[0];
    voice = voices.find((v) => v.lang.startsWith(langPrefix));
  }

  return voice || null;
}

/**
 * Get preferred speech recognition language based on browser/user settings
 * @returns {string} - BCP 47 language code for speech recognition
 */
export function getPreferredRecognitionLanguage() {
  // Use browser language as primary
  const browserLang = navigator.language || navigator.userLanguage || "en-US";
  
  // Check if browser language is in supported list
  if (speechRecognitionLangs.includes(browserLang)) {
    return browserLang;
  }

  // Try to match language prefix
  const langPrefix = browserLang.split("-")[0];
  const matchedLang = speechRecognitionLangs.find((lang) => 
    lang.startsWith(langPrefix)
  );

  return matchedLang || "en-US";
}

/**
 * Get list of supported speech recognition languages
 * @returns {string[]} - Array of supported language codes
 */
export function getSupportedRecognitionLanguages() {
  return [...speechRecognitionLangs];
}

/**
 * Get human-readable language name from code
 * @param {string} langCode - BCP 47 language code
 * @returns {string} - Human readable language name
 */
export function getLanguageName(langCode) {
  const names = {
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "hi-IN": "Hindi",
    "te-IN": "Telugu",
    "ta-IN": "Tamil",
    "kn-IN": "Kannada",
    "ml-IN": "Malayalam",
    "bn-IN": "Bengali",
    "gu-IN": "Gujarati",
    "pa-IN": "Punjabi",
    "mr-IN": "Marathi",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "de-DE": "German",
    "pt-BR": "Portuguese",
    "ja-JP": "Japanese",
    "ko-KR": "Korean",
    "zh-CN": "Chinese",
    "ar-SA": "Arabic",
    "ru-RU": "Russian",
    "th-TH": "Thai",
    "el-GR": "Greek",
  };
  
  return names[langCode] || langCode;
}
