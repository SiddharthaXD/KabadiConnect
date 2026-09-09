import React from 'react';
import { ScreenName, Language, UserProfile } from '../types';
import { speakVernacular, triggerHaptic } from '../utils/speech';

interface HeaderProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenDartCode?: () => void;
  isOnline: boolean;
  onSync: () => void;
  isSyncing: boolean;
  title?: string;
  userProfile?: UserProfile;
  onOpenLogin: () => void;
  onToggleOnline?: () => void;
  isLoggedIn?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  language,
  onLanguageChange,
  isOnline,
  onSync,
  isSyncing,
  title,
  userProfile,
  onOpenLogin,
  onToggleOnline,
  isLoggedIn,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const isHome = currentScreen === 'home';

  const handleVoiceReadout = () => {
    triggerHaptic(25);
    if (currentScreen === 'recycler_dashboard') {
      speakVernacular(
        language === 'mr'
          ? 'अधिकृत रिसायकलर पोर्टल. कबाडीवाल्यांचे डिजिटल टोकन स्कॅन करा आणि थेट खरेदी दर व्यवस्थापित करा.'
          : language === 'en'
          ? 'Recycler Intake Portal. Scan collector QR tokens and manage live scrap buying rates.'
          : 'रीसाइक्लर पोर्टल। कबाड़ीवाले का क्यूआर कोड स्कैन करें और लाइव खरीद दरें सेट करें।',
        language
      );
    } else if (currentScreen === 'home') {
      speakVernacular(
        language === 'mr'
          ? 'Kabadiwala Connect होम डॅशबोर्ड. ई-कचरा स्कॅन करण्यासाठी हिरवे बटण दाबा.'
          : language === 'en'
          ? 'Kabadiwala Connect Home Dashboard. Tap the large green button to scan scrap.'
          : 'Kabadiwala Connect होम डैशबोर्ड। कचरा स्कैन करने के लिए बड़ा हरा बटन दबाएं।',
        language
      );
    } else if (currentScreen === 'scanner') {
      speakVernacular(
        language === 'mr'
          ? 'कॅमेऱ्यासमोर ई-कचरा किंवा मदरबोर्ड धरा आणि फोटो काढा.'
          : language === 'en'
          ? 'Hold electronic scrap in front of camera and tap take photo.'
          : 'सामने कंप्यूटर या बोर्ड रखें और फोटो खींचो बोलें।',
        language
      );
    } else if (currentScreen === 'weighing') {
      speakVernacular(
        language === 'mr'
          ? 'वजन नोंदवा किंवा निवडा, आणि खालील हिरव्या बटणाने सौद्याची पुष्टी करा.'
          : language === 'en'
          ? 'Enter scrap weight or pick a preset, and confirm deal.'
          : 'वजन दर्ज करें या प्रीसेट चुनें, और नीचे दिए गए हरे बटन से डील पक्की करें।',
        language
      );
    } else if (currentScreen === 'receipt') {
      speakVernacular(
        language === 'mr'
          ? 'व्यवहार पूर्ण झाला आहे. रिसायकलरला हा डिजिटल क्यूआर कोड दाखवा.'
          : language === 'en'
          ? 'Deal recorded successfully. Show this QR code to the recycler.'
          : 'सौदा दर्ज हो गया है। रिसाइक्लर को यह क्यूआर कोड स्कैन कराएं।',
        language
      );
    } else if (currentScreen === 'ledger') {
      speakVernacular(
        language === 'mr'
          ? 'खातेवही रजिस्टर. तुमचे सर्व मागील ई-कचरा व्यवहार आणि पावत्या येथे पहा.'
          : language === 'en'
          ? 'Transaction Ledger. View all your past verified scrap deals and receipts.'
          : 'खाता रजिस्टर। अपने सभी पिछले सौदे और रसीदें यहां देखें।',
        language
      );
    } else if (currentScreen === 'support') {
      speakVernacular(
        language === 'mr'
          ? 'मदत आणि ग्राहक सेवा केंद्र. थेट फोन किंवा व्हॉट्सॲपवर संपर्क करा.'
          : language === 'en'
          ? 'Help and Support Center. Connect via phone or WhatsApp.'
          : 'सहायता और हेल्पलाइन केंद्र। फोन या व्हाट्सएप से संपर्क करें।',
        language
      );
    } else if (currentScreen === 'login') {
      speakVernacular(
        language === 'mr'
          ? 'Kabadiwala Connect लॉगिन स्क्रीन. तुमची भूमिका निवडा: कबाडीवाला किंवा अधिकृत रिसायकलर.'
          : language === 'en'
          ? 'Kabadiwala Connect Login screen. Please choose your role: Kabadiwala collector or Authorized Recycler.'
          : 'Kabadiwala Connect लॉगिन स्क्रीन। अपनी भूमिका चुनें: कबाड़ीवाला या अधिकृत रीसाइक्लर।',
        language
      );
    }
  };

  const isRootScreen = isHome || currentScreen === 'login' || currentScreen === 'recycler_dashboard';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f7f9fb]/95 dark:bg-[#0b131a]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#bccac0]/30 dark:border-[#1e293b] pt-safe transition-colors">
      <div className="max-w-md mx-auto px-4 py-2 flex flex-col justify-center gap-1.5">
        {/* Row 1: Logo / Back + Title + Voice + Dark Mode + Profile */}
        <div className="flex items-center justify-between min-h-[42px]">
          <div className="flex items-center gap-2 min-w-0">
            {!isRootScreen ? (
              <button
                id="btn-back"
                aria-label="Go Back"
                onClick={() => {
                  triggerHaptic(20);
                  onNavigate(userProfile?.role === 'recycler' ? 'recycler_dashboard' : 'home');
                }}
                className="w-9 h-9 rounded-xl bg-[#eceef0] dark:bg-[#1e293b] flex items-center justify-center text-[#191c1e] dark:text-[#f1f5f9] hover:bg-[#e6e8ea] dark:hover:bg-[#283848] active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#006948] flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  {currentScreen === 'recycler_dashboard' ? 'factory' : 'recycling'}
                </span>
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-[16px] font-extrabold text-[#191c1e] dark:text-[#f1f5f9] tracking-tight leading-tight truncate">
                {title ||
                  (currentScreen === 'recycler_dashboard'
                    ? language === 'mr'
                      ? 'रिसायकलर पोर्टल'
                      : language === 'en'
                      ? 'Recycler Portal'
                      : 'रीसाइक्लर पोर्टल'
                    : isHome
                    ? 'Kabadiwala Connect'
                    : 'New Scrap Weighing')}
              </span>
              <span className="text-[11px] text-[#006948] dark:text-[#85f8c4] font-bold leading-none truncate">
                {currentScreen === 'login'
                  ? language === 'mr'
                    ? 'प्रवेश / भूमिका'
                    : language === 'en'
                    ? 'Sign In / Role'
                    : 'प्रवेश / भूमिका चयन'
                  : currentScreen === 'recycler_dashboard'
                  ? language === 'mr'
                    ? 'अधिकृत केंद्र डॅशबोर्ड'
                    : language === 'en'
                    ? 'Authorized Center'
                    : 'अधिकृत केंद्र डैशबोर्ड'
                  : isHome
                  ? 'Home Dashboard'
                  : 'Verified AI Rate'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Global High-Contrast Dark Mode Toggle */}
            <button
              id="btn-header-dark-mode"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onToggleDarkMode?.();
              }}
              aria-label={
                isDarkMode
                  ? language === 'mr'
                    ? 'लाइट मोड सुरू करा (Daylight Mode)'
                    : language === 'en'
                    ? 'Switch to Light Mode'
                    : 'लाइट मोड चालू करें'
                  : language === 'mr'
                  ? 'हाय-कॉन्ट्रास्ट डार्क मोड (Outdoor Dark Mode)'
                  : language === 'en'
                  ? 'Switch to High-Contrast Dark Mode'
                  : 'हाई-कंट्रास्ट डार्क मोड'
              }
              title={
                isDarkMode
                  ? language === 'mr'
                    ? 'लाइट मोड / Daylight'
                    : language === 'en'
                    ? 'Light Mode'
                    : 'लाइट मोड'
                  : language === 'mr'
                  ? 'डार्क मोड / Outdoor Dark'
                  : language === 'en'
                  ? 'High-Contrast Dark Mode'
                  : 'डार्क मोड'
              }
              className={`h-8 px-2 rounded-full flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 border cursor-pointer ${
                isDarkMode
                  ? 'bg-[#1e293b] text-[#fbbf24] border-[#fbbf24]/40 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                  : 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] hover:bg-[#e2e8f0]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[17px] ${
                  isDarkMode ? 'text-[#fbbf24]' : 'text-[#475569]'
                }`}
              >
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="text-[11px] font-bold hidden sm:inline">
                {isDarkMode
                  ? language === 'mr'
                    ? 'लाइट'
                    : language === 'en'
                    ? 'Light'
                    : 'लाइट'
                  : language === 'mr'
                  ? 'डार्क'
                  : language === 'en'
                  ? 'Dark'
                  : 'डार्क'}
              </span>
            </button>

            {/* Audio Readout Pill */}
            <button
              id="btn-header-voice"
              aria-label={
                language === 'mr'
                  ? 'मराठी ऑडिओ ऐका (Listen Marathi Audio)'
                  : language === 'en'
                  ? 'Listen Audio Readout'
                  : 'आवाज़ सुनें (Voice Readout)'
              }
              title={
                language === 'mr'
                  ? 'मराठी आवाज ऐका (Listen Marathi Audio)'
                  : language === 'en'
                  ? 'Listen Audio Readout'
                  : 'आवाज़ सुनें'
              }
              onClick={handleVoiceReadout}
              className="h-8 px-2.5 rounded-full bg-[#ffdcc3] dark:bg-[#3d2306] text-[#2f1500] dark:text-[#ffedd5] flex items-center gap-1 active:scale-95 transition-transform shadow-sm border border-[#8d4b00]/20 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px] text-[#8d4b00] dark:text-[#fbbf24]">volume_up</span>
              <span className="text-[12px] font-extrabold">
                {language === 'mr' ? 'ऐका' : language === 'en' ? 'Listen' : 'सुनो'}
              </span>
            </button>

            {/* Profile Avatar / Role Badge (hidden when on login screen) */}
            {currentScreen !== 'login' && (
              <button
                id="btn-header-profile"
                onClick={onOpenLogin}
                className={`h-8 px-2.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-all text-[11px] font-extrabold border cursor-pointer ${
                  userProfile?.role === 'recycler'
                    ? 'bg-[#dae2fd] dark:bg-[#1f2b48] text-[#131b2e] dark:text-[#dae2fd] border-[#565e74]/30'
                    : 'bg-[#006948] text-white border-[#002114]'
                }`}
                title="भूमिका बदलें / लॉगआउट (Switch Role / Login)"
                aria-label="User role profile switch"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {userProfile?.role === 'recycler' ? 'factory' : 'inventory_2'}
                </span>
                <span className="hidden xs:inline">
                  {userProfile?.role === 'recycler'
                    ? 'रीसाइक्लर'
                    : 'कबाड़ीवाला'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Prominently Visible Language Switcher Bar - Available on ALL pages */}
        <div
          id="header-language-bar"
          className="w-full bg-[#eceef0] dark:bg-[#15232e] p-1 rounded-xl flex items-center justify-between gap-1 border border-[#bccac0]/50 dark:border-[#263b4d] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
          role="group"
          aria-label="Language selection"
        >
          <div className="flex items-center gap-1 text-[#565e74] dark:text-[#94a3b8] pl-1 pr-1.5 shrink-0 select-none">
            <span className="material-symbols-outlined text-[16px] text-[#006948] dark:text-[#85f8c4]">translate</span>
            <span className="text-[11px] font-black hidden xs:inline">
              {language === 'mr' ? 'भाषा:' : language === 'en' ? 'Lang:' : 'भाषा:'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 flex-1">
            <button
              id="header-btn-lang-hi"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onLanguageChange('hi');
              }}
              className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 text-[12px] font-extrabold transition-all cursor-pointer active:scale-95 select-none ${
                language === 'hi'
                  ? 'bg-[#006948] text-white shadow-sm ring-1 ring-[#002114]'
                  : 'bg-white/80 dark:bg-[#1f303f] text-[#191c1e] dark:text-[#f1f5f9] hover:bg-white dark:hover:bg-[#273d50]'
              }`}
              aria-pressed={language === 'hi'}
              title="हिन्दी (Hindi)"
            >
              <span className="text-[13px]">🇮🇳</span>
              <span className="leading-tight">हिन्दी</span>
            </button>

            <button
              id="header-btn-lang-en"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onLanguageChange('en');
              }}
              className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 text-[12px] font-extrabold transition-all cursor-pointer active:scale-95 select-none ${
                language === 'en'
                  ? 'bg-[#006948] text-white shadow-sm ring-1 ring-[#002114]'
                  : 'bg-white/80 dark:bg-[#1f303f] text-[#191c1e] dark:text-[#f1f5f9] hover:bg-white dark:hover:bg-[#273d50]'
              }`}
              aria-pressed={language === 'en'}
              title="English"
            >
              <span className="text-[13px]">🌐</span>
              <span className="leading-tight">English</span>
            </button>

            <button
              id="header-btn-lang-mr"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onLanguageChange('mr');
              }}
              className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 text-[12px] font-extrabold transition-all cursor-pointer active:scale-95 select-none ${
                language === 'mr'
                  ? 'bg-[#006948] text-white shadow-sm ring-1 ring-[#002114]'
                  : 'bg-white/80 dark:bg-[#1f303f] text-[#191c1e] dark:text-[#f1f5f9] hover:bg-white dark:hover:bg-[#273d50]'
              }`}
              aria-pressed={language === 'mr'}
              title="मराठी (Marathi)"
            >
              <span className="text-[13px]">🚩</span>
              <span className="leading-tight">मराठी</span>
            </button>
          </div>
        </div>

        {/* Row 3: Status & Quick Controls (Online, Sync, and Switch Role after login) */}
        <div
          className={`grid ${
            currentScreen !== 'login' && isLoggedIn !== false
              ? 'grid-cols-3'
              : 'grid-cols-2'
          } gap-1.5 w-full`}
        >
          <button
            id="btn-header-toggle-online"
            type="button"
            onClick={() => {
              triggerHaptic(20);
              onToggleOnline?.();
            }}
            title={
              isOnline
                ? language === 'mr'
                  ? 'ऑनलाइन मोड सुरू आहे. चाचणीसाठी ऑफलाइन करा'
                  : language === 'en'
                  ? 'Online mode active. Tap to test offline'
                  : 'ऑनलाइन मोड सक्रिय है। ऑफ़लाइन टेस्ट करने के लिए क्लिक करें'
                : language === 'mr'
                ? 'ऑफलाइन मोड सक्रिय. पुन्हा ऑनलाइन होण्यासाठी दाबा'
                : language === 'en'
                ? 'Offline mode active. Tap to reconnect'
                : 'ऑफ़लाइन मोड सक्रिय है। ऑनलाइन वापस आने के लिए क्लिक करें'
            }
            aria-label={isOnline ? 'Toggle offline mode' : 'Toggle online mode'}
            className="w-full inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-[#15232e] shadow-xs text-[#006948] dark:text-[#85f8c4] border border-[#bccac0]/40 dark:border-[#263b4d] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2c3a] active:scale-95 transition-all cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isOnline ? 'bg-[#006948] dark:bg-[#85f8c4] animate-pulse' : 'bg-[#8d4b00] dark:bg-[#fbbf24]'
              }`}
            />
            <span className="text-[10.5px] font-bold truncate">
              {isOnline
                ? language === 'mr' ? 'ऑनलाइन' : language === 'en' ? 'Online' : 'ऑनलाइन'
                : language === 'mr' ? 'ऑफलाइन' : language === 'en' ? 'Offline' : 'ऑफ़लाइन'}
            </span>
          </button>

          <button
            id="btn-header-sync"
            onClick={onSync}
            title={language === 'en' ? 'Sync data' : 'डेटा सिंक करें'}
            className="w-full inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg bg-[#eceef0] dark:bg-[#15232e] text-[#3d4a42] dark:text-[#cbd5e1] hover:bg-[#e0e3e5] dark:hover:bg-[#1c2c3a] active:scale-95 transition-all text-[10.5px] font-bold border border-[#bccac0]/30 dark:border-[#263b4d] cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[13px] shrink-0 ${
                isSyncing ? 'animate-spin text-[#006948] dark:text-[#85f8c4]' : ''
              }`}
            >
              sync
            </span>
            <span className="truncate">
              {isSyncing
                ? language === 'mr' ? 'सिंक...' : language === 'en' ? 'Syncing...' : 'सिंक...'
                : language === 'mr' ? 'सिंक करा' : language === 'en' ? 'Sync Data' : 'सिंक Sync'}
            </span>
          </button>

          {/* Quick Switch to other role shortcut button - only shown after login */}
          {currentScreen !== 'login' && isLoggedIn !== false && (
            <button
              onClick={onOpenLogin}
              title="भूमिका बदलें / Switch Role"
              className="w-full inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg bg-[#e6f4ea] dark:bg-[#003923] text-[#006948] dark:text-[#85f8c4] hover:bg-[#ceebd7] dark:hover:bg-[#004d30] active:scale-95 transition-all text-[10.5px] font-bold border border-[#006948]/20 dark:border-[#85f8c4]/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px] shrink-0">swap_horiz</span>
              <span className="truncate">
                {language === 'mr' ? 'भूमिका' : language === 'en' ? 'Switch Role' : 'बदलें Role'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
