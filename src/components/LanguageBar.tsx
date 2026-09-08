import React from 'react';
import { Language } from '../types';
import { triggerHaptic } from '../utils/speech';

interface LanguageBarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

export const LanguageBar: React.FC<LanguageBarProps> = ({
  currentLanguage,
  onLanguageChange,
  className = '',
}) => {
  const languages: { id: Language; label: string; script: string; badge: string }[] = [
    { id: 'hi', label: 'हिन्दी', script: 'Hindi', badge: '🇮🇳' },
    { id: 'en', label: 'English', script: 'Global', badge: '🌐' },
    { id: 'mr', label: 'मराठी', script: 'Marathi', badge: '🚩' },
  ];

  return (
    <div
      className={`w-full bg-white rounded-2xl p-2 shadow-sm border border-[#bccac0]/40 flex items-center justify-between gap-1.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 px-2 text-[#565e74] shrink-0">
        <span className="material-symbols-outlined text-[18px] text-[#006948]">translate</span>
        <span className="text-[12px] font-bold hidden xs:inline">भाषा / Language:</span>
      </div>

      <div className="flex items-center gap-1 flex-1 justify-end">
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onLanguageChange(lang.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#006948] text-white shadow-sm ring-2 ring-[#006948]/20'
                  : 'bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea]'
              }`}
              title={`Switch to ${lang.script}`}
            >
              <span className="text-[13px]">{lang.badge}</span>
              <span className="leading-none">{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
