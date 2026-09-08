import React, { useState, useEffect } from 'react';
import { ScrapItem, Language } from '../types';
import { speakVernacular, triggerHaptic, stopSpeech } from '../utils/speech';

interface SafetyHazardModalProps {
  item: ScrapItem;
  isOpen: boolean;
  onConfirmProceed: () => void;
  onRetakePhoto: () => void;
  language: Language;
}

export const SafetyHazardModal: React.FC<SafetyHazardModalProps> = ({
  item,
  isOpen,
  onConfirmProceed,
  onRetakePhoto,
  language,
}) => {
  const [acknowledged, setAcknowledged] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      triggerHaptic([60, 40, 60, 40, 80]);
      // Auto speech alert for safety
      speakVernacular(
        language === 'mr'
          ? 'सावधान! धोकादायक ई-कचरा ओळखला गेला आहे. लिथियम बॅटरीला हातोडा मारू नका आणि पाण्यापासून दूर ठेवा.'
          : language === 'en'
          ? 'Caution! Hazardous scrap detected. Do not hammer lithium batteries and keep away from water.'
          : 'सावधानी! खतरनाक सामान पहचाना गया है। लिथियम बैटरी को हथौड़ा न मारें और पानी से दूर रखें।',
        language
      );
    } else {
      stopSpeech();
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const toggleAudio = () => {
    triggerHaptic(20);
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      speakVernacular(
        language === 'mr'
          ? 'सावधान! धोकादायक ई-कचरा ओळखला गेला आहे. लिथियम बॅटरीला हातोडा मारू नका, पाण्यापासून दूर ठेवा, आणि हातमोजे घालून वेगळ्या पिशवीत ठेवा.'
          : language === 'en'
          ? 'Caution! Hazardous scrap detected. Do not hammer lithium batteries, keep away from water, and store in a separate bag with gloves.'
          : 'सावधानी! खतरनाक सामान पहचाना गया है। लिथियम बैटरी को हथौड़ा न मारें, पानी से दूर रखें, और दस्ताने पहनकर अलग बैग में रखें।',
        language
      );
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop Blur Layer */}
      <div
        id="safety-modal-backdrop"
        onClick={onRetakePhoto}
        className="fixed inset-0 bg-[#2d3133]/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Safety Precautions Bottom Sheet Container */}
      <div
        id="safety-modal-sheet"
        className="relative z-50 w-full max-w-md bg-white rounded-t-3xl p-4 shadow-2xl max-h-[92vh] overflow-y-auto border-t-3 border-x-3 border-[#191c1e] pb-8 animate-in slide-in-from-bottom duration-300"
      >
        {/* Top Pull Bar */}
        <div className="w-12 h-1.5 rounded-full bg-[#bccac0] mx-auto mb-3" />

        {/* Hazard Header Banner with Pulsing Glow */}
        <div className="relative overflow-hidden w-full rounded-xl bg-[#ffdad6] p-3.5 mb-3 border-2 border-[#ba1a1a]">
          {/* Radial pulsing glow */}
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#ba1a1a]/20 rounded-full blur-xl animate-ping pointer-events-none" />

          <div className="relative flex items-start gap-3">
            <div className="w-13 h-13 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-md p-2">
              <span
                className="material-symbols-outlined text-[32px] animate-bounce"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="inline-flex items-center gap-1 text-[#93000a] text-[11px] font-bold tracking-wider uppercase">
                तत्काल सुरक्षा चेतावनी
              </span>
              <h2 className="text-[19px] font-extrabold text-[#93000a] leading-tight">
                सावधानी! खतरनाक सामान
              </h2>
              <p className="text-[11px] text-[#ba1a1a] mt-0.5 font-extrabold font-['Space_Grotesk']">
                HAZARDOUS MATERIAL DETECTED
              </p>
            </div>
          </div>

          {/* Specific Hazard Subtitle Card */}
          <div className="mt-2.5 bg-white/95 rounded-lg p-2 flex items-center gap-2 border border-[#ba1a1a]/20 shadow-sm">
            <span
              className="material-symbols-outlined text-[#ba1a1a] text-[22px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <div className="min-w-0">
              <p className="text-[13px] text-[#191c1e] font-bold truncate">
                {item.hazardTypeHi || 'लिथियम बैटरी (Lithium-ion Battery Pack)'}
              </p>
              <p className="text-[11px] text-[#ba1a1a] truncate font-semibold">
                {item.hazardRiskHi || 'आग व विस्फोट का ख़तरा (Risk of Fire & Toxic Leak)'}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Handling Prompt Context */}
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-[15px] font-bold text-[#191c1e] flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006948] text-[20px]">
              verified_user
            </span>
            सुरक्षित हैंडलिंग निर्देश
          </h3>
          <span className="text-[12px] font-bold text-[#565e74]">3 ज़रूरी नियम</span>
        </div>

        {/* 3 Universal Visual Handling Cards Stack */}
        <div className="flex flex-col gap-2 mb-3">
          {/* Card 1: Do Not Puncture or Crush */}
          <div className="w-full bg-[#f2f4f6] rounded-xl p-2.5 flex items-center gap-3 shadow-sm border border-[#191c1e]/10">
            <div className="relative w-14 h-14 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0 border border-[#ba1a1a]/30">
              <span className="material-symbols-outlined text-[30px]">hardware</span>
              {/* Universal Slashed Overlay Symbol */}
              <div className="absolute inset-0 flex items-center justify-center text-[#ba1a1a] pointer-events-none">
                <span className="material-symbols-outlined text-[44px] font-extrabold">block</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#ba1a1a] text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                <p className="text-[15px] font-bold text-[#191c1e]">हथौड़ा या छेद न करें</p>
              </div>
              <p className="text-[13px] text-[#3d4a42] font-medium">Do NOT Puncture or Crush</p>
              <p className="text-[11px] text-[#ba1a1a] font-semibold mt-0.5">
                दबाने से चिंगारी और धुआं निकल सकता है
              </p>
            </div>
          </div>

          {/* Card 2: Keep Away From Water */}
          <div className="w-full bg-[#f2f4f6] rounded-xl p-2.5 flex items-center gap-3 shadow-sm border border-[#191c1e]/10">
            <div className="relative w-14 h-14 rounded-xl bg-[#dae2fd] text-[#131b2e] flex items-center justify-center shrink-0 border border-[#565e74]/30">
              <span className="material-symbols-outlined text-[30px]">water_drop</span>
              <div className="absolute inset-0 flex items-center justify-center text-[#ba1a1a] pointer-events-none">
                <span className="material-symbols-outlined text-[44px] font-extrabold">block</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#565e74] text-white text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                <p className="text-[15px] font-bold text-[#191c1e]">पानी से दूर रखें</p>
              </div>
              <p className="text-[13px] text-[#3d4a42] font-medium">Keep Dry & Away From Water</p>
              <p className="text-[11px] text-[#ba1a1a] font-semibold mt-0.5">
                गीला होने पर रासायनिक आग का जोखिम
              </p>
            </div>
          </div>

          {/* Card 3: Wear Gloves & Separate Bag */}
          <div className="w-full bg-[#f2f4f6] rounded-xl p-2.5 flex items-center gap-3 shadow-sm border border-[#191c1e]/10">
            <div className="relative w-14 h-14 rounded-xl bg-[#ffdcc3] text-[#2f1500] flex items-center justify-center shrink-0 border border-[#8d4b00]/30">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[24px]">front_hand</span>
                <span className="material-symbols-outlined text-[20px] -ml-1 text-[#8d4b00]">
                  inventory_2
                </span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#b15f00] text-white text-[11px] flex items-center justify-center font-bold">
                  3
                </span>
                <p className="text-[15px] font-bold text-[#191c1e]">
                  दस्ताने पहनें व अलग बैग में रखें
                </p>
              </div>
              <p className="text-[13px] text-[#3d4a42] font-medium">
                Wear Gloves & Store in Separate Bag
              </p>
              <p className="text-[11px] text-[#8d4b00] font-semibold mt-0.5">
                अन्य कबाड़ के साथ रगड़ न लगने दें
              </p>
            </div>
          </div>
        </div>

        {/* Vernacular Audio TTS Playing Pill */}
        <div className="w-full mb-3">
          <button
            id="tts-audio-pill"
            type="button"
            onClick={toggleAudio}
            className="w-full bg-[#ffdcc3] text-[#2f1500] rounded-xl p-2.5 flex items-center justify-between shadow-md active:scale-98 transition-all border border-[#8d4b00]/30"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#b15f00] text-white flex items-center justify-center shrink-0 shadow">
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isPlayingAudio ? 'animate-pulse' : ''
                  }`}
                >
                  {isPlayingAudio ? 'volume_up' : 'volume_off'}
                </span>
              </div>
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
                  <span className="text-[11px] font-bold text-[#8d4b00] tracking-wide uppercase">
                    ऑडियो अलर्ट जारी (Playing Hindi Audio)
                  </span>
                </div>
                <p className="text-[14px] font-bold text-[#2f1500] truncate">
                  आवाज़ में सुरक्षा निर्देश सुनें
                </p>
                <p className="text-[11px] text-[#6e3900] truncate">
                  नल या धूप में न छोड़ें, सावधानी से उठाएं
                </p>
              </div>
            </div>

            {/* Live Soundwave Graphic Indicator */}
            <div className="flex items-center gap-1 px-1 shrink-0">
              <span
                className={`w-1 bg-[#b15f00] rounded-full h-4 ${
                  isPlayingAudio ? 'animate-bounce' : ''
                }`}
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className={`w-1 bg-[#b15f00] rounded-full h-7 ${
                  isPlayingAudio ? 'animate-bounce' : ''
                }`}
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className={`w-1 bg-[#b15f00] rounded-full h-9 ${
                  isPlayingAudio ? 'animate-bounce' : ''
                }`}
                style={{ animationDelay: '0.3s' }}
              />
              <span
                className={`w-1 bg-[#b15f00] rounded-full h-5 ${
                  isPlayingAudio ? 'animate-bounce' : ''
                }`}
                style={{ animationDelay: '0.15s' }}
              />
              <span
                className={`w-1 bg-[#b15f00] rounded-full h-3 ${
                  isPlayingAudio ? 'animate-bounce' : ''
                }`}
                style={{ animationDelay: '0.25s' }}
              />
            </div>
          </button>
        </div>

        {/* Mandatory Acknowledgement Checkbox Container */}
        <label className="w-full bg-[#e6e8ea] rounded-xl p-3 flex items-center gap-3 cursor-pointer mb-3 select-none active:bg-[#eceef0] border border-[#bccac0]/50">
          <input
            type="checkbox"
            id="safety-check"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="w-6 h-6 rounded-md accent-[#006948] cursor-pointer shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] text-[#191c1e] font-bold">
              मैंने खतरे को समझ लिया है (I have read the hazard warning)
            </span>
            <span className="text-[11px] text-[#565e74]">
              सुरक्षित हैंडलिंग के बिना आगे वजन न तौलें
            </span>
          </div>
        </label>

        {/* Dismiss & Primary Operational Confirmation Button */}
        <button
          id="confirm-safety-btn"
          type="button"
          disabled={!acknowledged}
          onClick={() => {
            triggerHaptic([40, 30, 80]);
            onConfirmProceed();
          }}
          className={`w-full h-15 rounded-xl px-4 flex items-center justify-between shadow-xl active:scale-[0.98] transition-all border-2 border-[#002114] ${
            acknowledged
              ? 'bg-[#006948] text-white cursor-pointer'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[16px] font-bold leading-tight">समझ गया, आगे बढ़ें</span>
              <span className="text-[11px] text-[#85f8c4] font-medium">
                Proceed to Scrap Weight & Pricing
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00855d] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
          </div>
        </button>

        {/* Secondary Re-scan Trigger */}
        <div className="w-full text-center mt-2.5">
          <button
            id="rescan-btn"
            type="button"
            onClick={onRetakePhoto}
            className="text-[13px] font-bold text-[#565e74] hover:text-[#191c1e] py-1 px-3 rounded-lg active:bg-[#eceef0] transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">cached</span>
            <span>गलत पहचान? दोबारा फोटो लें (Re-take Photo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
