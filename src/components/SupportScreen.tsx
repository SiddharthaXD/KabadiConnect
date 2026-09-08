import React from 'react';
import { Language, UserProfile } from '../types';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';

interface SupportScreenProps {
  language: Language;
  onResetData: () => void;
  userProfile?: UserProfile;
  onSwitchRole?: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({
  language,
  onResetData,
  userProfile,
  onSwitchRole,
}) => {
  const isRecycler = userProfile?.role === 'recycler';

  const handleCallHelpline = () => {
    triggerHaptic(20);
    speakVernacular(TRANSLATIONS[language].globalSpeech.supportCallingMsg, language);
    window.location.href = 'tel:18001234567';
  };

  const handleReadSafety = () => {
    triggerHaptic(20);
    speakVernacular(
      language === 'mr'
        ? 'ई-कचरा सुरक्षा नियम: लिथियम बॅटरी कधीही फोडू नका, पाण्यापासून दूर ठेवा, आणि फक्त अधिकृत रिसायकलरला द्या.'
        : language === 'en'
        ? 'E-waste safety rules: Never break lithium batteries, keep away from water, and hand over only to authorized recyclers.'
        : 'ई-कचरा सुरक्षा नियम: लिथियम बैटरी को कभी न फोड़ें, पानी से दूर रखें, भारी दस्ताने पहनें और केवल अधिकृत रीसाइक्लर को ही हैंडओवर करें।',
      language
    );
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-4">
      {/* Helpline Hero */}
      <div className="bg-[#ffdcc3] rounded-2xl p-4 shadow-md border-2 border-[#8d4b00]/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#8d4b00] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">support_agent</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#6e3900] uppercase">
              CPCB प्रमाणित ई-कचरा सहायता
            </span>
            <h3 className="text-[18px] font-black text-[#2f1500] leading-tight">
              {isRecycler ? 'रीसाइक्लर सहायता केंद्र' : 'कबाड़ीवाला सहायता केंद्र'}
            </h3>
            <span className="text-[12px] text-[#565e74]">टोल-फ्री नंबर: 1800-123-4567</span>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-[#8d4b00]/20 flex items-center justify-between gap-2">
          <button
            onClick={handleCallHelpline}
            className="flex-1 h-11 bg-[#2f1500] text-[#ffdcc3] rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">phone</span>
            <span>कॉल करें (Call Now)</span>
          </button>
          <button
            onClick={handleReadSafety}
            className="h-11 px-3 bg-white text-[#2f1500] rounded-xl font-bold text-[13px] flex items-center gap-1 active:scale-95 border border-[#8d4b00]/30 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-[#8d4b00]">volume_up</span>
            <span>नियम सुनें</span>
          </button>
        </div>
      </div>

      {/* User Profile Card (Dynamic Role Display) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#565e74] uppercase font-['Space_Grotesk']">
            {isRecycler ? 'रीसाइक्लर प्रोफ़ाइल' : 'संग्राहक प्रोफ़ाइल (COLLECTOR ID)'}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isRecycler
                ? 'bg-[#dae2fd] text-[#131b2e]'
                : 'bg-[#85f8c4] text-[#002114]'
            }`}
          >
            {userProfile?.verifiedBadge || (isRecycler ? 'CPCB अधिकृत' : 'सत्यापित साथी')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-[#006948] text-white flex items-center justify-center text-[22px] font-bold shadow-sm shrink-0">
              {userProfile?.avatarInitials || (isRecycler ? 'GR' : 'RK')}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[16px] font-bold text-[#191c1e] truncate">
                {userProfile?.name || (isRecycler ? 'राजेश शर्मा' : 'रामेश्वर कबाड़ीवाला')}
              </span>
              <span className="text-[12px] text-[#565e74] truncate">
                {userProfile?.businessName}
              </span>
              <span className="text-[11px] text-[#006948] font-bold truncate">
                {userProfile?.zone}
              </span>
            </div>
          </div>

          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="px-3 py-2 rounded-xl bg-[#f2f4f6] hover:bg-[#85f8c4]/40 text-[#006948] font-bold text-[12px] flex items-center gap-1 border border-[#bccac0]/50 active:scale-95 shrink-0 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>बदलें</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Golden Safety Rules for E-Waste */}
      <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-2">
        <h4 className="text-[15px] font-bold text-[#191c1e] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">
            health_and_safety
          </span>
          3 स्वर्ण सुरक्षा नियम (Golden Rules)
        </h4>

        <div className="space-y-2 mt-1">
          <div className="p-2 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#ba1a1a] text-white text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </span>
            <span>
              <strong>बैटरी को अलग रखें:</strong> मोबाइल व लैपटॉप की फूली हुई बैटरियों को धातु के बक्से या प्लास्टिक थैले में अलग रखें।
            </span>
          </div>

          <div className="p-2 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#565e74] text-white text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </span>
            <span>
              <strong>दस्ताने व चश्मा:</strong> सीआरटी टीवी, स्क्रीन या सर्किट बोर्ड तोड़ते समय भारी रबर दस्ताने पहनें।
            </span>
          </div>

          <div className="p-2 bg-[#f2f4f6] rounded-lg text-[13px] text-[#191c1e] flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#006948] text-white text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </span>
            <span>
              <strong>अधिकृत केंद्रों पर हैंडओवर:</strong> बिना लाइसेंस वाले भट्टी वालों को न बेचें, केवल CPCB प्रमाणित रिसाइक्लर से डील पक्की करें।
            </span>
          </div>
        </div>
      </div>

      {/* Reset Demo Data Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            triggerHaptic(25);
            onResetData();
            speakVernacular(TRANSLATIONS[language].globalSpeech.dataResetMsg, language);
          }}
          className="w-full h-11 bg-[#eceef0] text-[#565e74] hover:text-[#ba1a1a] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 active:scale-95 border border-[#bccac0]/40 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>डेमो डेटा रीसेट करें (Reset Sample Deals)</span>
        </button>
      </div>
    </div>
  );
};
