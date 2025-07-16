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
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            targetLanguage: currentLang,
            sourceLanguage: 'en'
          }),
        });

        if (!response.ok) {
          throw new Error(`Translation failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Translation response:', data);
        setTranslatedText(data.translatedText || text);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();

    // Listen for language changes
    const handleLanguageChange = () => {
      console.log('TranslatedText received language change event');
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