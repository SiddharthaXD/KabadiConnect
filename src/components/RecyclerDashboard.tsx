import React, { useState } from 'react';
import { UserProfile, Language, Transaction, ScrapItem } from '../types';
import { SCRAP_ITEMS } from '../data/scrapData';
import { TRANSLATIONS } from '../data/translations';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { LanguageBar } from './LanguageBar';

interface RecyclerDashboardProps {
  profile: UserProfile;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  transactions: Transaction[];
  onVerifyTransaction: (txnId: string) => void;
  onSwitchRole: () => void;
  onUpdateRate: (scrapId: string, newRate: number) => void;
}

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({
  profile,
  language,
  onLanguageChange,
  transactions,
  onVerifyTransaction,
  onSwitchRole,
  onUpdateRate,
}) => {
  const t = TRANSLATIONS[language];
  const rc = t.recycler;

  const [scrapRates, setScrapRates] = useState<Record<string, number>>({
    'pcb-motherboard': 300,
    'copper-wire': 550,
    'li-ion-battery': 130,
  });

  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [scannedTxn, setScannedTxn] = useState<Transaction | null>(null);
  const [showRateSavedNotice, setShowRateSavedNotice] = useState<string | null>(null);

  // Recycler metrics
  const totalWeightProcured = transactions.reduce((acc, t) => acc + t.weightKg, 0);
  const totalPayoutDisbursed = transactions.reduce((acc, t) => acc + t.totalPayout, 0);
  const verifiedCount = transactions.filter((t) => t.handoverPassed).length;

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const handleAdjustRate = (scrap: ScrapItem, delta: number) => {
    triggerHaptic(20);
    const current = scrapRates[scrap.id] || scrap.baseRate;
    const next = Math.max(10, current + delta);
    setScrapRates((prev) => ({ ...prev, [scrap.id]: next }));
    onUpdateRate(scrap.id, next);

    const localizedName = getItemName(scrap);
    setShowRateSavedNotice(localizedName);
    setTimeout(() => setShowRateSavedNotice(null), 2000);
  };

  const handleSimulateScanQr = () => {
    triggerHaptic([40, 50, 40]);
    setIsScanningQr(true);
    speakVernacular(rc.audioScanInstruction, language);

    // Simulate instant scan of the latest transaction
    setTimeout(() => {
      const targetTx = transactions[0];
      setScannedTxn(targetTx);
      setIsScanningQr(false);
      triggerHaptic([60, 80]);

      const itemName = getItemName(targetTx.scrapItem);
      const speechMsg =
        language === 'hi'
          ? `टोकन ${targetTx.txnNumber} सत्यापित हुआ। सामग्री ${itemName}, वजन ${targetTx.weightKg} किलो, देय राशि ₹${targetTx.totalPayout}।`
          : language === 'mr'
          ? `टोकन ${targetTx.txnNumber} प्रमाणित झाले. माल ${itemName}, वजन ${targetTx.weightKg} किलो, देय रक्कम ₹${targetTx.totalPayout}.`
          : `Token ${targetTx.txnNumber} verified. Item: ${itemName}, Weight: ${targetTx.weightKg} kg, Payout: ₹${targetTx.totalPayout}.`;

      speakVernacular(speechMsg, language);
    }, 1500);
  };

  const handleConfirmHandoverPayment = () => {
    if (!scannedTxn) return;
    triggerHaptic([50, 40, 70]);
    onVerifyTransaction(scannedTxn.id);

    const speechMsg =
      language === 'hi'
        ? `हैंडओवर स्वीकार कर लिया गया है। ₹${scannedTxn.totalPayout} का भुगतान मार्क हो गया है।`
        : language === 'mr'
        ? `हस्तांतरण स्वीकारण्यात आले आहे. ₹${scannedTxn.totalPayout} चे पेमेंट चिन्हांकित केले आहे.`
        : `Handover approved. Payment of ₹${scannedTxn.totalPayout} marked disbursed.`;

    speakVernacular(speechMsg, language);
    setScannedTxn(null);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-4">
      {/* Multilingual Selector Pill Bar */}
      {onLanguageChange && (
        <LanguageBar currentLanguage={language} onLanguageChange={onLanguageChange} />
      )}

      {/* 1. Recycler Business Header Card */}
      <div className="bg-[#006948] text-white rounded-2xl p-4 shadow-md border-2 border-[#002114] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white text-[#006948] flex items-center justify-center font-bold text-[20px] shadow-sm shrink-0">
              {profile.avatarInitials || 'GR'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-[#85f8c4] uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                {t.cpcbAuthorized}
              </span>
              <h2 className="text-[17px] font-bold text-white truncate leading-tight">
                {profile.businessName}
              </h2>
              <span className="text-[12px] text-white/80 truncate">
                {profile.name} • {profile.cpcbId}
              </span>
            </div>
          </div>

          {/* Switch Role Quick Button */}
          <button
            onClick={onSwitchRole}
            className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shrink-0 border border-white/20"
            title="Switch role"
          >
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            <span>{t.switchRoleBtn}</span>
          </button>
        </div>

        {/* Operational Zone Status */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[12px]">
          <span className="text-white/90 flex items-center gap-1 truncate">
            <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">
              location_on
            </span>
            {profile.zone}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-bold text-[11px] shrink-0">
            {rc.intakeCenterActive}
          </span>
        </div>
      </div>

      {/* 2. Key Buyer Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#bccac0]/50 flex flex-col">
          <span className="text-[11px] text-[#565e74] font-semibold leading-tight">
            {rc.totalProcuredTitle}
          </span>
          <div className="text-[18px] font-bold font-['Space_Grotesk'] text-[#006948] mt-1">
            {totalWeightProcured.toFixed(1)} <span className="text-[12px]">KG</span>
          </div>
          <span className="text-[10px] text-[#006948] font-bold mt-1">
            {rc.totalProcuredSubtitle}
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#bccac0]/50 flex flex-col">
          <span className="text-[11px] text-[#565e74] font-semibold leading-tight">
            {rc.totalDisbursedTitle}
          </span>
          <div className="text-[18px] font-bold font-['Space_Grotesk'] text-[#191c1e] mt-1 truncate">
            ₹{totalPayoutDisbursed.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#565e74] mt-1 truncate">
            {rc.totalDisbursedSubtitle}
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#bccac0]/50 flex flex-col">
          <span className="text-[11px] text-[#565e74] font-semibold leading-tight">
            {rc.verifiedTokensTitle}
          </span>
          <div className="text-[18px] font-bold font-['Space_Grotesk'] text-[#006948] mt-1">
            {verifiedCount}{' '}
            <span className="text-[12px]">
              {language === 'mr' ? 'डील्स' : language === 'en' ? 'deals' : 'डील्स'}
            </span>
          </div>
          <span className="text-[10px] text-[#006948] font-bold mt-1">
            {rc.verifiedTokensSubtitle}
          </span>
        </div>
      </div>

      {/* 3. Primary Central Action: Scan Collector Handover Pass */}
      <div className="bg-[#ffdcc3] rounded-2xl p-4 shadow-md border-2 border-[#8d4b00]/30 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-13 h-13 rounded-2xl bg-[#8d4b00] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[30px]">qr_code_scanner</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-[#6e3900] uppercase font-['Space_Grotesk']">
              {rc.scanPassHeader}
            </span>
            <h3 className="text-[18px] font-extrabold text-[#2f1500] leading-tight">
              {rc.scanPassTitle}
            </h3>
            <p className="text-[12px] text-[#565e74] mt-0.5">{rc.scanPassDesc}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateScanQr}
          disabled={isScanningQr}
          className="w-full h-13 bg-[#2f1500] text-[#ffdcc3] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-md"
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              isScanningQr ? 'animate-spin' : ''
            }`}
          >
            {isScanningQr ? 'sync' : 'center_focus_strong'}
          </span>
          <span>{isScanningQr ? rc.scanningAction : rc.scanPassAction}</span>
        </button>
      </div>

      {/* Scanned Verification Modal / Card (when token scanned) */}
      {scannedTxn && (
        <div className="bg-white rounded-2xl p-4 shadow-xl border-3 border-[#006948] flex flex-col gap-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              {rc.validTokenFound}
            </span>
            <span className="text-[13px] font-bold font-['Space_Grotesk'] text-[#191c1e]">
              {scannedTxn.txnNumber}
            </span>
          </div>

          <div className="p-3 bg-[#f2f4f6] rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#565e74]">{rc.collectorLabel}</span>
              <span className="text-[15px] font-bold text-[#191c1e]">रामेश्वर कबाड़ीवाला</span>
              <span className="text-[12px] text-[#006948] font-bold mt-0.5">
                {getItemName(scannedTxn.scrapItem)} ({scannedTxn.weightKg} KG)
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#565e74]">{rc.payoutDueLabel}</span>
              <div className="text-[22px] font-bold font-['Space_Grotesk'] text-[#006948]">
                ₹{scannedTxn.totalPayout.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmHandoverPayment}
              className="flex-1 h-12 bg-[#006948] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{rc.acceptPayBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => setScannedTxn(null)}
              className="px-3 h-12 bg-[#e6e8ea] text-[#565e74] rounded-xl font-bold text-[13px] active:scale-95"
            >
              {rc.cancelBtn}
            </button>
          </div>
        </div>
      )}

      {/* 4. Live Rate Manager (रीसाइक्लर खरीद दर नियंत्रण) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006948] text-[22px]">tune</span>
            <h3 className="text-[16px] font-bold text-[#191c1e]">{rc.ratesManagerTitle}</h3>
          </div>
          <span className="text-[11px] font-bold text-[#565e74]">{rc.ratesManagerSubtitle}</span>
        </div>

        {showRateSavedNotice && (
          <div className="p-2 bg-[#85f8c4]/40 text-[#002114] text-[12px] font-bold rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>
              {showRateSavedNotice} {rc.rateUpdatedSuccess}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {SCRAP_ITEMS.map((item) => {
            const currentRate = scrapRates[item.id] || item.baseRate;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-[#f2f4f6] rounded-xl border border-[#bccac0]/40"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-[#191c1e] truncate">
                    {getItemName(item)}
                  </span>
                  <span className="text-[11px] text-[#565e74]">
                    {rc.govtBaseRateLabel} ₹{item.baseRate}/KG
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAdjustRate(item, -5)}
                    className="w-8 h-8 rounded-lg bg-white text-[#191c1e] font-bold text-[16px] flex items-center justify-center border border-[#bccac0] active:scale-95 shadow-sm"
                  >
                    -
                  </button>

                  <div className="text-center min-w-[64px]">
                    <span className="text-[17px] font-bold font-['Space_Grotesk'] text-[#006948]">
                      ₹{currentRate}
                    </span>
                    <span className="text-[10px] text-[#565e74] block leading-none">/ KG</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdjustRate(item, 5)}
                    className="w-8 h-8 rounded-lg bg-[#006948] text-white font-bold text-[16px] flex items-center justify-center active:scale-95 shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Incoming Handover Queue */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[15px] font-bold text-[#191c1e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006948] text-[20px]">
              local_shipping
            </span>
            {rc.incomingVansTitle}
          </h4>
          <span className="text-[11px] font-bold text-[#006948]">
            2 {rc.activePickupsCount}
          </span>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-[#f2f4f6] rounded-xl flex items-center justify-between border border-[#bccac0]/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#dae2fd] text-[#131b2e] flex items-center justify-center shrink-0 font-bold">
                RK
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-[#191c1e] truncate">
                  रामेश्वर कबाड़ीवाला (#DEL-9082)
                </span>
                <span className="text-[11px] text-[#565e74]">
                  {getItemName(SCRAP_ITEMS[0])} • 15.5 KG • 12 {rc.minsAway}
                </span>
              </div>
            </div>

            <a
              href="tel:9876543210"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#006948] shadow-sm border border-[#bccac0]/40 shrink-0"
              title={rc.callCollector}
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
            </a>
          </div>

          <div className="p-3 bg-[#f2f4f6] rounded-xl flex items-center justify-between border border-[#bccac0]/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#ffdcc3] text-[#2f1500] flex items-center justify-center shrink-0 font-bold">
                MK
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-[#191c1e] truncate">
                  मोहन लाल स्क्रैप (#DEL-7714)
                </span>
                <span className="text-[11px] text-[#565e74]">
                  {getItemName(SCRAP_ITEMS[1])} • 8.2 KG • 24 {rc.minsAway}
                </span>
              </div>
            </div>

            <a
              href="tel:9811055443"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#006948] shadow-sm border border-[#bccac0]/40 shrink-0"
              title={rc.callCollector}
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
