import React, { useEffect, useRef } from 'react';
import { Transaction, Language } from '../types';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';

interface TransactionReceiptProps {
  transaction: Transaction;
  onGoHome: () => void;
  language: Language;
}

export const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  transaction,
  onGoHome,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Celebratory confetti effect
  useEffect(() => {
    triggerHaptic([50, 40, 60, 40, 100]);
    speakVernacular(
      language === 'mr'
        ? 'सौदा पूर्ण झाला आहे. रिसायकलरला क्यूआर कोड दाखवा आणि आपली रक्कम प्राप्त करा.'
        : language === 'en'
        ? 'Deal successful. Show this QR code to the recycler to collect your payout.'
        : 'सौदा दर्ज हो गया है। रिसाइक्लर को क्यूआर कोड स्कैन कराएं और अपनी राशि प्राप्त करें।',
      language
    );

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 360;
    canvas.height = 240;

    const colors = ['#006948', '#85f8c4', '#8d4b00', '#ffdcc3', '#dae2fd', '#00855d'];
    const particles: {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      vRot: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 40,
        w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 3,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [language]);

  const handlePlayVoice = () => {
    triggerHaptic(20);
    const amountStr = transaction.totalPayout.toLocaleString('en-IN');
    speakVernacular(
      language === 'mr'
        ? `कोड स्कॅन करा आणि रोख किंवा UPI द्वारे ${amountStr} रुपये मिळवा.`
        : language === 'en'
        ? `Scan code and collect ${amountStr} rupees via cash or UPI.`
        : `कोड स्कैन कराएं और नकद या यूपीआई में ${amountStr} रुपये लें।`,
      language
    );
  };

  const handleShareReceipt = async () => {
    triggerHaptic(25);
    const receiptText = `{language === 'en' ? 'Deal Confirmed:' : language === 'mr' ? 'सौदा पक्का:' : 'सौदा पक्का:'} ${transaction.txnNumber} | {language === 'en' ? 'Amount:' : language === 'mr' ? 'रक्कम:' : 'राशि:'} ₹${transaction.totalPayout.toLocaleString(
      'en-IN'
    )} (${transaction.weightKg} KG ${transaction.scrapItem.nameHi}) {language === 'en' ? 'Recycler:' : language === 'mr' ? 'रिसायकलर:' : 'रिसाइक्लर:'} ${
      transaction.recycler.nameHi
    }`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? 'SmartKabadi Receipt' : language === 'mr' ? 'SmartKabadi पावती' : 'SmartKabadi रसीद',
          text: receiptText,
          url: window.location.href,
        });
      } catch {
        // Fallback or user canceled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(receiptText);
      speakVernacular(TRANSLATIONS[language].globalSpeech.receiptCopiedMsg, language);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-28 gap-3 relative">
      {/* Confetti Canvas */}
      <div className="absolute top-16 inset-x-0 h-60 pointer-events-none z-0 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* 1. Success Banner & Status */}
      <div className="relative z-10 flex flex-col items-center text-center pt-2">
        {/* Massive Glowing Circular Checkmark Badge */}
        <div className="relative flex items-center justify-center mb-2">
          <div className="absolute w-20 h-20 rounded-full bg-[#68dba9]/40 animate-ping" />
          <div className="w-18 h-18 rounded-full bg-[#006948] flex items-center justify-center shadow-lg relative z-10 text-white border-2 border-white">
            <span
              className="material-symbols-outlined text-[44px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
            >
              check_circle
            </span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-[26px] font-black text-[#006948] tracking-tight mb-0.5">
          {language === 'en' ? 'Deal Confirmed!' : language === 'mr' ? 'सौदा पक्का!' : 'सौदा पक्का!'}
        </h2>
        <p className="text-[17px] font-extrabold text-[#565e74]">Deal Logged Successfully</p>

        {/* Transaction ID & Timestamp Badge */}
        <div className="mt-2 px-3 py-1 rounded-full bg-[#e6e8ea] flex items-center gap-1.5 shadow-sm border border-[#bccac0]/50">
          <span className="material-symbols-outlined text-[#006948] text-[18px]">
            receipt_long
          </span>
          <span className="text-[13px] font-bold text-[#191c1e] font-['Space_Grotesk']">
            {transaction.txnNumber}
          </span>
          <span className="text-[12px] text-[#565e74]">| {language === 'en' ? 'Today, 3:45 PM' : language === 'mr' ? 'आज, 3:45 PM' : 'आज, 3:45 PM'}</span>
        </div>
      </div>

      {/* 2. Offline State Indicator Badge */}
      <div className="w-full bg-[#ffdcc3] rounded-xl p-3 flex items-center gap-2.5 shadow-sm border-2 border-[#8d4b00]/30 z-10">
        <div className="w-10 h-10 rounded-full bg-[#8d4b00] text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[22px]">cloud_off</span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b15f00] animate-pulse" />
            <span className="text-[13px] font-bold text-[#2f1500]">
              {language === 'en' ? 'Saved Locally' : language === 'mr' ? 'ऑफलाइन सेव्ह झाले' : 'ऑफ़लाइन सेव हुआ (Saved Locally)'}
            </span>
          </div>
          <p className="text-[11px] text-[#6e3900] leading-tight mt-0.5 font-medium">
            {language === 'en' ? 'Will sync to ledger when online' : language === 'mr' ? 'नेटवर्क येताच मुख्य लेजरमध्ये जोडले जाईल' : 'नेटवर्क आते ही मुख्य लेजर में जुड़ जाएगा'}
          </p>
        </div>
      </div>

      {/* 3. Central High-Contrast Scannable QR Code Card */}
      <div className="w-full bg-white rounded-xl p-4 flex flex-col items-center text-center shadow-md relative border-2 border-[#191c1e] z-10">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-[13px] font-bold text-[#565e74] uppercase tracking-wider font-['Space_Grotesk']">
            {language === 'en' ? 'Digital Handover Pass' : language === 'mr' ? 'डिजिटल हँडओव्हर पास' : 'डिजिटल हैंडओवर पास'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#85f8c4] text-[#002114] text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span> {language === 'en' ? 'Verified' : language === 'mr' ? 'सत्यापित' : 'सत्यापित'}
          </span>
        </div>

        {/* High-Contrast QR Code Visual Container */}
        <div className="p-2 bg-white rounded-xl shadow-inner flex flex-col items-center justify-center my-1">
          <div className="w-52 h-52 bg-[#191c1e] p-2.5 rounded-xl flex items-center justify-center shadow-md">
            {/* High fidelity SVG QR */}
            <svg
              className="w-full h-full text-white"
              viewBox="0 0 160 160"
              fill="currentColor"
            >
              <rect x="8" y="8" width="44" height="44" rx="6" fill="white" />
              <rect x="14" y="14" width="32" height="32" rx="4" fill="#191c1e" />
              <rect x="22" y="22" width="16" height="16" rx="2" fill="white" />

              <rect x="108" y="8" width="44" height="44" rx="6" fill="white" />
              <rect x="114" y="14" width="32" height="32" rx="4" fill="#191c1e" />
              <rect x="122" y="22" width="16" height="16" rx="2" fill="white" />

              <rect x="8" y="108" width="44" height="44" rx="6" fill="white" />
              <rect x="14" y="114" width="32" height="32" rx="4" fill="#191c1e" />
              <rect x="22" y="122" width="16" height="16" rx="2" fill="white" />

              {/* Data Modules */}
              <rect x="58" y="10" width="8" height="8" fill="white" />
              <rect x="74" y="10" width="8" height="8" fill="white" />
              <rect x="90" y="10" width="8" height="8" fill="white" />
              <rect x="58" y="26" width="16" height="8" fill="white" />
              <rect x="82" y="26" width="8" height="16" fill="white" />
              <rect x="66" y="42" width="8" height="8" fill="white" />

              {/* Center Logo Emblem */}
              <rect x="64" y="64" width="32" height="32" rx="6" fill="#006948" />
              <path
                d="M72 80 L78 86 L88 74"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <rect x="10" y="58" width="8" height="16" fill="white" />
              <rect x="26" y="74" width="16" height="8" fill="white" />
              <rect x="10" y="90" width="8" height="8" fill="white" />
              <rect x="42" y="58" width="8" height="24" fill="white" />
              <rect x="108" y="58" width="16" height="8" fill="white" />
              <rect x="132" y="58" width="16" height="8" fill="white" />
              <rect x="116" y="74" width="8" height="16" fill="white" />
              <rect x="140" y="82" width="8" height="8" fill="white" />
              <rect x="108" y="90" width="16" height="8" fill="white" />

              <rect x="58" y="108" width="16" height="8" fill="white" />
              <rect x="82" y="108" width="8" height="16" fill="white" />
              <rect x="58" y="124" width="8" height="24" fill="white" />
              <rect x="74" y="132" width="16" height="8" fill="white" />
              <rect x="98" y="124" width="8" height="16" fill="white" />
              <rect x="108" y="140" width="24" height="8" fill="white" />
              <rect x="140" y="124" width="8" height="24" fill="white" />
            </svg>
          </div>
        </div>

        {/* Scannable Prompt */}
        <p className="text-[17px] font-bold text-[#191c1e] mt-2">
          {language === 'en' ? 'Scan this code at Recycler' : language === 'mr' ? 'रिसायकलरला हा कोड स्कॅन करायला सांगा' : 'रिसाइक्लर को यह कोड स्कैन करवाएं'}
        </p>
        <p className="text-[12px] text-[#565e74]">
          Show this QR code to the recycler to complete handover
        </p>

        {/* Vernacular Audio Tap Chip */}
        <button
          id="btn-voice-qr-chip"
          type="button"
          onClick={handlePlayVoice}
          className="mt-3 w-full py-2 px-3 rounded-full bg-[#ffdcc3] text-[#2f1500] flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm border border-[#8d4b00]/20"
        >
          <span className="material-symbols-outlined text-[20px] text-[#8d4b00] animate-pulse">
            volume_up
          </span>
          <span className="text-[13px] font-bold">
            "{language === 'en' ? 'Scan code and get Cash/UPI' : language === 'mr' ? 'कोड स्कॅन करा आणि रोख/UPI घ्या' : 'कोड स्कैन कराएं और नकद/UPI लें'}"
          </span>
        </button>
      </div>

      {/* 4. Two-Way Visual Ledger Receipt (Split Cards) */}
      <div className="flex flex-col gap-2 z-10">
        <span className="text-[13px] font-bold text-[#565e74] uppercase tracking-wider px-1 font-['Space_Grotesk']">
          {language === 'en' ? 'LEDGER SUMMARY' : language === 'mr' ? 'व्यवहार तपशील (LEDGER SUMMARY)' : 'लेन-देन विवरण (LEDGER SUMMARY)'}
        </span>

        {/* Top/Green: Incoming Payment Card */}
        <div className="w-full bg-[#00855d] text-white rounded-xl p-3.5 shadow-md flex items-center justify-between border-2 border-[#002114]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px] text-white">payments</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] uppercase font-bold opacity-90">{language === 'en' ? 'Collector (YOU)' : language === 'mr' ? 'कबाडीवाला (YOU)' : 'कबाड़ीवाला (YOU)'}</span>
                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
              </div>
              <p className="text-[14px] font-bold truncate">{language === 'en' ? 'Cash / UPI Sale Amount' : language === 'mr' ? 'रोख / UPI विक्री रक्कम' : 'नकद / UPI बिक्री राशि'}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[28px] font-bold font-['Space_Grotesk'] leading-none text-white">
              ₹{transaction.totalPayout.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#85f8c4] font-bold bg-[#002114]/40 px-2 py-0.5 rounded-full inline-block mt-1">
              {language === 'en' ? 'Payable' : language === 'mr' ? 'जमा (Payable)' : 'जमा (Payable)'}
            </span>
          </div>
        </div>

        {/* Bottom/Blue: Material Handover Card */}
        <div className="w-full bg-[#dae2fd] text-[#131b2e] rounded-xl p-3.5 shadow-md flex items-center justify-between border-2 border-[#565e74]/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/80 text-[#565e74] flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">memory</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#5c647a] uppercase font-bold">
                  {language === 'en' ? 'Recycler' : language === 'mr' ? 'रिसायकलर (Handover)' : 'रिसाइक्लर (HANDOVER)'}
                </span>
                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
              </div>
              <p className="text-[14px] font-bold text-[#131b2e] truncate">
                {transaction.scrapItem.nameHi}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[26px] font-bold font-['Space_Grotesk'] leading-none text-[#131b2e]">
              {transaction.weightKg.toFixed(1)}{' '}
              <span className="text-[16px] font-bold">KG</span>
            </div>
            <span className="text-[11px] text-[#565e74] font-bold bg-white/70 px-2 py-0.5 rounded-full inline-block mt-1">
              {language === 'en' ? 'Weight' : language === 'mr' ? 'ई-कचरा वजन' : 'ई-कचरा वजन'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Verified Recycler Info Strip */}
      <div className="w-full bg-[#eceef0] rounded-xl p-3 flex items-center justify-between border border-[#bccac0]/50 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#006948] shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">factory</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-[#191c1e] truncate">
              {language === 'mr' ? (transaction.recycler.nameMr || transaction.recycler.nameHi) : language === 'en' ? transaction.recycler.nameEn : transaction.recycler.nameHi}
            </span>
            <span className="text-[11px] text-[#565e74] truncate">
              {language === 'mr' ? (transaction.recycler.addressMr || transaction.recycler.addressHi) : language === 'en' ? transaction.recycler.addressEn : transaction.recycler.addressHi} (कलेक्शन वैन #DL-8C-4091)
            </span>
          </div>
        </div>

        <a
          href={`tel:${transaction.recycler.phone}`}
          className="w-9 h-9 rounded-full bg-[#85f8c4] flex items-center justify-center text-[#006948] active:scale-95 transition-transform shrink-0 shadow-sm border border-[#006948]/20"
          aria-label="Call Recycler"
        >
          <span className="material-symbols-outlined text-[18px]">phone</span>
        </a>
      </div>

      {/* 6. Primary and Secondary Action Buttons */}
      <div className="flex flex-col gap-2 mt-1 mb-6 z-10">
        {/* Massive Primary Home Button */}
        <button
          id="btn-return-home"
          type="button"
          onClick={() => {
            triggerHaptic(20);
            onGoHome();
          }}
          className="w-full h-15 bg-[#006948] text-white rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform border-2 border-[#002114]"
        >
          <span className="material-symbols-outlined text-[26px]">home</span>
          <span className="text-[17px] font-bold tracking-wide">
            {language === 'en' ? 'Go to Home' : language === 'mr' ? 'मुख्य स्क्रीनवर जा (Home)' : 'मुख्य स्क्रीन पर जाएं (Home)'}
          </span>
        </button>

        {/* Secondary Utility Share Button */}
        <button
          id="btn-share-receipt"
          type="button"
          onClick={handleShareReceipt}
          className="w-full h-13 bg-white text-[#191c1e] rounded-xl flex items-center justify-center gap-2 shadow-sm active:bg-[#eceef0] transition-colors border-2 border-[#191c1e]"
        >
          <span className="material-symbols-outlined text-[22px] text-[#006948]">share</span>
          <span className="text-[15px] font-bold">
            {language === 'en' ? 'Share Receipt / SMS' : language === 'mr' ? 'पावती शेअर करा (Share Slip)' : 'रसीद शेयर करें (Share Slip / SMS)'}
          </span>
        </button>
      </div>
    </div>
  );
};
