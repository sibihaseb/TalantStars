// Dynamic Translation System with AI-powered translation
import { queryClient } from './queryClient';
import { useState, useEffect, useCallback } from 'react';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, Map<string, string>>();

// Supported languages with their codes
export const supportedLanguages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇧🇷' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  hi: { name: 'हिंदी', flag: '🇮🇳' },
};

// Get current language from localStorage or default to English
export const getCurrentLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

// Set language and persist to localStorage
export const setLanguage = (lang: string) => {
  if (typeof window !== 'undefined') {
    console.log('Setting language to:', lang);
    localStorage.setItem('language', lang);
    // Trigger a custom event to notify components of language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    console.log('Language changed event dispatched');
  }
};

// AI-powered translation using OpenAI API
async function translateWithAI(text: string, targetLang: string): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage: targetLang,
        sourceLanguage: 'en'
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

// Main translation function with caching
export const translate = async (text: string, targetLang: string = getCurrentLanguage()): Promise<string> => {
  // Return original text if target language is English
  if (targetLang === 'en') {
    return text;
  }

  // Check cache first
  const langCache = translationCache.get(targetLang);
  if (langCache && langCache.has(text)) {
    return langCache.get(text)!;
  }

  // Get translation from AI
  const translatedText = await translateWithAI(text, targetLang);

  // Cache the result
  if (!translationCache.has(targetLang)) {
    translationCache.set(targetLang, new Map());
  }
  translationCache.get(targetLang)!.set(text, translatedText);

  return translatedText;
};

// React hook for dynamic translations
export const useTranslation = () => {
  const [language, setCurrentLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const t = useCallback(async (text: string): Promise<string> => {
    return await translate(text, language);
  }, [language]);

  return { t, language, setLanguage };
};

// Utility function to translate multiple texts at once
export const translateBatch = async (texts: string[], targetLang: string = getCurrentLanguage()): Promise<string[]> => {
  const promises = texts.map(text => translate(text, targetLang));
  return Promise.all(promises);
};

// Clear translation cache (useful for development)
export const clearTranslationCache = () => {
  translationCache.clear();
};