import React, { useState } from 'react';
import { Language, Transaction, ScrapItem } from '../../types';
import { SCRAP_ITEMS } from '../../data/scrapData';
import { speakVernacular, triggerHaptic } from '../../utils/speech';

interface QrHandoverVerificationTabProps {
  language: Language;
  transactions: Transaction[];
  onCompleteVerifiedIntake: (transaction: Transaction) => void;
  initialScannedToken?: string;
}

export const QrHandoverVerificationTab: React.FC<QrHandoverVerificationTabProps> = ({
  language,
  transactions,
  onCompleteVerifiedIntake,
  initialScannedToken,
}) => {
  const [manualTokenInput, setManualTokenInput] = useState<string>(initialScannedToken || '');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [activeTxn, setActiveTxn] = useState<Transaction | null>(null);

  // Discrepancy Scale Resolution State
  const [verifiedScaleWeight, setVerifiedScaleWeight] = useState<number>(0);
  const [verifiedRate, setVerifiedRate] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('UPI (Instant PhonePe / PayTM)');
  const [operatorNotes, setOperatorNotes] = useState<string>('Facility certified digital scale verified. Passed visual contaminants check.');
  const [isCompletedSuccess, setIsCompletedSuccess] = useState<boolean>(false);

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const handleSimulateScan = () => {
    triggerHaptic([40, 50, 40]);
    setIsCameraActive(true);

    const speechMsg =
      language === 'en'
        ? 'Scanning QR code from collector device...'
        : language === 'mr'
        ? 'कबाडीवाला डिव्हाइसवरून डिजिटल क्यूआर कोड स्कॅन होत आहे...'
        : 'कबाड़ीवाला डिवाइस से डिजिटल क्यूआर कोड स्कैन हो रहा है...';
    speakVernacular(speechMsg, language);

    setTimeout(() => {
      const match = transactions[0];
      if (match) {
        loadTransactionForVerification(match);
      }
      setIsCameraActive(false);
    }, 1500);
  };

  const handleManualLookup = () => {
    triggerHaptic(20);
    const cleaned = manualTokenInput.trim().toUpperCase();
    const match = transactions.find(
      (t) => t.txnNumber.toUpperCase().includes(cleaned) || t.id.toUpperCase().includes(cleaned)
    ) || transactions[0];

    if (match) {
      loadTransactionForVerification(match);
    }
  };

  const loadTransactionForVerification = (tx: Transaction) => {
    triggerHaptic([50, 60]);
    setActiveTxn(tx);
    setVerifiedScaleWeight(tx.weightKg);
    setVerifiedRate(tx.ratePerKg);
    setIsCompletedSuccess(false);

    const itemName = getItemName(tx.scrapItem);
    const msg =
      language === 'en'
        ? `Token ${tx.txnNumber} loaded: ${itemName}, estimated ${tx.weightKg} kg.`
        : language === 'mr'
        ? `टोकन ${tx.txnNumber} लोड झाले: ${itemName}, अंदाजे ${tx.weightKg} किलो.`
        : `टोकन ${tx.txnNumber} लोड हुआ: ${itemName}, अनुमानित ${tx.weightKg} किलो।`;
    speakVernacular(msg, language);
  };

  // Calculations
  const calculatedPayout = Math.round(verifiedScaleWeight * verifiedRate);
  const discrepancyKg = activeTxn ? Number((verifiedScaleWeight - activeTxn.weightKg).toFixed(2)) : 0;
  const discrepancyPercent = activeTxn && activeTxn.weightKg > 0
    ? ((discrepancyKg / activeTxn.weightKg) * 100).toFixed(1)
    : '0';

  const handleAuthorizeDigitalSignoff = () => {
    if (!activeTxn) return;
    triggerHaptic([50, 50, 80]);

    const completedTxn: Transaction = {
      ...activeTxn,
      weightKg: verifiedScaleWeight,
      verifiedNetWeightKg: verifiedScaleWeight,
      ratePerKg: verifiedRate,
      totalPayout: calculatedPayout,
      scaleDiscrepancyKg: discrepancyKg,
      paymentMode,
      handoverPassed: true,
      manifestHash: `EPR-0x${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    };

    onCompleteVerifiedIntake(completedTxn);
    setIsCompletedSuccess(true);

    const msg =
      language === 'en'
        ? `Handover verified! Final payout ₹${calculatedPayout} authorized. EPR manifest generated.`
        : language === 'mr'
        ? `हँडओव्हर सत्यापित! अंतिम पेमेंट ₹${calculatedPayout} मंजूर. EPR पावती तयार झाली.`
        : `हैंडओवर सत्यापित! अंतिम भुगतान ₹${calculatedPayout} स्वीकृत। सरकारी EPR रसीद जनरेट हुई।`;
    speakVernacular(msg, language);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[24px]">
              qr_code_scanner
            </span>
            <h3 className="text-[17px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {language === 'en'
                ? 'Facility QR Scanner & Discrepancy Resolution'
                : language === 'mr'
                ? 'सुविधा QR स्कॅनर आणि वजन पडताळणी'
                : 'सुविधा QR स्कैनर एवं तौल विसंगति समाधान'}
            </h3>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-[#94a3b8] mt-0.5">
            {language === 'en'
              ? 'Scan the collector handover pass, reconcile scale weight, and sign off the digital EPR manifest.'
              : language === 'mr'
              ? 'कबाडीवाल्याचा पास स्कॅन करा, डिजिटल काट्यावर अचूक वजन तपासा आणि डिजिटल EPR पावती स्वाक्षरी करा.'
              : 'कबाड़ीवाला का पास स्कैन करें, डिजिटल कांटे पर वास्तविक वजन मिलाएं और डिजिटल हस्ताक्षर करें।'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isCameraActive}
            className="h-11 px-5 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_2px_0px_#191c1e] active:scale-95 transition-all cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isCameraActive ? 'animate-spin' : ''
              }`}
            >
              {isCameraActive ? 'sync' : 'center_focus_strong'}
            </span>
            <span>
              {isCameraActive
                ? language === 'mr'
                  ? 'गेट पास स्कॅन होत आहे...'
                  : language === 'en'
                  ? 'Scanning Gate Pass...'
                  : 'गेट पास स्कैन हो रहा है...'
                : language === 'mr'
                ? 'QR स्कॅनर सुरू करा'
                : language === 'en'
                ? 'Launch QR Scanner'
                : 'QR स्कैनर शुरू करें'}
            </span>
          </button>
        </div>
      </div>

      {/* Manual Token Lookup Bar */}
      <div className="bg-[#f7f9fb] dark:bg-[#0d141b] rounded-2xl p-3.5 border border-[#bccac0]/50 dark:border-[#263849] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <span className="material-symbols-outlined text-[#565e74] dark:text-[#94a3b8]">pin</span>
          <input
            type="text"
            value={manualTokenInput}
            onChange={(e) => setManualTokenInput(e.target.value)}
            placeholder={
              language === 'mr'
                ? 'किंवा टोकन नंबर प्रविष्ट करा (#TXN-89421 किंवा LOT-DEL-4091)...'
                : language === 'en'
                ? 'Or enter Token Number (e.g. #TXN-89421 or LOT-DEL-4091)...'
                : 'या टोकन नंबर दर्ज करें (उदा. #TXN-89421 या LOT-DEL-4091)...'
            }
            className="w-full h-10 px-3 bg-white dark:bg-[#182430] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[13px] font-bold font-mono text-[#191c1e] dark:text-[#ffffff] focus:outline-hidden"
          />
        </div>
        <button
          type="button"
          onClick={handleManualLookup}
          className="w-full sm:w-auto h-10 px-5 bg-[#191c1e] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
        >
          <span>
            {language === 'mr' ? 'टोकन शोधा' : language === 'en' ? 'Fetch Token Record' : 'टोकन खोजें'}
          </span>
        </button>
      </div>

      {/* Active Token Verification & Scale Adjustment Card */}
      {activeTxn ? (
        <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-[#006948] flex flex-col gap-5 animate-in fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#bccac0]/40 dark:border-[#263849] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#006948] text-white flex items-center justify-center font-bold text-[18px]">
                <span className="material-symbols-outlined text-[26px]">scale</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[16px] font-black text-[#191c1e] dark:text-[#ffffff]">
                    {activeTxn.txnNumber}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
                    INSPECTION IN PROGRESS
                  </span>
                </div>
                <span className="text-[12px] text-[#565e74] dark:text-[#94a3b8]">
                  Collector: {activeTxn.collectorName || 'Rameshwar Kabadiwala'} ({activeTxn.collectorCpcbId || 'KBD-DL-9821'})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#565e74] dark:text-[#94a3b8] block">
                Item Detected
              </span>
              <span className="text-[14px] font-black text-[#006948] dark:text-[#34d399]">
                {getItemName(activeTxn.scrapItem)}
              </span>
            </div>
          </div>

          {/* Scale Discrepancy Resolution Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Collector's Estimate */}
            <div className="bg-[#f7f9fb] dark:bg-[#0d141b] p-4 rounded-xl border border-[#bccac0]/40 dark:border-[#263849] flex flex-col">
              <span className="text-[11px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8]">
                1. Collector Field Estimate
              </span>
              <div className="text-[24px] font-black font-mono text-[#191c1e] dark:text-[#ffffff] mt-1">
                {activeTxn.weightKg} <span className="text-[14px]">KG</span>
              </div>
              <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8] mt-auto">
                Estimated @ ₹{activeTxn.ratePerKg}/kg = ₹{activeTxn.totalPayout.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 2. Facility Certified Scale (Editable) */}
            <div className="bg-[#85f8c4]/15 dark:bg-[#062b1e]/40 p-4 rounded-xl border-2 border-[#006948] flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-black text-[#006948] dark:text-[#34d399]">
                  2. Verified Scale Reading
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#006948]">tune</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  value={verifiedScaleWeight}
                  onChange={(e) => {
                    triggerHaptic(10);
                    setVerifiedScaleWeight(Number(e.target.value));
                  }}
                  className="w-full text-[24px] font-black font-mono text-[#006948] dark:text-[#34d399] bg-white dark:bg-[#0d141b] px-3 py-1 rounded-lg border border-[#006948]/50 focus:outline-hidden"
                />
                <span className="text-[14px] font-bold text-[#006948] dark:text-[#34d399]">KG</span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold mt-2">
                <span className="text-[#565e74] dark:text-[#94a3b8]">Verified Rate:</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={verifiedRate}
                    onChange={(e) => setVerifiedRate(Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 bg-white dark:bg-[#0d141b] border border-[#bccac0]/60 rounded text-right font-mono"
                  />
                  <span>/kg</span>
                </div>
              </div>
            </div>

            {/* 3. Discrepancy & Final Net Payout */}
            <div className="bg-[#f7f9fb] dark:bg-[#0d141b] p-4 rounded-xl border border-[#bccac0]/40 dark:border-[#263849] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8]">
                    3. Scale Discrepancy
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      discrepancyKg === 0
                        ? 'bg-gray-200 text-gray-800'
                        : discrepancyKg < 0
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#85f8c4] text-[#002114]'
                    }`}
                  >
                    {discrepancyKg > 0 ? `+${discrepancyKg} kg` : `${discrepancyKg} kg`} ({discrepancyPercent}%)
                  </span>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] block">
                    Final Verified Payout
                  </span>
                  <div className="text-[26px] font-black font-mono text-[#006948] dark:text-[#34d399]">
                    ₹{calculatedPayout.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8] mt-1">
                EPR Manifest automatically records certified net weight.
              </span>
            </div>
          </div>

          {/* Payment & Sign-off Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div>
              <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#ffffff] block mb-1">
                {language === 'en'
                  ? 'Disbursement Payment Mode'
                  : language === 'mr'
                  ? 'पेमेंट पद्धत'
                  : 'भुगतान माध्यम'}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-11 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] focus:outline-hidden"
              >
                <option value="UPI (Instant PhonePe / PayTM)">UPI (Instant PhonePe / PayTM)</option>
                <option value="NEFT / RTGS Direct Bank Transfer">NEFT / RTGS Direct Bank Transfer</option>
                <option value="Cash with Signed Voucher">Cash with Signed Voucher</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#ffffff] block mb-1">
                {language === 'en'
                  ? 'Weighbridge & Inspection Notes'
                  : language === 'mr'
                  ? 'काटा आणि तपासणी टिप्पणी'
                  : 'कांटा एवं निरीक्षण टिप्पणी'}
              </label>
              <input
                type="text"
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                className="w-full h-11 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[12px] text-[#191c1e] dark:text-[#ffffff] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Digital Sign-off CTA */}
          <div className="pt-3 border-t border-[#bccac0]/40 dark:border-[#263849] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-[#565e74] dark:text-[#94a3b8]">
              <span className="material-symbols-outlined text-[18px] text-[#006948]">lock</span>
              <span>
                {language === 'en'
                  ? 'Generates cryptographically timestamped CPCB Form-2 manifest hash.'
                  : language === 'mr'
                  ? 'डिजिटल टाइमस्टॅम्पसह CPCB फॉर्म-२ EPR मॅनिफेस्ट हॅश जनरेट करतो.'
                  : 'CPCB फॉर्म-2 डिजिटल टाइमस्टैम्प सहित रसीद जनरेट करता है।'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTxn(null)}
                className="px-4 h-12 bg-gray-100 dark:bg-gray-800 text-[#565e74] rounded-xl font-bold text-[13px] active:scale-95"
              >
                {language === 'mr' ? 'रद्द करा' : language === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>

              <button
                id="btn-digital-signoff-epr"
                type="button"
                onClick={handleAuthorizeDigitalSignoff}
                className="flex-1 sm:flex-initial px-6 h-12 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-black text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">draw</span>
                <span>
                  {language === 'en'
                    ? 'Authorize & Digital Sign-off EPR Manifest'
                    : language === 'mr'
                    ? 'डिजिटल स्वाक्षरी आणि EPR पावती जारी करा'
                    : 'डिजिटल हस्ताक्षर एवं EPR रसीद जारी करें'}
                </span>
              </button>
            </div>
          </div>

          {/* Success Alert Banner */}
          {isCompletedSuccess && (
            <div className="p-4 bg-[#85f8c4]/30 text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399] border-2 border-[#006948] rounded-xl flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[26px]">verified</span>
                <div>
                  <h5 className="text-[14px] font-black">
                    {language === 'en'
                      ? 'EPR Handover Complete & Recorded!'
                      : language === 'mr'
                      ? 'EPR हँडओव्हर पूर्ण व नोंदवले गेले!'
                      : 'EPR हैंडओवर संपन्न एवं दर्ज!'}
                  </h5>
                  <span className="text-[12px]">
                    {language === 'en'
                      ? `Ledger synchronized. Payout of ₹${calculatedPayout} marked disbursed.`
                      : language === 'mr'
                      ? `खाते सिंक्रोनाइझ झाले. ₹${calculatedPayout} चे पेमेंट वितरीत झाले.`
                      : `खाता सिंक्रोनाइज़ हुआ। ₹${calculatedPayout} का भुगतान वितरित चिह्नित।`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 bg-white dark:bg-[#131c24] rounded-2xl border-2 border-dashed border-[#bccac0]/60 dark:border-[#263849] flex flex-col items-center justify-center text-center gap-2">
          <span className="material-symbols-outlined text-[44px] text-[#565e74] dark:text-[#94a3b8]">
            qr_code_2
          </span>
          <h4 className="text-[15px] font-bold text-[#191c1e] dark:text-[#ffffff]">
            {language === 'en'
              ? 'Ready to Scan or Lookup Token'
              : language === 'mr'
              ? 'स्कॅन किंवा टोकन शोधासाठी सज्ज'
              : 'स्कैन या टोकन खोज के लिए तैयार'}
          </h4>
          <p className="text-[12px] text-[#565e74] dark:text-[#94a3b8] max-w-sm">
            {language === 'en'
              ? 'Click "Launch QR Scanner" above or select an incoming lead to verify weight at the weighbridge.'
              : language === 'mr'
              ? 'वरील "QR स्कॅनर सुरू करा" दाबा किंवा वजन तपासण्यासाठी येणारा लॉट निवडा.'
              : 'ऊपर "Launch QR Scanner" दबाएं या आने वाले लॉट से तौल सत्यापन प्रारंभ करें।'}
          </p>
        </div>
      )}
    </div>
  );
};
