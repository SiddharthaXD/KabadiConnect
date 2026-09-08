import React, { useState } from 'react';
import { UserRole, Language, UserProfile } from '../types';
import { DEFAULT_KABADIWALA_PROFILE, DEFAULT_RECYCLER_PROFILE } from '../data/scrapData';
import { speakVernacular, triggerHaptic } from '../utils/speech';

interface LoginScreenProps {
  onLogin: (role: UserRole, profile: UserProfile) => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  currentRole?: UserRole;
  onCancel?: () => void;
  isModal?: boolean;
}

interface LanguageItem {
  id: Language;
  flag: string;
  nativeName: string;
  englishLabel: string;
}

const LANGUAGE_OPTIONS: LanguageItem[] = [
  { id: 'hi', flag: '🇮🇳', nativeName: 'हिन्दी', englishLabel: 'Hindi' },
  { id: 'en', flag: '🌐', nativeName: 'English', englishLabel: 'English' },
  { id: 'mr', flag: '🚩', nativeName: 'मराठी', englishLabel: 'Marathi' },
];

interface LoginLocaleContent {
  langSelectLabel: string;
  langBannerPrompt: string;
  platformSubtitle: string;
  audioInstructionBtn: string;
  selectRoleTitle: string;
  backBtn: string;
  kabadiwalaTitle: string;
  kabadiwalaBadge: string;
  kabadiwalaDesc: string;
  kabadiwalaFeatures: string[];
  recyclerTitle: string;
  recyclerBadge: string;
  recyclerDesc: string;
  recyclerFeatures: string[];
  kabadiwalaFormTitle: string;
  recyclerFormTitle: string;
  fastOtpBadge: string;
  mobileLabel: string;
  mobilePlaceholder: string;
  cpcbLabel: string;
  cpcbPlaceholder: string;
  otpLabel: string;
  otpDemoBadge: string;
  submitOtp: string;
  submitKabadiwala: string;
  submitRecycler: string;
  demoSectionTitle: string;
  demoKabadiwalaBtn: string;
  demoRecyclerBtn: string;
  // Spoken vernacular speech prompts
  audioInstructionPrompt: string;
  audioKabadiwalaChosen: string;
  audioRecyclerChosen: string;
  audioOtpSent: string;
  audioWelcomeKabadiwala: string;
  audioWelcomeRecycler: string;
  audioLangSwitched: string;
  audioDemoKabadiwala: string;
  audioDemoRecycler: string;
}

