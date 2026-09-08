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

  const isRootScreen = isHome || currentScreen === 'login';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f7f9fb]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#bccac0]/30 pt-safe">
      <div className="max-w-md mx-auto px-4 py-2 flex flex-col justify-center gap-1.5">
        {/* Row 1: Logo / Back + Title + Voice + Profile */}
        <div className="flex items-center justify-between min-h-[44px]">
          <div className="flex items-center gap-2">
            {!isRootScreen ? (
              <button
                id="btn-back"
                aria-label="Go Back"
                onClick={() => {
                  triggerHaptic(20);
                  onNavigate(userProfile?.role === 'recycler' ? 'recycler_dashboard' : 'home');
                }}
                className="w-10 h-10 rounded-xl bg-[#eceef0] flex items-center justify-center text-[#191c1e] hover:bg-[#e6e8ea] active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#006948] flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[24px]">recycling</span>
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-[#191c1e] tracking-tight leading-tight">
                {title || (isHome ? 'Kabadiwala Connect' : 'New Scrap Weighing')}
              </span>
              <span className="text-[12px] text-[#006948] font-bold leading-none">
                {currentScreen === 'login'
                  ? language === 'mr'
                    ? 'प्रवेश / भूमिका'
                    : language === 'en'
                    ? 'Sign In / Role'
                    : 'प्रवेश / भूमिका चयन'
                  : isHome
                  ? 'Home Dashboard'
                  : 'Verified AI Rate'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
              className="h-9 px-3 rounded-full bg-[#ffdcc3] text-[#2f1500] flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#8d4b00]">volume_up</span>
              <span className="text-[13px] font-bold">
                {language === 'mr' ? 'ऐका' : language === 'en' ? 'Listen' : 'सुनो'}
              </span>
            </button>

            {/* Profile Avatar / Role Badge (hidden when on login screen) */}
            {currentScreen !== 'login' && (
              <button
                id="btn-header-profile"
                onClick={onOpenLogin}
                className={`h-9 px-2.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-all text-[12px] font-bold border ${
                  userProfile?.role === 'recycler'
                    ? 'bg-[#dae2fd] text-[#131b2e] border-[#565e74]/30'
                    : 'bg-[#006948] text-white border-[#002114]'
                }`}
                title="भूमिका बदलें / लॉगआउट (Switch Role / Login)"
                aria-label="User role profile switch"
              >
                <span className="material-symbols-outlined text-[16px]">
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

        {/* Row 2: Status & Vernacular Language Selector */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <button
              id="btn-header-toggle-online"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onToggleOnline?.();
              }}
              title={
                isOnline
                  ? 'ऑनलाइन मोड सक्रिय है। ऑफ़लाइन टेस्ट करने के लिए क्लिक करें'
                  : 'ऑफ़लाइन मोड सक्रिय है। ऑनलाइन वापस आने के लिए क्लिक करें'
              }
              aria-label={isOnline ? 'Toggle offline mode' : 'Toggle online mode'}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-[#006948] border border-[#bccac0]/40 hover:bg-[#f2f4f6] active:scale-95 transition-all cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-[#006948] animate-pulse' : 'bg-[#8d4b00]'
                }`}
              />
              <span className="text-[11px] font-bold">
                {isOnline ? 'ऑनलाइन Online' : 'ऑफ़लाइन Offline'}
              </span>
            </button>

            <button
              id="btn-header-sync"
              onClick={onSync}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eceef0] text-[#3d4a42] hover:bg-[#e0e3e5] active:scale-95 transition-all text-[11px] border border-transparent hover:border-[#bccac0]"
            >
              <span
                className={`material-symbols-outlined text-[13px] ${
                  isSyncing ? 'animate-spin text-[#006948]' : ''
                }`}
              >
                sync
              </span>
              <span>{isSyncing ? 'सिंक हो रहा...' : 'सिंक'}</span>
            </button>

            {/* Quick Switch to other role shortcut button */}
            <button
              onClick={onOpenLogin}
              className="text-[11px] font-bold text-[#006948] hover:underline flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
              <span className="hidden sm:inline">बदलें</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center rounded-full bg-[#e6e8ea] p-0.5 border border-[#bccac0]/30">
            <button
              onClick={() => {
                triggerHaptic(15);
                onLanguageChange('hi');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                language === 'hi'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-[#3d4a42] hover:text-[#191c1e]'
              }`}
            >
              HI हिंदी
            </button>
            <button
              onClick={() => {
                triggerHaptic(15);
                onLanguageChange('en');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                language === 'en'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-[#3d4a42] hover:text-[#191c1e]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                triggerHaptic(15);
                onLanguageChange('mr');
              }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                language === 'mr'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-[#3d4a42] hover:text-[#191c1e]'
              }`}
            >
              MR
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
