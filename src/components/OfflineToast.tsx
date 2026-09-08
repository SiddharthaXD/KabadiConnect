import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { speakVernacular, triggerHaptic } from '../utils/speech';

interface OfflineToastProps {
  isOnline: boolean;
  language: Language;
  onDismiss: () => void;
  onRecheck: () => void;
  onSync: () => void;
  isSyncing: boolean;
  isVisible: boolean;
  mode?: 'offline' | 'restored';
}

export const OfflineToast: React.FC<OfflineToastProps> = ({
  isOnline,
  language,
  onDismiss,
  onRecheck,
  onSync,
  isSyncing,
  isVisible,
  mode = 'offline',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = TRANSLATIONS[language]?.offlineToast || {
    title: 'You are Offline',
    desc: 'Internet connection lost. Don’t worry, your data is saved locally and will automatically sync once the connection is restored.',
    warningBadge: 'Offline Protection Active',
    listenBtn: 'Listen',
    dismissBtn: 'Got it',
    recheckBtn: 'Check Status',
    speechText:
      'Warning: You are offline. Your data is safely stored on this phone and will automatically synchronize once the connection is restored.',
    onlineRestoredTitle: 'Back Online!',
    onlineRestoredDesc: 'Connection restored. Synchronizing your offline records now...',
  };

  const handleListen = () => {
    triggerHaptic(20);
    setIsSpeaking(true);
    speakVernacular(mode === 'restored' ? t.onlineRestoredDesc : t.speechText, language);
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  const handleDismiss = () => {
    triggerHaptic(15);
    onDismiss();
  };

  const handleCheckConnection = () => {
    triggerHaptic(25);
    onRecheck();
  };

  if (!isVisible) return null;

  if (mode === 'restored') {
    return (
      <div
        id="online-restored-toast-indicator"
        role="status"
        aria-live="polite"
        className="fixed top-24 sm:top-28 inset-x-0 mx-auto w-[94%] max-w-md z-40 transition-all duration-300 animate-in slide-in-from-top-4 fade-in"
      >
        <div className="relative rounded-2xl bg-[#003824] text-[#85f8c4] border-2 border-[#006948] shadow-[0_10px_30px_rgba(0,33,20,0.35)] p-4 flex flex-col gap-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#85f8c4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e29b]"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#85f8c4] bg-[#002114] px-2.5 py-0.5 rounded-full border border-[#006948] font-['Space_Grotesk']">
                {language === 'hi' ? 'कनेक्शन बहाल' : language === 'mr' ? 'कनेक्शन पूर्ववत' : 'Connection Restored'}
              </span>
            </div>

            <button
              id="btn-dismiss-restored-toast"
              onClick={handleDismiss}
              aria-label="Close message"
              className="w-7 h-7 rounded-full bg-[#002114] hover:bg-[#004f35] text-white flex items-center justify-center active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[24px]">wifi</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-black text-white tracking-tight">
                {t.onlineRestoredTitle}
              </h4>
              <p className="text-[12px] text-[#c0ecd3] font-medium leading-tight">
                {t.onlineRestoredDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="offline-toast-indicator"
      role="alert"
      aria-live="assertive"
      className="fixed top-24 sm:top-28 inset-x-0 mx-auto w-[94%] max-w-md z-40 transition-all duration-300 animate-in slide-in-from-top-4 fade-in"
    >
      <div className="relative rounded-2xl bg-[#2f1500] text-[#ffdcc3] border-2 border-[#8d4b00] shadow-[0_10px_30px_rgba(47,21,0,0.35)] p-4 flex flex-col gap-3 backdrop-blur-md">
        {/* Top bar: Warning pill & close button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb77c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e06d00]"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#ffb77c] bg-[#432200] px-2.5 py-0.5 rounded-full border border-[#8d4b00]/50 font-['Space_Grotesk']">
              {t.warningBadge}
            </span>
          </div>

          <button
            id="btn-dismiss-offline-toast"
            onClick={handleDismiss}
            aria-label="Dismiss offline warning"
            className="w-7 h-7 rounded-full bg-[#432200] hover:bg-[#593000] text-[#ffdcc3] flex items-center justify-center active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#8d4b00] text-white flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[24px]">wifi_off</span>
          </div>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <h4 className="text-[15px] font-black text-white leading-snug tracking-tight">
              {t.title}
            </h4>
            <p className="text-[12px] leading-relaxed text-[#ffdcc3]/90 font-medium">
              {t.desc}
            </p>
          </div>
        </div>

        {/* Reassurance Micro-banner */}
        <div className="flex items-center gap-2 bg-[#432200]/70 rounded-xl px-3 py-1.5 border border-[#8d4b00]/40 text-[11px] text-[#ffb77c]">
          <span className="material-symbols-outlined text-[16px] text-[#85f8c4] shrink-0">
            cloud_sync
          </span>
          <span className="font-semibold leading-tight">
            {language === 'hi'
              ? 'स्थानीय मेमोरी सक्रिय: सभी लेनदेन रिकॉर्ड सुरक्षित हैं'
              : language === 'mr'
              ? 'स्थानिक स्टोरेज सुरक्षित: नोंदी आपोआप सिंक होतील'
              : 'Local storage active: All deal entries will sync automatically'}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#8d4b00]/40">
          {/* Audio Listen button */}
          <button
            id="btn-offline-speech"
            type="button"
            onClick={handleListen}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[12px] font-bold transition-all shadow-sm active:scale-95 ${
              isSpeaking
                ? 'bg-[#ffb77c] text-[#2f1500] ring-2 ring-white'
                : 'bg-[#ffdcbb] text-[#2f1500] hover:bg-[#ffd2a8]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isSpeaking ? 'animate-bounce' : ''
              }`}
            >
              volume_up
            </span>
            <span>{t.listenBtn}</span>
          </button>

          {/* Recheck / Sync Button */}
          <button
            id="btn-offline-recheck"
            type="button"
            onClick={handleCheckConnection}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#432200] hover:bg-[#593000] text-[#ffdcc3] border border-[#8d4b00] text-[12px] font-bold active:scale-95 transition-all shadow-sm"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isSyncing ? 'animate-spin text-[#85f8c4]' : ''
              }`}
            >
              sync
            </span>
            <span>{isSyncing ? 'Checking...' : t.recheckBtn}</span>
          </button>

          {/* Dismiss button */}
          <button
            id="btn-offline-ok"
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold active:scale-95 transition-all"
          >
            {t.dismissBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
