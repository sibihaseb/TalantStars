import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supportedLanguages, getCurrentLanguage, setLanguage } from '@/lib/dynamicTranslation';

export function LanguageSelector() {
  const [language, setCurrentLanguage] = useState(getCurrentLanguage());
  const { toast } = useToast();

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const handleLanguageChange = async (lang: string) => {
    console.log('Language selector - changing language to:', lang);
    setLanguage(lang);
    
    toast({
      title: "Language Updated",
      description: `Language changed to ${supportedLanguages[lang].name}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <img 
            src="/attached_assets/PNG%20FILE%209_1752709598561.png" 
            alt="Languages" 
            className="h-4 w-4 object-contain filter brightness-0 invert" 
          />
          {supportedLanguages[language].flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(supportedLanguages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`gap-2 ${language === code ? "bg-accent" : ""}`}
          >
            <span>{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}