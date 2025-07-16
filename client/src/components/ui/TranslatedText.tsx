import { useState, useEffect } from 'react';
import { translate, getCurrentLanguage } from '@/lib/dynamicTranslation';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: any;
}

export function TranslatedText({ 
  text, 
  className = '', 
  as: Component = 'span', 
  ...props 
}: TranslatedTextProps) {
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      const currentLang = getCurrentLanguage();
      
      if (currentLang === 'en') {
        setTranslatedText(text);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(text, currentLang);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();

    // Listen for language changes
    const handleLanguageChange = () => {
      translateText();
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [text]);

  return (
    <Component className={className} {...props}>
      {isLoading ? (
        <span className="opacity-50">{text}</span>
      ) : (
        translatedText
      )}
    </Component>
  );
}