const LOGIN_LOCALES: Record<Language, LoginLocaleContent> = {
  hi: {
    langSelectLabel: 'लॉगिन भाषा चुनें (Choose Language)',
    langBannerPrompt: 'कृपया अपनी पसंदीदा भाषा चुनें',
    platformSubtitle: 'सत्यापित ई-कचरा खरीद व बिक्री प्लेटफॉर्म',
    audioInstructionBtn: 'निर्देश सुनें (ऑडियो)',
    selectRoleTitle: 'लॉगिन भूमिका चुनें',
    backBtn: 'वापस जाएं',
    kabadiwalaTitle: 'कबाड़ीवाला',
    kabadiwalaBadge: 'कबाड़ संग्राहक व विक्रेता',
    kabadiwalaDesc:
      'सामान स्कैन करें, एआई ग्रेडिंग परखें, कांटा तौलें और नजदीकी रीसाइक्लर से तुरंत नकद या यूपीआई भुगतान पाएं।',
    kabadiwalaFeatures: ['AI कैमरा स्कैनर', 'लाइव मंडी दर', 'डिजिटल क्यूआर पास'],
    recyclerTitle: 'अधिकृत रीसाइक्लर',
    recyclerBadge: 'CPCB अधिकृत थोक खरीदार',
    recyclerDesc:
      'कबाड़ीवालों के डिजिटल टोकन स्कैन करें, ई-कचरा वजन सत्यापित करें, अपने खरीद भाव नियंत्रित करें और CPCB रिकॉर्ड रखें।',
    recyclerFeatures: ['टोकन स्कैनर', 'भाव प्रबंधन', 'CPCB ऑडिट रिपोर्ट'],
    kabadiwalaFormTitle: 'कबाड़ीवाला खाता लॉगिन',
    recyclerFormTitle: 'रीसाइक्लर लाइसेंस लॉगिन',
    fastOtpBadge: 'त्वरित ओटीपी',
    mobileLabel: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    cpcbLabel: 'CPCB पंजीकरण संख्या (लाइसेंस आईडी)',
    cpcbPlaceholder: 'उदा. CPCB-DL-8891-EW',
    otpLabel: '4 अंकों का सत्यापन ओटीपी दर्ज करें',
    otpDemoBadge: 'डेमो कोड: 4829',
    submitOtp: 'सत्यापित करें व लॉगिन करें',
    submitKabadiwala: 'कबाड़ीवाला के रूप में आगे बढ़ें',
    submitRecycler: 'रीसाइक्लर के रूप में आगे बढ़ें',
    demoSectionTitle: 'या 1-टैप त्वरित डेमो लॉगिन चुनें',
    demoKabadiwalaBtn: 'कबाड़ीवाला डेमो',
    demoRecyclerBtn: 'रीसाइक्लर डेमो',
    audioInstructionPrompt:
      'कृपया अपनी भूमिका चुनें: कबाड़ीवाला के रूप में लॉगिन करें या अधिकृत रीसाइक्लर के रूप में लॉगिन करें।',
    audioKabadiwalaChosen: 'कबाड़ीवाला लॉगिन चुना गया। सामग्री स्कैन करें और तत्काल मंडी भाव पाएं।',
    audioRecyclerChosen: 'रीसाइक्लर लॉगिन चुना गया। कबाड़ खरीदें और क्यूआर टोकन सत्यापित करें।',
    audioOtpSent: 'ओटीपी 4829 भेजा गया है। पुष्टि करें।',
    audioWelcomeKabadiwala: 'कबाड़ीवाला प्रोफाइल में सफल लॉगिन। आपका स्वागत है।',
    audioWelcomeRecycler: 'रीसाइक्लर पोर्टल में सफल लॉगिन। आपका स्वागत है।',
    audioLangSwitched: 'हिन्दी भाषा चुनी गई। स्मार्ट कबाड़ी में आपका स्वागत है।',
    audioDemoKabadiwala: 'कबाड़ीवाला के रूप में लॉगिन किया गया।',
    audioDemoRecycler: 'रीसाइक्लर के रूप में लॉगिन किया गया।',
  },
  en: {
    langSelectLabel: 'Choose Login Language',
    langBannerPrompt: 'Select your preferred language interface',
    platformSubtitle: 'Verified E-Waste Trading & Recycling Platform',
    audioInstructionBtn: 'Audio Instructions',
    selectRoleTitle: 'Select Your Login Role',
    backBtn: 'Back',
    kabadiwalaTitle: 'Kabadiwala',
    kabadiwalaBadge: 'Scrap Collector & Seller',
    kabadiwalaDesc:
      'Scan scrap with AI camera, verify e-waste grades, weigh on digital scale, and receive instant cash or UPI payments from authorized recyclers.',
    kabadiwalaFeatures: ['AI Camera Scanner', 'Live Market Rate', 'Digital QR Pass'],
    recyclerTitle: 'Authorized Recycler',
    recyclerBadge: 'CPCB Authorized Wholesale Buyer',
    recyclerDesc:
      'Scan collector digital QR tokens, verify e-waste weight, manage your purchase rates, and maintain CPCB regulatory records.',
    recyclerFeatures: ['Token Scanner', 'Rate Management', 'CPCB Audit Reports'],
    kabadiwalaFormTitle: 'Kabadiwala Account Sign In',
    recyclerFormTitle: 'Recycler License Sign In',
    fastOtpBadge: 'Fast OTP',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'Enter 10-digit mobile number',
    cpcbLabel: 'CPCB Registration Number (License ID)',
    cpcbPlaceholder: 'e.g. CPCB-DL-8891-EW',
    otpLabel: 'Enter 4-Digit Verification OTP',
    otpDemoBadge: 'Demo Code: 4829',
    submitOtp: 'Verify & Sign In',
    submitKabadiwala: 'Proceed as Kabadiwala',
    submitRecycler: 'Proceed as Recycler',
    demoSectionTitle: 'Or Choose 1-Tap Quick Demo Login',
    demoKabadiwalaBtn: 'Kabadiwala Demo',
    demoRecyclerBtn: 'Recycler Demo',
    audioInstructionPrompt:
      'Please select your role: Log in as Kabadiwala collector or as Authorized Recycler.',
    audioKabadiwalaChosen:
      'Kabadiwala login selected. Scan e-waste scrap and discover verified market rates.',
    audioRecyclerChosen:
      'Authorized Recycler login selected. Verify collector tokens and manage buying rates.',
    audioOtpSent: 'OTP 4829 sent. Please confirm.',
    audioWelcomeKabadiwala: 'Successfully logged in to Kabadiwala dashboard. Welcome!',
    audioWelcomeRecycler: 'Successfully logged in to Recycler Intake Portal. Welcome!',
    audioLangSwitched: 'English language selected. Welcome to SmartKabadi.',
    audioDemoKabadiwala: 'Signed in as Kabadiwala collector.',
    audioDemoRecycler: 'Signed in as Authorized Recycler.',
  },
  mr: {
    langSelectLabel: 'लॉगिन भाषा निवडा (Choose Language)',
    langBannerPrompt: 'कृपया आपली पसंतीची भाषा निवडा',
    platformSubtitle: 'प्रमाणित ई-कचरा खरेदी व विक्री मंच',
    audioInstructionBtn: 'सूचना ऐका (ऑडिओ)',
    selectRoleTitle: 'लॉगिन भूमिका निवडा',
    backBtn: 'मागे जा',
    kabadiwalaTitle: 'कबाडीवाला',
    kabadiwalaBadge: 'कचरा संग्राहक आणि विक्रेता',
    kabadiwalaDesc:
      'सामग्री स्कॅन करा, एआय प्रतवारी तपासा, डिजिटल वजन करा आणि अधिकृत खरेदीदाराकडून त्वरित नकद किंवा यूपीआय पैसे मिळवा.',
    kabadiwalaFeatures: ['AI कॅमेरा स्कॅनर', 'थेट बाजार भाव', 'डिजिटल QR पास'],
    recyclerTitle: 'अधिकृत रिसायकलर',
    recyclerBadge: 'CPCB अधिकृत घाऊक खरेदीदार',
    recyclerDesc:
      'कबाडीवाल्यांचे डिजिटल टोकन स्कॅन करा, वजन प्रमाणित करा, खरेदी दर व्यवस्थापित करा आणि CPCB नोंदणी अहवाल ठेवा.',
    recyclerFeatures: ['टोकन स्कॅनर', 'दर व्यवस्थापन', 'CPCB ऑडिट अहवाल'],
    kabadiwalaFormTitle: 'कबाडीवाला खाते लॉगिन',
    recyclerFormTitle: 'रिसायकलर परवाना लॉगिन',
    fastOtpBadge: 'जलद ओटीपी',
    mobileLabel: 'मोबाईल क्रमांक',
    mobilePlaceholder: '१० अंकी मोबाईल क्रमांक टाका',
    cpcbLabel: 'CPCB नोंदणी क्रमांक (परवाना आयडी)',
    cpcbPlaceholder: 'उदा. CPCB-DL-8891-EW',
    otpLabel: '४ अंकी पडताळणी ओटीपी टाका',
    otpDemoBadge: 'डेमो कोड: ४८२९',
    submitOtp: 'प्रमाणित करा आणि लॉगिन करा',
    submitKabadiwala: 'कबाडीवाला म्हणून पुढे जा',
    submitRecycler: 'रिसायकलर म्हणून पुढे जा',
    demoSectionTitle: 'किंवा १-टॅप झटपट डेमो लॉगिन निवडा',
    demoKabadiwalaBtn: 'कबाडीवाला डेमो',
    demoRecyclerBtn: 'रिसायकलर डेमो',
    audioInstructionPrompt:
      'कृपया तुमची भूमिका निवडा: कबाडीवाला म्हणून लॉगिन करा किंवा अधिकृत रिसायकलर म्हणून लॉगिन करा.',
    audioKabadiwalaChosen: 'कबाडीवाला लॉगिन निवडले. कचरा स्कॅन करा आणि थेट भाव मिळवा.',
    audioRecyclerChosen: 'रिसायकलर लॉगिन निवडले. ई-कचरा खरेदी करा आणि क्यूआर टोकन प्रमाणित करा.',
    audioOtpSent: 'ओटीपी ४८२९ पाठवला आहे. पुष्टी करा.',
    audioWelcomeKabadiwala: 'कबाडीवाला प्रोफाइलमध्ये यशस्वी लॉगिन. आपले स्वागत आहे.',
    audioWelcomeRecycler: 'अधिकृत रिसायकलर पोर्टलमध्ये यशस्वी लॉगिन. आपले स्वागत आहे.',
    audioLangSwitched: 'मराठी भाषा निवडली. स्मार्ट कबाडी मध्ये आपले स्वागत आहे.',
    audioDemoKabadiwala: 'कबाडीवाला म्हणून थेट लॉगिन केले.',
    audioDemoRecycler: 'अधिकृत रिसायकलर म्हणून थेट लॉगिन केले.',
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  language,
  onLanguageChange,
  currentRole,
  onCancel,
  isModal = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'kabadiwala');
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [cpcbLicense, setCpcbLicense] = useState<string>('CPCB-DL-8891-EW');
  const [showOtpStep, setShowOtpStep] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('4829');

  const t = LOGIN_LOCALES[language] || LOGIN_LOCALES.hi;

  const handleLanguageSelect = (lang: Language) => {
    triggerHaptic(20);
    onLanguageChange?.(lang);
    const welcome = LOGIN_LOCALES[lang].audioLangSwitched;
    speakVernacular(welcome, lang);
  };

  const handleRoleSelect = (role: UserRole) => {
    triggerHaptic(25);
    setSelectedRole(role);
    const msg = role === 'kabadiwala' ? t.audioKabadiwalaChosen : t.audioRecyclerChosen;
    speakVernacular(msg, language);
  };

  const handleHearInstructions = () => {
    triggerHaptic(20);
    speakVernacular(t.audioInstructionPrompt, language);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic([30, 40, 50]);

    if (!showOtpStep) {
      setShowOtpStep(true);
      speakVernacular(t.audioOtpSent, language);
      return;
    }

    const profile: UserProfile =
      selectedRole === 'kabadiwala'
        ? {
            ...DEFAULT_KABADIWALA_PROFILE,
            phone: `+91 ${phoneNumber}`,
          }
        : {
            ...DEFAULT_RECYCLER_PROFILE,
            phone: `+91 ${phoneNumber}`,
            cpcbId: cpcbLicense,
          };

    const welcomeMsg =
      selectedRole === 'kabadiwala' ? t.audioWelcomeKabadiwala : t.audioWelcomeRecycler;

    speakVernacular(welcomeMsg, language);
    onLogin(selectedRole, profile);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    triggerHaptic([40, 50]);
    const profile =
      role === 'kabadiwala' ? DEFAULT_KABADIWALA_PROFILE : DEFAULT_RECYCLER_PROFILE;
    const msg = role === 'kabadiwala' ? t.audioDemoKabadiwala : t.audioDemoRecycler;
    speakVernacular(msg, language);
    onLogin(role, profile);
  };

  return (
    <div
      className={
        isModal
          ? 'flex flex-col w-full gap-4'
          : 'flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-28 gap-4'
      }
    >
      {/* 3-Language Selector Interface Card */}
      <div
        id="login-language-selector"
        className="w-full bg-white rounded-2xl p-3 shadow-sm border-2 border-[#191c1e] flex flex-col gap-2"
      >
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 text-[#191c1e]">
            <span className="material-symbols-outlined text-[18px] text-[#006948]">translate</span>
            <span className="text-[13px] font-black tracking-tight">{t.langSelectLabel}</span>
          </div>
          <span className="text-[11px] font-bold text-[#006948] bg-[#85f8c4]/40 px-2 py-0.5 rounded-full">
            {language === 'hi' ? '3 भाषाएं' : language === 'mr' ? '३ भाषा' : '3 Languages'}
          </span>
        </div>

        {/* Language Selection Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isActive = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                id={`btn-login-lang-${lang.id}`}
                onClick={() => handleLanguageSelect(lang.id)}
                className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-2 ${
                  isActive
                    ? 'bg-[#006948] text-white border-[#002114] shadow-md ring-2 ring-[#006948]/25'
                    : 'bg-[#f2f4f6] text-[#191c1e] border-transparent hover:bg-[#e6e8ea]'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px]">{lang.flag}</span>
                  <span className="text-[14px] font-black leading-none">{lang.nativeName}</span>
                </div>
                <span
                  className={`text-[10px] font-bold leading-none ${
                    isActive ? 'text-[#85f8c4]' : 'text-[#565e74]'
                  }`}
                >
                  {lang.englishLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Branding Top Header */}
      <div className={`text-center flex flex-col items-center ${isModal ? 'pt-1' : ''}`}>
        {!isModal && (
          <div className="w-16 h-16 rounded-2xl bg-[#006948] text-white flex items-center justify-center shadow-lg mb-2 border-2 border-[#002114]">
            <span className="material-symbols-outlined text-[36px]">recycling</span>
          </div>
        )}
        <h1
          className={`${
            isModal ? 'text-[22px]' : 'text-[26px]'
          } font-black text-[#191c1e] tracking-tight`}
        >
          SmartKabadi
        </h1>
        <p className="text-[13px] text-[#565e74] font-semibold mt-0.5">{t.platformSubtitle}</p>

        {/* Vernacular Audio Instruction Button */}
        <button
          type="button"
          onClick={handleHearInstructions}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[12px] font-bold active:scale-95 shadow-sm border border-[#8d4b00]/30"
          title="Audio helper"
        >
          <span className="material-symbols-outlined text-[#8d4b00] text-[18px]">volume_up</span>
          <span>{t.audioInstructionBtn}</span>
        </button>
      </div>

      {/* Role Selection Container */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-black text-[#565e74] uppercase tracking-wider font-['Space_Grotesk']">
            {t.selectRoleTitle}
          </span>
          {onCancel && !isModal && (
            <button
              onClick={onCancel}
              className="text-[12px] font-bold text-[#006948] hover:underline"
            >
              {t.backBtn}
            </button>
          )}
        </div>

        {/* Option 1: Log in as Kabadiwala */}
        <div
          id="role-option-kabadiwala"
          onClick={() => handleRoleSelect('kabadiwala')}
          className={`relative rounded-2xl p-4 cursor-pointer transition-all border-3 ${
            selectedRole === 'kabadiwala'
              ? 'bg-white border-[#006948] shadow-md ring-2 ring-[#006948]/20'
              : 'bg-[#f2f4f6] border-transparent opacity-85 hover:opacity-100 hover:bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                selectedRole === 'kabadiwala'
                  ? 'bg-[#006948] text-white'
                  : 'bg-[#e0e3e5] text-[#565e74]'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[18px] font-black text-[#191c1e] leading-tight">
                  {t.kabadiwalaTitle}
                </span>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedRole === 'kabadiwala'
                      ? 'border-[#006948] bg-[#006948] text-white'
                      : 'border-[#bccac0]'
                  }`}
                >
                  {selectedRole === 'kabadiwala' && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </span>
              </div>
              <p className="text-[12px] text-[#006948] font-bold mt-0.5">{t.kabadiwalaBadge}</p>
              <p className="text-[12px] text-[#565e74] mt-1 leading-snug">{t.kabadiwalaDesc}</p>

              {/* Feature Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                {t.kabadiwalaFeatures.map((feat, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[#85f8c4]/50 text-[#002114] text-[10px] font-bold"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Log in as Recycler */}
        <div
          id="role-option-recycler"
          onClick={() => handleRoleSelect('recycler')}
          className={`relative rounded-2xl p-4 cursor-pointer transition-all border-3 ${
            selectedRole === 'recycler'
              ? 'bg-white border-[#006948] shadow-md ring-2 ring-[#006948]/20'
              : 'bg-[#f2f4f6] border-transparent opacity-85 hover:opacity-100 hover:bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                selectedRole === 'recycler'
                  ? 'bg-[#006948] text-white'
                  : 'bg-[#e0e3e5] text-[#565e74]'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">factory</span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[18px] font-black text-[#191c1e] leading-tight">
                  {t.recyclerTitle}
                </span>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedRole === 'recycler'
                      ? 'border-[#006948] bg-[#006948] text-white'
                      : 'border-[#bccac0]'
                  }`}
                >
                  {selectedRole === 'recycler' && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </span>
              </div>
              <p className="text-[12px] text-[#006948] font-bold mt-0.5">{t.recyclerBadge}</p>
              <p className="text-[12px] text-[#565e74] mt-1 leading-snug">{t.recyclerDesc}</p>

              {/* Feature Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                {t.recyclerFeatures.map((feat, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[#dae2fd] text-[#131b2e] text-[10px] font-bold"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#191c1e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006948] text-[20px]">
              phone_android
            </span>
            <span>
              {selectedRole === 'kabadiwala' ? t.kabadiwalaFormTitle : t.recyclerFormTitle}
            </span>
          </span>
          <span className="text-[11px] font-bold text-[#006948] bg-[#85f8c4]/40 px-2 py-0.5 rounded-full">
            {t.fastOtpBadge}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Mobile input */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#565e74]">{t.mobileLabel}</label>
            <div className="flex items-center rounded-xl bg-[#f2f4f6] px-3 py-2.5 border border-[#bccac0]/50 focus-within:border-[#006948] focus-within:bg-white transition-colors">
              <span className="text-[14px] font-bold text-[#191c1e] mr-2 shrink-0">+91</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.mobilePlaceholder}
                maxLength={10}
                required
                className="w-full bg-transparent text-[15px] font-bold text-[#191c1e] focus:outline-none font-['Space_Grotesk']"
              />
            </div>
          </div>

          {/* Recycler specific CPCB License input */}
          {selectedRole === 'recycler' && (
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#565e74]">{t.cpcbLabel}</label>
              <div className="flex items-center rounded-xl bg-[#f2f4f6] px-3 py-2.5 border border-[#bccac0]/50 focus-within:border-[#006948] focus-within:bg-white transition-colors">
                <span className="material-symbols-outlined text-[20px] text-[#565e74] mr-2">
                  badge
                </span>
                <input
                  type="text"
                  value={cpcbLicense}
                  onChange={(e) => setCpcbLicense(e.target.value)}
                  placeholder={t.cpcbPlaceholder}
                  className="w-full bg-transparent text-[14px] font-bold text-[#191c1e] focus:outline-none font-['Space_Grotesk'] uppercase"
                />
              </div>
            </div>
          )}

          {/* OTP Step */}
          {showOtpStep && (
            <div className="flex flex-col gap-1 bg-[#dae2fd]/40 p-3 rounded-xl border border-[#dae2fd]">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#131b2e]">{t.otpLabel}</label>
                <span className="text-[11px] font-bold text-[#006948]">{t.otpDemoBadge}</span>
              </div>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                maxLength={4}
                required
                className="w-full text-center tracking-[0.5em] text-[22px] font-bold bg-white rounded-lg py-2 border border-[#bccac0] text-[#006948] font-['Space_Grotesk'] focus:outline-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-13 bg-[#006948] text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-md border-2 border-[#002114]"
          >
            <span>
              {showOtpStep
                ? t.submitOtp
                : selectedRole === 'kabadiwala'
                ? t.submitKabadiwala
                : t.submitRecycler}
            </span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        {/* 1-Tap Quick Demo Logins for instant preview */}
        <div className="pt-2 border-t border-[#bccac0]/30 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#565e74] uppercase text-center font-['Space_Grotesk']">
            {t.demoSectionTitle}
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('kabadiwala')}
              className="py-2 px-3 rounded-xl bg-[#e6e8ea] hover:bg-[#85f8c4]/40 text-[#191c1e] text-[12px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all border border-[#bccac0]/40"
            >
              <span className="material-symbols-outlined text-[20px] text-[#006948]">
                inventory_2
              </span>
              <span>{t.demoKabadiwalaBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('recycler')}
              className="py-2 px-3 rounded-xl bg-[#e6e8ea] hover:bg-[#dae2fd] text-[#191c1e] text-[12px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all border border-[#bccac0]/40"
            >
              <span className="material-symbols-outlined text-[20px] text-[#006948]">
                factory
              </span>
              <span>{t.demoRecyclerBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
