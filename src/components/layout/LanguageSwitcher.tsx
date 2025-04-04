import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import Flag from 'react-world-flags'; // Import from the new library

// Map language codes to country codes for flags
const languageToCountryCode: { [key: string]: string } = {
  en: 'gb', // Great Britain for English (lowercase for react-world-flags)
  ro: 'ro', // Romania
  fr: 'fr', // France
  de: 'de', // Germany
};

const languages = [
  // Note: react-world-flags uses lowercase country codes
  { code: 'en', name: 'English', countryCode: 'gb' },
  { code: 'ro', name: 'Română', countryCode: 'ro' },
  { code: 'fr', name: 'Français', countryCode: 'fr' },
  { code: 'de', name: 'Deutsch', countryCode: 'de' },
];


const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguageCode = i18n.language.split('-')[0];
  const currentCountryCode = languageToCountryCode[currentLanguageCode] || 'gb'; // Default to gb flag

  return (
    <DropdownMenu>
      {/* Remove TooltipProvider, Tooltip and TooltipTrigger */}
       {/* <TooltipProvider delayDuration={0}> */}
         {/* <Tooltip> */}
             {/* <TooltipTrigger asChild> */}
                  {/* Removed asChild from DropdownMenuTrigger */}
                  <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" aria-label={t('language') || 'Change language'}>
                          <Flag code={currentCountryCode} height="20" width="26" style={{ display: 'block' }}/>
                      </Button>
                  </DropdownMenuTrigger>
             {/* </TooltipTrigger> */}
             {/* <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700"> */}
                {/* <p>{t('language') || 'Change language'}</p> */}
            {/* </TooltipContent> */}
        {/* </Tooltip> */}
      {/* </TooltipProvider> */}

      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`focus:bg-slate-700 cursor-pointer flex items-center gap-2 ${currentLanguageCode === lang.code ? 'bg-slate-700' : ''}`}
          >
             {/* Use code prop and adjust size/styling */}
             <Flag code={lang.countryCode} height="16" width="21" style={{ display: 'block', marginRight: '0.5rem' }} />
             {t(`languages.${lang.code}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
