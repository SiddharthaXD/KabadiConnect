import React, { useState, useRef } from 'react';
import { Language, UserProfile, Transaction } from '../types';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';

interface SupportScreenProps {
  language: Language;
  onResetData: () => void;
  userProfile?: UserProfile;
  onSwitchRole?: () => void;
  transactions?: Transaction[];
  onImportTransactions?: (transactions: Transaction[]) => void;
  isOnline?: boolean;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({
  language,
  onResetData,
  userProfile,
  onSwitchRole,
  transactions = [],
  onImportTransactions,
  isOnline = true,
}) => {
  const isRecycler = userProfile?.role === 'recycler';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const totalWeight = transactions.reduce((acc, t) => acc + (t.weightKg || 0), 0);
  const totalValuation = transactions.reduce((acc, t) => acc + (t.totalPayout || 0), 0);
  const jsonEstimatedSize = (JSON.stringify(transactions).length / 1024).toFixed(1);

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

  // Export Transactions as JSON file
  const handleExportJSON = () => {
    triggerHaptic(25);
    try {
      const exportPayload = {
        app: 'Kabadiwala Connect',
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        userRole: userProfile?.role || 'kabadiwala',
        userName: userProfile?.name || 'User',
        recordCount: transactions.length,
        totalValuationRupees: totalValuation,
        totalWeightKg: totalWeight,
        transactions: transactions,
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportPayload, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `kabadiwala-transactions-backup-${today}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      const successMsg =
        language === 'mr'
          ? `यशस्वी! ${transactions.length} व्यवहारांची JSON फाईल डाऊनलोड झाली.`
          : language === 'en'
          ? `Success! Exported ${transactions.length} transactions as JSON.`
          : `सफल! ${transactions.length} लेन-देन की JSON बैकअप फ़ाइल डाउनलोड हो गई।`;

      setFeedbackMessage({
        type: 'success',
        text: successMsg,
      });

      speakVernacular(successMsg, language);
    } catch (err) {
      console.error('Export error', err);
      setFeedbackMessage({
        type: 'error',
        text: language === 'en' ? 'Failed to export backup.' : 'बैकअप निर्यात करने में त्रुटि हुई।',
      });
    }
  };

  // Process imported JSON file
  const processJSONFile = (file: File) => {
    triggerHaptic(20);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        let importedList: Transaction[] = [];
        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.transactions)) {
          importedList = parsed.transactions;
        } else {
          throw new Error('Invalid JSON structure: No transaction array found');
        }

        if (importedList.length === 0) {
          setFeedbackMessage({
            type: 'error',
            text:
              language === 'mr'
                ? 'फाईलमध्ये कोणतेही व्यवहार सापडले नाहीत.'
                : language === 'en'
                ? 'No transactions found in this JSON file.'
                : 'इस JSON फ़ाइल में कोई लेन-देन नहीं मिला।',
          });
          return;
        }

        // Standardize timestamps
        const formatted = importedList.map((item, idx) => ({
          ...item,
          id: item.id || `imp_${Date.now()}_${idx}`,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          isSynced: item.isSynced !== undefined ? item.isSynced : false,
        }));

        let finalList: Transaction[];
        if (importMode === 'merge') {
          const existingIds = new Set(transactions.map((t) => t.id));
          const newEntries = formatted.filter((t) => !existingIds.has(t.id));
          finalList = [...newEntries, ...transactions];
        } else {
          finalList = formatted;
        }

        if (onImportTransactions) {
          onImportTransactions(finalList);
        }

        const successText =
          language === 'mr'
            ? `यशस्वी! ${formatted.length} व्यवहार रिस्टोर झाले (${importMode === 'merge' ? 'जोडले' : 'बदलले'}).`
            : language === 'en'
            ? `Success! Restored ${formatted.length} transactions (${importMode === 'merge' ? 'Merged' : 'Replaced'}).`
            : `सफल! ${formatted.length} लेन-देन सफलतापूर्वक रिस्टोर किए गए (${importMode === 'merge' ? 'जोड़े गए' : 'प्रतिस्थापित'})।`;

        setFeedbackMessage({
          type: 'success',
          text: successText,
        });

        speakVernacular(successText, language);
      } catch (err) {
        console.error('Import parse error', err);
        setFeedbackMessage({
          type: 'error',
          text:
            language === 'mr'
              ? 'अवैध JSON फाईल. कृपया योग्य बॅकअप फाईल निवडा.'
              : language === 'en'
              ? 'Invalid JSON file format. Please upload a valid backup.'
              : 'अमान्य JSON फ़ाइल। कृपया सही बैकअप फ़ाइल चुनें।',
        });
      }
    };

    reader.onerror = () => {
      setFeedbackMessage({
        type: 'error',
        text: language === 'en' ? 'Failed to read file.' : 'फ़ाइल पढ़ने में त्रुटि।',
      });
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processJSONFile(files[0]);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processJSONFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-4">
      {/* Helpline Hero */}
      <div className="bg-[#ffdcc3] dark:bg-[#3d2306] rounded-2xl p-4 shadow-md border-2 border-[#8d4b00]/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#8d4b00] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">support_agent</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#6e3900] dark:text-[#fbbf24] uppercase">
              {language === 'en'
                ? 'CPCB Certified E-Waste Support'
                : language === 'mr'
                ? 'CPCB प्रमाणित ई-कचरा मदत'
                : 'CPCB प्रमाणित ई-कचरा सहायता'}
            </span>
            <h3 className="text-[18px] font-black text-[#2f1500] dark:text-[#ffedd5] leading-tight">
              {isRecycler
                ? language === 'en'
                  ? 'Recycler Support Center'
                  : language === 'mr'
                  ? 'रिसायकलर मदत केंद्र'
                  : 'रीसाइक्लर सहायता केंद्र'
                : language === 'en'
                ? 'Collector Support Center'
                : language === 'mr'
                ? 'कबाडीवाला मदत केंद्र'
                : 'कबाड़ीवाला सहायता केंद्र'}
            </h3>
            <span className="text-[12px] text-[#565e74] dark:text-[#cbd5e1]">
              {language === 'en'
                ? 'Toll-Free Number:'
                : language === 'mr'
                ? 'टोल-फ्री क्रमांक:'
                : 'टोल-फ्री नंबर:'}{' '}
              1800-123-4567
            </span>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-[#8d4b00]/20 flex items-center justify-between gap-2">
          <button
            onClick={handleCallHelpline}
            className="flex-1 h-11 bg-[#2f1500] text-[#ffdcc3] rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">phone</span>
            <span>{language === 'en' ? 'Call Now' : language === 'mr' ? 'कॉल करा (Call)' : 'कॉल करें (Call Now)'}</span>
          </button>
          <button
            onClick={handleReadSafety}
            className="h-11 px-3 bg-white dark:bg-[#18232c] text-[#2f1500] dark:text-[#ffedd5] rounded-xl font-bold text-[13px] flex items-center gap-1 active:scale-95 border border-[#8d4b00]/30 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#8d4b00]">volume_up</span>
            <span>{language === 'en' ? 'Listen to Rules' : language === 'mr' ? 'नियम ऐका' : 'नियम सुनें'}</span>
          </button>
        </div>
      </div>

      {/* DEDICATED OFFLINE MODE UI PANEL (Export / Import Transactions JSON) */}
      <div
        id="offline-mode-panel"
        className="bg-white dark:bg-[#131c24] rounded-2xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3.5"
      >
        {/* Panel Header & Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#003b8e]/10 dark:bg-[#254168] text-[#003b8e] dark:text-[#93c5fd] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                {isOnline ? 'cloud_sync' : 'wifi_off'}
              </span>
            </div>
            <div>
              <h4 className="text-[15px] font-black text-[#191c1e] dark:text-[#ffffff] leading-none">
                {language === 'mr'
                  ? 'ऑफलाइन मोड डेटा पॅनल'
                  : language === 'en'
                  ? 'Offline Mode Panel'
                  : 'ऑफ़लाइन मोड डेटा पैनल'}
              </h4>
              <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8]">
                {language === 'mr'
                  ? 'JSON एक्सपोर्ट व इम्पोर्ट बॅकअप'
                  : language === 'en'
                  ? 'JSON Export & Import Backup'
                  : 'JSON एक्सपोर्ट व इम्पोर्ट बैकअप'}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
              isOnline
                ? 'bg-[#85f8c4]/30 text-[#006948] dark:bg-[#062b1e] dark:text-[#34d399] border-[#006948]/30'
                : 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-[#3b1010] dark:text-[#f87171] border-[#ba1a1a]/30 animate-pulse'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-[#006948] dark:bg-[#34d399]' : 'bg-[#ba1a1a] dark:bg-[#f87171]'
              }`}
            ></span>
            {isOnline
              ? language === 'en'
                ? 'Offline Ready'
                : language === 'mr'
                ? 'ऑफलाइन तयार'
                : 'ऑफ़लाइन रेडी'
              : language === 'en'
              ? 'Disconnected'
              : language === 'mr'
              ? 'ऑफलाइन चालू'
              : 'इंटरनेट बंद'}
          </span>
        </div>

        {/* Offline Summary Cards */}
        <div className="grid grid-cols-3 gap-2 bg-[#f7f9fb] dark:bg-[#0d141b] p-2.5 rounded-xl border border-[#bccac0]/40 dark:border-[#263849]">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8]">
              {language === 'mr' ? 'व्यवहार' : language === 'en' ? 'Deals' : 'कुल सौदे'}
            </span>
            <span className="text-[16px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {transactions.length}
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-[#bccac0]/40 dark:border-[#263849] px-1">
            <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8]">
              {language === 'mr' ? 'एकूण वजन' : language === 'en' ? 'Weight' : 'कुल वजन'}
            </span>
            <span className="text-[16px] font-black text-[#006948] dark:text-[#34d399]">
              {totalWeight.toFixed(1)} <span className="text-[11px]">kg</span>
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8]">
              {language === 'mr' ? 'बॅकअप साईझ' : language === 'en' ? 'Size' : 'फ़ाइल आकार'}
            </span>
            <span className="text-[16px] font-black text-[#003b8e] dark:text-[#93c5fd]">
              {jsonEstimatedSize} <span className="text-[11px]">KB</span>
            </span>
          </div>
        </div>

        {/* Feedback / Alert Notice */}
        {feedbackMessage && (
          <div
            className={`p-2.5 rounded-xl text-[12px] font-bold flex items-center justify-between gap-2 border animate-in fade-in duration-200 ${
              feedbackMessage.type === 'success'
                ? 'bg-[#85f8c4]/30 text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399] border-[#006948]/30'
                : 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-[#3b1010] dark:text-[#f87171] border-[#ba1a1a]/30'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[18px] shrink-0">
                {feedbackMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span className="truncate">{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-[16px] material-symbols-outlined shrink-0 opacity-70 hover:opacity-100"
            >
              close
            </button>
          </div>
        )}

        {/* Export Button */}
        <div className="flex flex-col gap-1.5">
          <button
            id="btn-export-json-transactions"
            type="button"
            onClick={handleExportJSON}
            className="w-full h-11 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>
              {language === 'mr'
                ? 'व्यवहार इतिहास डाऊनलोड करा (.JSON)'
                : language === 'en'
                ? 'Export Transaction History (.JSON)'
                : 'लेन-देन बैकअप डाउनलोड करें (.JSON)'}
            </span>
          </button>
          <p className="text-[11px] text-[#565e74] dark:text-[#94a3b8] px-1">
            {language === 'mr'
              ? 'इंटरनेट नसतानाही संपूर्ण व्यवहार सुरक्षित JSON फाईल म्हणून सेव्ह करा.'
              : language === 'en'
              ? 'Save full transaction logs to your device storage when offline.'
              : 'इंटरनेट न होने पर भी सभी लेन-देन अपने डिवाइस में JSON फ़ाइल के रूप में सुरक्षित रखें।'}
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-0.5">
          <div className="border-t border-[#bccac0]/50 dark:border-[#263849] w-full"></div>
          <span className="bg-white dark:bg-[#131c24] px-2 text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] absolute">
            {language === 'mr' ? 'किंवा इम्पोर्ट करा' : language === 'en' ? 'OR RESTORE' : 'या रिस्टोर करें'}
          </span>
        </div>

        {/* Import Strategy Controls */}
        <div className="flex items-center justify-between text-[11px] font-bold px-1">
          <span className="text-[#191c1e] dark:text-[#ffffff]">
            {language === 'mr' ? 'इम्पोर्ट पद्धत:' : language === 'en' ? 'Import Mode:' : 'इम्पोर्ट मोड:'}
          </span>
          <div className="flex items-center gap-2 bg-[#f2f4f6] dark:bg-[#182430] p-0.5 rounded-lg border border-[#bccac0]/40 dark:border-[#33485c]">
            <button
              type="button"
              onClick={() => setImportMode('merge')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                importMode === 'merge'
                  ? 'bg-[#003b8e] text-white shadow-xs'
                  : 'text-[#565e74] dark:text-[#94a3b8]'
              }`}
            >
              {language === 'mr' ? 'जोडा (Merge)' : language === 'en' ? 'Merge' : 'जोड़ें (Merge)'}
            </button>
            <button
              type="button"
              onClick={() => setImportMode('replace')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                importMode === 'replace'
                  ? 'bg-[#ba1a1a] text-white shadow-xs'
                  : 'text-[#565e74] dark:text-[#94a3b8]'
              }`}
            >
              {language === 'mr' ? 'बदला (Replace)' : language === 'en' ? 'Replace' : 'बदलें (Replace)'}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Dropzone / Upload Area */}
        <div
          id="dropzone-import-transactions"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all ${
            isDragging
              ? 'border-[#006948] bg-[#85f8c4]/15 dark:bg-[#062b1e]/50'
              : 'border-[#003b8e]/40 dark:border-[#254168] bg-[#f7f9fb] dark:bg-[#182430] hover:bg-[#dae2fd]/20'
          }`}
        >
          <span className="material-symbols-outlined text-[26px] text-[#003b8e] dark:text-[#93c5fd]">
            upload_file
          </span>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#191c1e] dark:text-[#ffffff]">
              {language === 'mr'
                ? 'JSON बॅकअप फाईल निवडा किंवा ड्रॅग करा'
                : language === 'en'
                ? 'Click or Drag JSON Backup to Restore'
                : 'JSON बैकअप फ़ाइल चुनें या ड्रैग करें'}
            </span>
            <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8]">
              {language === 'mr'
                ? 'समर्थित फॉरमॅट: .json'
                : language === 'en'
                ? 'Supports: .json backups from any device'
                : 'समर्थित प्रारूप: .json बैकअप'}
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Card (Dynamic Role Display) */}
      <div className="bg-white dark:bg-[#131c24] rounded-xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#565e74] dark:text-[#94a3b8] uppercase font-['Space_Grotesk']">
            {isRecycler
              ? language === 'en'
                ? 'Recycler Profile'
                : language === 'mr'
                ? 'रिसायकलर प्रोफाइल'
                : 'रीसाइक्लर प्रोफ़ाइल'
              : language === 'en'
              ? 'Collector Profile'
              : language === 'mr'
              ? 'कबाडीवाला प्रोफाइल (COLLECTOR ID)'
              : 'संग्राहक प्रोफ़ाइल (COLLECTOR ID)'}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isRecycler
                ? 'bg-[#dae2fd] text-[#131b2e] dark:bg-[#254168] dark:text-[#93c5fd]'
                : 'bg-[#85f8c4] text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399]'
            }`}
          >
            {userProfile?.verifiedBadge ||
              (isRecycler
                ? language === 'en'
                  ? 'CPCB Authorized'
                  : language === 'mr'
                  ? 'CPCB अधिकृत'
                  : 'CPCB अधिकृत'
                : language === 'en'
                ? 'Verified Partner'
                : language === 'mr'
                ? 'सत्यापित साथी'
                : 'सत्यापित साथी')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-[#006948] text-white flex items-center justify-center text-[22px] font-bold shadow-sm shrink-0">
              {userProfile?.avatarInitials || (isRecycler ? 'GR' : 'RK')}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[16px] font-bold text-[#191c1e] dark:text-[#ffffff] truncate">
                {userProfile?.name ||
                  (isRecycler
                    ? language === 'en'
                      ? 'Rajesh Sharma'
                      : language === 'mr'
                      ? 'राजेश शर्मा'
                      : 'राजेश शर्मा'
                    : language === 'en'
                    ? 'Rameshwar Kabadiwala'
                    : language === 'mr'
                    ? 'रामेश्वर कबाडीवाला'
                    : 'रामेश्वर कबाड़ीवाला')}
              </span>
              <span className="text-[12px] text-[#565e74] dark:text-[#94a3b8] truncate">
                {userProfile?.businessName}
              </span>
              <span className="text-[11px] text-[#006948] dark:text-[#34d399] font-bold truncate">
                {userProfile?.zone}
              </span>
            </div>
          </div>

          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="px-3 py-2 rounded-xl bg-[#f2f4f6] dark:bg-[#182430] hover:bg-[#85f8c4]/40 text-[#006948] dark:text-[#34d399] font-bold text-[12px] flex items-center gap-1 border border-[#bccac0]/50 dark:border-[#33485c] active:scale-95 shrink-0 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>{language === 'en' ? 'Change' : language === 'mr' ? 'बदला' : 'बदलें'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Golden Safety Rules for E-Waste */}
      <div className="bg-white dark:bg-[#131c24] rounded-xl p-4 shadow-sm border-2 border-[#191c1e] flex flex-col gap-2">
        <h4 className="text-[15px] font-bold text-[#191c1e] dark:text-[#ffffff] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">
            health_and_safety
          </span>
          {language === 'en'
            ? '3 Golden Safety Rules'
            : language === 'mr'
            ? '3 सुवर्ण सुरक्षा नियम (Golden Rules)'
            : '3 स्वर्ण सुरक्षा नियम (Golden Rules)'}
        </h4>

        <div className="space-y-2 mt-1">
          <div className="p-2 bg-[#f2f4f6] dark:bg-[#0d141b] rounded-lg text-[13px] text-[#191c1e] dark:text-[#f1f5f9] flex items-start gap-2 border border-[#bccac0]/20 dark:border-[#263849]">
            <span className="w-5 h-5 rounded-full bg-[#ba1a1a] text-white text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </span>
            <span>
              <strong>
                {language === 'en'
                  ? 'Keep Batteries Separate:'
                  : language === 'mr'
                  ? 'बॅटरी वेगळी ठेवा:'
                  : 'बैटरी को अलग रखें:'}
              </strong>{' '}
              {language === 'en'
                ? 'Keep swollen mobile/laptop batteries in a separate metal or plastic box.'
                : language === 'mr'
                ? 'मोबाईल आणि लॅपटॉपच्या फुगलेल्या बॅटरी धातूच्या किंवा प्लास्टिकच्या पेटीत वेगळ्या ठेवा.'
                : 'मोबाइल व लैपटॉप की फूली हुई बैटरियों को धातु के बक्से या प्लास्टिक थैले में अलग रखें।'}
            </span>
          </div>

          <div className="p-2 bg-[#f2f4f6] dark:bg-[#0d141b] rounded-lg text-[13px] text-[#191c1e] dark:text-[#f1f5f9] flex items-start gap-2 border border-[#bccac0]/20 dark:border-[#263849]">
            <span className="w-5 h-5 rounded-full bg-[#565e74] text-white text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </span>
            <span>
              <strong>
                {language === 'en'
                  ? 'Gloves & Glasses:'
                  : language === 'mr'
                  ? 'हातमोजे व चष्मा:'
                  : 'दस्ताने व चश्मा:'}
              </strong>{' '}
              {language === 'en'
                ? 'Wear heavy rubber gloves when breaking CRT TVs, screens, or circuit boards.'
                : language === 'mr'
                ? 'सीआरटी टीव्ही, स्क्रीन किंवा सर्किट बोर्ड तोडताना जाड रबरी हातमोजे घाला.'
                : 'सीआरटी टीवी, स्क्रीन या सर्किट बोर्ड तोड़ते समय भारी रबर दस्ताने पहनें।'}
            </span>
          </div>

          <div className="p-2 bg-[#f2f4f6] dark:bg-[#0d141b] rounded-lg text-[13px] text-[#191c1e] dark:text-[#f1f5f9] flex items-start gap-2 border border-[#bccac0]/20 dark:border-[#263849]">
            <span className="w-5 h-5 rounded-full bg-[#006948] text-white text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </span>
            <span>
              <strong>
                {language === 'en'
                  ? 'Authorized Handover:'
                  : language === 'mr'
                  ? 'अधिकृत केंद्रांवर हँडओव्हर:'
                  : 'अधिकृत केंद्रों पर हैंडओवर:'}
              </strong>{' '}
              {language === 'en'
                ? 'Do not sell to unlicensed smelters, only deal with CPCB certified recyclers.'
                : language === 'mr'
                ? 'परवाना नसलेल्या भट्टीवाल्यांना विकू नका, केवळ CPCB प्रमाणित रिसायकलर सोबतच व्यवहार करा.'
                : 'बिना लाइसेंस वाले भट्टी वालों को न बेचें, केवल CPCB प्रमाणित रिसाइक्लर से डील पक्की करें।'}
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
          className="w-full h-11 bg-[#eceef0] dark:bg-[#182430] text-[#565e74] dark:text-[#94a3b8] hover:text-[#ba1a1a] dark:hover:text-[#f87171] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 active:scale-95 border border-[#bccac0]/40 dark:border-[#33485c] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>
            {language === 'en'
              ? 'Reset Sample Deals'
              : language === 'mr'
              ? 'डेमो डेटा रीसेट करा (Reset Sample Deals)'
              : 'डेमो डेटा रीसेट करें (Reset Sample Deals)'}
          </span>
        </button>
      </div>
    </div>
  );
};
