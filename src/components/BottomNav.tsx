import React from 'react';
import { ScreenName, UserRole, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { triggerHaptic } from '../utils/speech';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  userRole?: UserRole;
  language?: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  userRole,
  language = 'hi',
}) => {
  const isRecycler = userRole === 'recycler';
  const t = TRANSLATIONS[language]?.nav || {
    home: 'घर',
    portal: 'पोर्टल',
    ledger: 'खाता',
    support: 'मदद',
  };

  const isHomeActive = currentScreen === 'home' || currentScreen === 'recycler_dashboard';
  const isLedgerActive = currentScreen === 'ledger';
  const isSupportActive = currentScreen === 'support';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#111820]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#bccac0]/30 dark:border-[#273544] pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-18 px-3">
        {/* Home / Recycler Portal */}
        <button
          id="nav-home"
          onClick={() => {
            triggerHaptic(20);
            onNavigate(isRecycler ? 'recycler_dashboard' : 'home');
          }}
          className={`flex flex-col items-center justify-center min-w-[72px] py-1 gap-0.5 transition-colors ${
            isHomeActive
              ? 'text-[#006948] dark:text-[#34d399] font-bold'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-[#ffffff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[26px]"
            style={{
              fontVariationSettings: isHomeActive ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {isRecycler ? 'factory' : 'home'}
          </span>
          <span className="text-[14px] font-bold leading-none font-['Space_Grotesk']">
            {isRecycler ? t.portal : t.home}
          </span>
          <span className="text-[10px] leading-none opacity-80">
            {isRecycler ? 'Portal' : 'Home'}
          </span>
        </button>

        {/* Ledger / Khata - Shown for Kabadiwala, hidden for Recycler */}
        {!isRecycler && (
          <button
            id="nav-ledger"
            onClick={() => {
              triggerHaptic(20);
              onNavigate('ledger');
            }}
            className={`flex flex-col items-center justify-center min-w-[72px] py-1 gap-0.5 transition-colors ${
              isLedgerActive
                ? 'text-[#006948] dark:text-[#34d399] font-bold'
                : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-[#ffffff]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: isLedgerActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              receipt_long
            </span>
            <span className="text-[14px] font-bold leading-none font-['Space_Grotesk']">
              {t.ledger}
            </span>
            <span className="text-[10px] leading-none opacity-80">Ledger</span>
          </button>
        )}

        {/* Support */}
        <button
          id="nav-support"
          onClick={() => {
            triggerHaptic(20);
            onNavigate('support');
          }}
          className={`flex flex-col items-center justify-center min-w-[72px] py-1 gap-0.5 transition-colors ${
            isSupportActive
              ? 'text-[#006948] dark:text-[#34d399] font-bold'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-[#ffffff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[26px]"
            style={{ fontVariationSettings: isSupportActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            support_agent
          </span>
          <span className="text-[14px] font-bold leading-none font-['Space_Grotesk']">
            {t.support}
          </span>
          <span className="text-[10px] leading-none opacity-80">Support</span>
        </button>
      </div>
    </nav>
  );
};
