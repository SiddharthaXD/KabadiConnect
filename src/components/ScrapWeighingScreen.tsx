import React, { useState } from 'react';
import { ScrapItem, Recycler, Language } from '../types';
import { RECYCLERS, WEIGHING_PCB_IMG } from '../data/scrapData';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';

interface ScrapWeighingScreenProps {
  item: ScrapItem;
  initialWeight?: number;
  onConfirmDeal: (weight: number, recycler: Recycler, totalPayout: number) => void;
  language: Language;
}

export const ScrapWeighingScreen: React.FC<ScrapWeighingScreenProps> = ({
  item,
  initialWeight = 15.5,
  onConfirmDeal,
  language,
}) => {
  const [weight, setWeight] = useState<number>(initialWeight);
  const [selectedRecycler, setSelectedRecycler] = useState<Recycler>(RECYCLERS[0]);
  const maxWeight = 40.0;
  const t = TRANSLATIONS[language].weighingScreen;

  const currentRate = selectedRecycler.offerRate || item.baseRate;
  const totalPayout = Math.round(weight * currentRate);
  const scalePercentage = Math.min(100, Math.max(5, (weight / maxWeight) * 100));

  const handleAdjustWeight = (delta: number) => {
    triggerHaptic(25);
    setWeight((prev) => {
      const next = Math.max(0.5, Math.min(maxWeight, parseFloat((prev + delta).toFixed(1))));
      return next;
    });
  };

  const handleSetPreset = (val: number) => {
    triggerHaptic(30);
    setWeight(val);
  };

  const handleToggleRecycler = (rec: Recycler) => {
    triggerHaptic(30);
    setSelectedRecycler(rec);
    speakVernacular(
      language === 'mr'
        ? `${rec.nameMr || rec.nameHi} निवडले - दर ₹${rec.offerRate} {t.perKg} लागू होईल.`
        : language === 'en'
        ? `Selected ${rec.nameEn} with rate ₹${rec.offerRate} per kg.`
        : `${rec.nameHi} को चुना गया - भाव ₹${rec.offerRate} प्रति किलो लागू होगा।`,
      language
    );
  };

  const handleVoiceWeightHelp = () => {
    triggerHaptic(20);
    speakVernacular(
      language === 'mr'
        ? 'काट्याचे वजन नोंदवा किंवा प्रीसेट बटण दाबा. खाली एकूण रक्कम दिसेल.'
        : language === 'en'
        ? 'Enter scale weight or select a preset. Total payout is shown below.'
        : 'कांटे का {t.scaleWeight} या प्रीसेट बटन दबाएं। नीचे कुल रकम दिखाई देगी।',
      language
    );
  };

  const handleConfirm = () => {
    triggerHaptic([60, 50, 60]);
    speakVernacular(
      language === 'hi'
        ? `सौदा सफल! ₹${totalPayout.toLocaleString('en-IN')} का डिजिटल टोकन जारी किया जा रहा है।`
        : `Deal confirmed! Payout ₹${totalPayout.toLocaleString('en-IN')}.`,
      language
    );
    onConfirmDeal(weight, selectedRecycler, totalPayout);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-36 gap-3">
      {/* Top Offline / Live Sync State Pill */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#eceef0] border border-[#bccac0]/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse" />
          <span className="text-[12px] font-bold text-[#191c1e]">
            लाइव {t.mandiRateStr} अपडेटेड (Live Rates Active)
          </span>
        </div>
        <span className="text-[12px] font-semibold text-[#565e74]">ओखला जोन (Okhla)</span>
      </div>

      {/* Detected Material & Market Rate Card */}
      <div className="flex flex-col p-3.5 rounded-xl bg-white shadow-sm border-2 border-[#191c1e]">
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#006948]/10 shrink-0 border border-[#bccac0]/40">
            <img
              src={item.imageUrl || WEIGHING_PCB_IMG}
              alt={language === 'mr' ? (item.nameMr || item.nameHi) : language === 'en' ? item.nameEn : item.nameHi}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#006948] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[13px]">memory</span>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold truncate">
                AI स्कैन सफल ({item.grade})
              </span>
              <button
                aria-label="सामान का विवरण सुनें"
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  speakVernacular(
                    language === 'mr'
                      ? `${item.nameMr || item.nameHi}, अंदाजे सरकारी दर ₹${item.marketMinRate} ते ₹${item.marketMaxRate} प्रति किलो.`
                      : language === 'en'
                      ? `${item.nameEn}, estimated government rate ₹${item.marketMinRate} to ₹${item.marketMaxRate} per kg.`
                      : `${language === 'mr' ? (item.nameMr || item.nameHi) : language === 'en' ? item.nameEn : item.nameHi}, अनुमानित सरकारी दर ₹${item.marketMinRate} से ₹${item.marketMaxRate} प्रति किलो।`,
                    language
                  );
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#2f1500] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[#8d4b00] text-[16px]">
                  volume_up
                </span>
                <span className="text-[11px] font-bold">{language === 'en' ? 'Listen' : language === 'mr' ? 'ऐका' : 'सुनो'}</span>
              </button>
            </div>

            <h2 className="text-[16px] font-bold text-[#191c1e] truncate leading-tight">
              {language === 'mr' ? (item.nameMr || item.nameHi) : language === 'en' ? item.nameEn : item.nameHi}
            </h2>
            <p className="text-[12px] text-[#565e74] truncate">{item.categoryHi}</p>
          </div>
        </div>

        <div className="mt-3 pt-1 flex items-center justify-between bg-[#f2f4f6] rounded-lg p-2.5 border border-[#bccac0]/30">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#565e74]">अनुमानित सरकारी दर (Market Range)</span>
            <span className="text-[17px] font-bold text-[#006948] font-['Space_Grotesk']">
              ₹{item.marketMinRate} – ₹{item.marketMaxRate}{' '}
              <span className="text-[12px] text-[#565e74]">/ किलो (KG)</span>
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#e6e8ea] text-[#191c1e] text-[12px] font-bold">
            <span className="material-symbols-outlined text-[#006948] text-[16px]">
              trending_up
            </span>
            <span>+4.2% आज</span>
          </div>
        </div>
      </div>

      {/* Recycler Selection Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#006948] text-[20px]">verified</span>
          <h3 className="text-[15px] font-bold text-[#191c1e]">{t.chooseRecycler}</h3>
        </div>
        <span className="text-[12px] font-bold text-[#565e74]">{t.availableBuyers}</span>
      </div>

      {/* Recyclers List */}
      <div className="flex flex-col gap-3">
        {/* Recycler 1: Selected Primary */}
        <div
          id="card-greentech"
          className="flex flex-col rounded-xl bg-white shadow-md overflow-hidden border-3 border-[#006948]"
        >
          {/* Top Details */}
          <div className="p-3.5 bg-white flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#006948] text-white text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    {t.govtAuthorized}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#131b2e] text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {selectedRecycler.distanceKm} {t.kmAway}
                  </span>
                </div>

                <h4 className="text-[17px] font-bold text-[#191c1e] leading-tight truncate">
                  {language === 'mr' ? (selectedRecycler.nameMr || selectedRecycler.nameHi) : language === 'en' ? selectedRecycler.nameEn : selectedRecycler.nameHi}
                </h4>
                <span className="text-[11px] text-[#565e74] truncate">
                  {selectedRecycler.nameEn} • CPCB ID: {selectedRecycler.cpcbId}
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0 bg-[#85f8c4]/40 px-2.5 py-1 rounded-lg border border-[#006948]/20">
                <span className="text-[10px] text-[#005137] font-bold uppercase">{t.offerRate}</span>
                <span className="text-[22px] font-bold text-[#006948] font-['Space_Grotesk'] leading-none">
                  ₹{selectedRecycler.offerRate}
                </span>
                <span className="text-[11px] text-[#005137]">प्रति किलो</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[#565e74] text-[12px]">
              <span className="flex items-center gap-1 text-[#8d4b00] font-medium">
                <span className="material-symbols-outlined text-[15px]">payments</span>
                तुरंत नकद / UPI भुगतान
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#006948] font-medium">
                <span className="material-symbols-outlined text-[15px]">electric_meter</span>
                डिजिटल कांटा प्रमाणित
              </span>
            </div>
          </div>

          {/* Weight Entry Section (Interactive Surface) */}
          <div className="bg-[#f2f4f6] p-3.5 flex flex-col gap-3 border-t border-[#bccac0]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#eceef0] flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[20px]">scale</span>
                </div>
                <span className="text-[15px] font-bold text-[#191c1e]">
                  वजन दर्ज करें (Enter Weight)
                </span>
              </div>

              <button
                aria-label="वजन दर्ज करने के निर्देश सुनें"
                type="button"
                onClick={handleVoiceWeightHelp}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffdcc3] text-[#2f1500] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[#8d4b00] text-[16px]">
                  volume_up
                </span>
                <span className="text-[12px] font-bold">सहायता</span>
              </button>
            </div>

            {/* Big Stepper & Weigh Scale Graphic */}
            <div className="flex flex-col items-center justify-center bg-white rounded-xl p-3 shadow-sm border border-[#bccac0]/40">
              <div className="flex items-center justify-between w-full max-w-xs gap-3">
                {/* Minus Button */}
                <button
                  id="btn-weight-minus"
                  type="button"
                  aria-label="वजन कम करें 0.5 किलो"
                  onClick={() => handleAdjustWeight(-0.5)}
                  className="w-13 h-13 rounded-xl bg-[#e6e8ea] active:bg-[#d8dadc] active:scale-95 flex items-center justify-center text-[#191c1e] transition-all border border-[#191c1e]/20 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[28px]">remove</span>
                </button>

                {/* Massive Weight Readout */}
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      id="weight-display"
                      className="text-[36px] font-bold text-[#191c1e] font-['Space_Grotesk'] tracking-tight"
                    >
                      {weight.toFixed(1)}
                    </span>
                    <span className="text-[16px] font-bold text-[#565e74]">किलो (KG)</span>
                  </div>
                  <span className="text-[12px] text-[#006948] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    तौल सत्यापित
                  </span>
                </div>

                {/* Plus Button */}
                <button
                  id="btn-weight-plus"
                  type="button"
                  aria-label="वजन बढ़ाएं 0.5 किलो"
                  onClick={() => handleAdjustWeight(0.5)}
                  className="w-13 h-13 rounded-xl bg-[#006948] text-white active:bg-[#00855d] active:scale-95 flex items-center justify-center transition-all shadow-sm border border-[#002114]"
                >
                  <span className="material-symbols-outlined text-[28px]">add</span>
                </button>
              </div>

              {/* Visual Scale Bar Indicator */}
              <div className="w-full mt-3 flex flex-col gap-1">
                <div className="w-full h-2 rounded-full bg-[#eceef0] overflow-hidden">
                  <div
                    id="scale-progress"
                    className="h-full bg-[#006948] rounded-full transition-all duration-300"
                    style={{ width: `${scalePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-[#565e74] px-0.5">
                  <span>0 KG</span>
                  <span>{t.maxCapacity}</span>
                </div>
              </div>
            </div>

            {/* Quick Weight Preset Chips */}
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-[#565e74]">
                {t.quickPresets}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15.5, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetPreset(preset)}
                    className={`h-11 rounded-xl text-[14px] font-bold shadow-sm flex items-center justify-center transition-all font-['Space_Grotesk'] border ${
                      weight === preset
                        ? 'bg-[#85f8c4] text-[#002114] border-[#006948]'
                        : 'bg-white text-[#191c1e] hover:bg-[#eceef0] border-[#bccac0]/50'
                    }`}
                  >
                    {preset} KG
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Dynamic Total Payout Card */}
            <div className="flex flex-col p-3.5 rounded-xl bg-[#006948] text-white shadow-md border-2 border-[#002114]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-bold text-white/90 uppercase tracking-wider font-['Space_Grotesk']">
                  {t.totalPayout}
                </span>
                <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">paid</span>
              </div>

              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <div className="flex items-baseline">
                  <span
                    id="total-payout-display"
                    className="text-[34px] font-bold font-['Space_Grotesk'] tracking-tight"
                  >
                    ₹{totalPayout.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-white/15 text-[12px] font-bold text-[#85f8c4] flex items-center gap-1 font-['Space_Grotesk']">
                  <span>
                    {weight.toFixed(1)} KG × ₹{currentRate}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-white/80 mt-1">
                {t.instantPaymentNote}
              </p>
            </div>
          </div>
        </div>

        {/* Recycler 2: Alternative Collapsed Card */}
        {RECYCLERS.filter((r) => r.id !== selectedRecycler.id).map((altRecycler) => (
          <div
            key={altRecycler.id}
            onClick={() => handleToggleRecycler(altRecycler)}
            className="flex flex-col rounded-xl bg-white shadow-sm p-3.5 transition-all opacity-90 hover:opacity-100 cursor-pointer border border-[#bccac0]/60 hover:border-[#006948]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#eceef0] text-[#3d4a42] text-[11px] font-bold">
                    {t.govtAuthorized.split(' ')[0]}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e6e8ea] text-[#191c1e] text-[11px] font-bold">
                    {altRecycler.distanceKm} {t.kmAway}
                  </span>
                </div>
                <h4 className="text-[15px] font-bold text-[#191c1e] truncate">
                  {language === 'mr' ? (altRecycler.nameMr || altRecycler.nameHi) : language === 'en' ? altRecycler.nameEn : altRecycler.nameHi}
                </h4>
                <span className="text-[11px] text-[#565e74]">
                  {language === 'mr' ? (altRecycler.addressMr || altRecycler.addressHi) : language === 'en' ? altRecycler.addressEn : altRecycler.addressHi} • {altRecycler.rating} ★ ({altRecycler.pickupsCount}+
                  Pickups)
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-[11px] text-[#565e74]">{t.offerRate}</span>
                <span className="text-[20px] font-bold text-[#191c1e] font-['Space_Grotesk']">
                  ₹{altRecycler.offerRate}
                </span>
                <span className="text-[11px] text-[#565e74]">/ {t.perKg.split(' ')[1] || 'KG'}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#bccac0]/30 flex items-center justify-between text-[#565e74] text-[11px]">
              <span>{t.pickupIn.replace('X', altRecycler.vanArrivalMins.toString())}</span>
              <span className="text-[#006948] font-bold text-[13px] flex items-center">
                {t.changeBtn} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Environmental Impact Note */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f2f4f6] border border-[#bccac0]/40">
        <div className="w-10 h-10 rounded-full bg-[#85f8c4] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#002114] text-[22px]">eco</span>
        </div>
        <div className="flex flex-col min-w-0">
          <h5 className="text-[14px] font-bold text-[#191c1e] truncate">
            {t.eWastePass}
          </h5>
          <p className="text-[12px] text-[#565e74]">
            {t.environmentalImpact}
          </p>
        </div>
      </div>

      {/* Bottom Sticky Action Dock */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-40 border-t border-[#bccac0]/40">
        <div className="flex flex-col gap-1.5 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-semibold text-[#565e74]">
              {t.finalPayout}
            </span>
            <span
              id="dock-payout-label"
              className="text-[20px] font-bold text-[#006948] font-['Space_Grotesk']"
            >
              ₹{totalPayout.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            id="btn-confirm-handover"
            type="button"
            onClick={handleConfirm}
            className="h-15 w-full rounded-xl bg-[#006948] text-white font-bold text-[17px] flex items-center justify-between px-4 active:scale-[0.98] transition-transform shadow-md border-2 border-[#002114]"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">handshake</span>
              <span className="truncate">{t.confirmHandover}</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[20px] font-bold font-['Space_Grotesk']">
                ₹{totalPayout.toLocaleString('en-IN')}
              </span>
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
