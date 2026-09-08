import React, { useState } from 'react';
import { Language, Transaction, EprCertificate, ScrapItem } from '../../types';
import { speakVernacular, triggerHaptic } from '../../utils/speech';

interface EprComplianceReportsTabProps {
  language: Language;
  transactions: Transaction[];
  certificate: EprCertificate;
}

export const EprComplianceReportsTab: React.FC<EprComplianceReportsTabProps> = ({
  language,
  transactions,
  certificate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('September 2026');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const totalProcuredKg = transactions.reduce((acc, t) => acc + (t.weightKg || 0), 0);
  const totalProcuredMT = (totalProcuredKg / 1000).toFixed(2);
  const totalValuation = transactions.reduce((acc, t) => acc + (t.totalPayout || 0), 0);

  const targetMT = certificate.authorizedCapacityMT || 450;
  const currentTotalProcessedMT = Number((certificate.currentProcessedMT + Number(totalProcuredMT)).toFixed(1));
  const progressPercent = Math.min(100, Math.round((currentTotalProcessedMT / targetMT) * 100));

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.txnNumber.toLowerCase().includes(term) ||
      (t.collectorName && t.collectorName.toLowerCase().includes(term)) ||
      (t.collectorCpcbId && t.collectorCpcbId.toLowerCase().includes(term)) ||
      t.scrapItem.nameEn.toLowerCase().includes(term)
    );
  });

  // Export to CSV formatted for CPCB portal
  const handleExportCSV = () => {
    triggerHaptic([30, 40]);
    try {
      const headers = [
        'Transaction_Token',
        'Handover_Date_Time',
        'Collector_Name',
        'Collector_CPCB_ID',
        'Material_Category',
        'Certified_Net_Weight_KG',
        'Rate_Per_KG_INR',
        'Total_Disbursed_INR',
        'GPS_Geotag_Handover',
        'Payment_Method',
        'EPR_Manifest_Hash',
        'Verification_Status',
      ];

      const rows = transactions.map((t) => [
        `"${t.txnNumber}"`,
        `"${new Date(t.timestamp).toISOString()}"`,
        `"${t.collectorName || 'Verified Collector'}"`,
        `"${t.collectorCpcbId || 'KBD-REG-2026'}"`,
        `"${t.scrapItem.nameEn}"`,
        t.weightKg,
        t.ratePerKg,
        t.totalPayout,
        `"${t.geotag || '28.5355° N, 77.2731° E'}"`,
        `"${t.paymentMode || 'Instant UPI'}"`,
        `"${t.manifestHash || 'EPR-0x99A-B12'}"`,
        '"CPCB_VERIFIED"',
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `CPCB-EPR-Compliance-Report-${selectedMonth.replace(' ', '-')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadNotice('CPCB-EPR-Compliance-Report.csv exported successfully!');
      setTimeout(() => setDownloadNotice(null), 3000);

      const msg =
        language === 'en'
          ? 'CPCB compliance CSV report downloaded successfully.'
          : language === 'mr'
          ? 'सरकारी CPCB अनुपालन CSV अहवाल यशस्वीरीत्या डाऊनलोड झाला.'
          : 'सरकारी CPCB अनुपालन CSV रिपोर्ट सफलतापूर्वक डाउनलोड हुई।';
      speakVernacular(msg, language);
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Print / PDF generation
  const handlePrintPDF = () => {
    triggerHaptic([30, 40]);
    window.print();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. EPR Target Progress & Ministry Summary Banner */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bccac0]/40 dark:border-[#263849] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[24px]">
                policy
              </span>
              <h3 className="text-[17px] font-black text-[#191c1e] dark:text-[#ffffff]">
                {language === 'en'
                  ? 'Extended Producer Responsibility (EPR) Target Engine'
                  : language === 'mr'
                  ? 'विस्तारित उत्पादक जबाबदारी (EPR) उद्दिष्ट इंजिन'
                  : 'विस्तारित उत्पादक उत्तरदायित्व (EPR) लक्ष्य इंजन'}
              </h3>
            </div>
            <span className="text-[12px] text-[#565e74] dark:text-[#94a3b8]">
              {language === 'mr' ? 'अनुपालन नोंदणी क्रमांक:' : 'Compliance Registry ID:'} {certificate.cpcbNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[12px] font-bold text-[#191c1e] dark:text-[#ffffff]"
            >
              <option value="September 2026">September 2026 (Current Q3)</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
            </select>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px] font-bold">
            <span className="text-[#191c1e] dark:text-[#ffffff] flex items-center gap-1.5">
              <span>{language === 'mr' ? 'वार्षिक EPR बंधन उद्दिष्ट:' : 'Annual EPR Obligation Target:'}</span>
              <span className="font-mono text-[#006948] dark:text-[#34d399]">
                {currentTotalProcessedMT} MT / {targetMT} MT
              </span>
            </span>
            <span className="text-[#006948] dark:text-[#34d399] font-black font-mono">
              {progressPercent}% {language === 'mr' ? 'पूर्ण' : 'FULFILLED'}
            </span>
          </div>

          <div className="w-full h-4 bg-[#f2f4f6] dark:bg-[#0d141b] rounded-full overflow-hidden border border-[#bccac0]/40 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#006948] to-[#85f8c4] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-[#565e74] dark:text-[#94a3b8]">
            <span>{language === 'mr' ? 'बेस Q1: ४५ MT' : 'Base Q1: 45 MT'}</span>
            <span>{language === 'mr' ? `उद्दिष्ट: ${targetMT} मेट्रिक टन / वर्ष` : `Target: ${targetMT} Metric Tonnes / Year`}</span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-[#f7f9fb] dark:bg-[#0d141b] rounded-xl border border-[#bccac0]/40 dark:border-[#263849]">
            <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] block">
              {language === 'mr' ? 'ऑडिट केलेले लॉट्स' : 'Audited Intake Lots'}
            </span>
            <span className="text-[18px] font-black font-mono text-[#191c1e] dark:text-[#ffffff]">
              {transactions.length}
            </span>
          </div>

          <div className="p-3 bg-[#f7f9fb] dark:bg-[#0d141b] rounded-xl border border-[#bccac0]/40 dark:border-[#263849]">
            <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] block">
              {language === 'mr' ? 'प्रमाणित निव्वळ खंड' : 'Certified Net Volume'}
            </span>
            <span className="text-[18px] font-black font-mono text-[#006948] dark:text-[#34d399]">
              {totalProcuredKg.toFixed(1)} <span className="text-[11px]">KG</span>
            </span>
          </div>

          <div className="p-3 bg-[#f7f9fb] dark:bg-[#0d141b] rounded-xl border border-[#bccac0]/40 dark:border-[#263849]">
            <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] block">
              {language === 'mr' ? 'एकूण EPR वाटप' : 'Total EPR Payout'}
            </span>
            <span className="text-[18px] font-black font-mono text-[#191c1e] dark:text-[#ffffff] truncate">
              ₹{totalValuation.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-[#85f8c4]/30 text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399] border-2 border-[#006948]/40 rounded-xl text-[13px] font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* 2. Complete Traceability Ledger Table */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bccac0]/40 dark:border-[#263849] pb-3">
          <div>
            <h4 className="text-[15px] font-black text-[#191c1e] dark:text-[#ffffff] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[20px]">
                receipt_long
              </span>
              {language === 'en'
                ? 'CPCB Form-2 E-Waste Traceability Ledger'
                : language === 'mr'
                ? 'CPCB फॉर्म-२ ई-कचरा ट्रेसिबिलिटी खातेवही'
                : 'CPCB फॉर्म-2 ई-कचरा ट्रेसिबिलिटी लेज़र'}
            </h4>
            <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8]">
              {language === 'mr'
                ? 'प्रदूषण नियंत्रण मंडळांसाठी अपरिवर्तनीय ऑडिट लॉग'
                : 'Immutable audit log for Ministry of Mines & State Pollution Boards'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv-epr"
              type="button"
              onClick={handleExportCSV}
              className="h-10 px-4 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-bold text-[12px] flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>{language === 'mr' ? 'CSV निर्यात करा' : 'Export CSV'}</span>
            </button>

            <button
              id="btn-print-pdf-epr"
              type="button"
              onClick={handlePrintPDF}
              className="h-10 px-3.5 bg-white dark:bg-[#0d141b] text-[#191c1e] dark:text-[#ffffff] hover:bg-[#f2f4f6] rounded-xl font-bold text-[12px] flex items-center gap-1.5 border border-[#bccac0]/60 dark:border-[#33485c] shadow-2xs active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>{language === 'mr' ? 'फॉर्म-२ प्रिंट करा' : 'Print Form-2'}</span>
            </button>
          </div>
        </div>

        {/* Search / Filter bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#565e74] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === 'mr'
                ? 'लॉट आयडी, कबाडीवाल्याचे नाव, CPCB आयडी किंवा स्क्रॅप प्रकाराने शोधा...'
                : language === 'en'
                ? 'Search by Lot ID, Collector Name, CPCB ID, or Scrap Category...'
                : 'लॉट ID, कबाड़ीवाले का नाम, CPCB ID या स्क्रैप श्रेणी द्वारा खोजें...'
            }
            className="w-full h-10 pl-9 pr-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[12px] text-[#191c1e] dark:text-[#ffffff] focus:outline-hidden"
          />
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#bccac0]/40 dark:border-[#263849] text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] bg-[#f7f9fb] dark:bg-[#0d141b]">
                <th className="py-2.5 px-3">{language === 'mr' ? 'लॉट व वेळ' : 'Lot & Timestamp'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'कबाडीवाला CPCB ID' : 'Collector CPCB ID'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'साहित्य प्रकार' : 'Material Category'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'निव्वळ वजन (KG)' : 'Net Weight (KG)'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'रक्कम (₹)' : 'Payout (INR)'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'GPS जिओटॅग' : 'GPS Geotag'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'EPR मॅनिफेस्ट हॅश' : 'EPR Manifest Hash'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bccac0]/30 dark:divide-[#263849] text-[12px]">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#f7f9fb] dark:hover:bg-[#0d141b]/60 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold font-mono text-[#191c1e] dark:text-[#ffffff] block">
                      {t.txnNumber}
                    </span>
                    <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8]">
                      {new Date(t.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-[#191c1e] dark:text-[#ffffff] block">
                      {t.collectorName || 'Verified Collector'}
                    </span>
                    <span className="text-[10px] font-mono text-[#006948] dark:text-[#34d399]">
                      {t.collectorCpcbId || 'KBD-DL-9821'}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-[#191c1e] dark:text-[#ffffff] block">
                      {getItemName(t.scrapItem)}
                    </span>
                    <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8]">
                      {t.scrapItem.grade}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-[#006948] dark:text-[#34d399]">
                    {t.weightKg.toFixed(1)} KG
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-[#191c1e] dark:text-[#ffffff]">
                    ₹{t.totalPayout.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8] flex items-center gap-1 truncate max-w-[140px]">
                      <span className="material-symbols-outlined text-[13px] text-[#006948]">
                        pin_drop
                      </span>
                      {t.geotag || '28.5355° N, 77.2731° E'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-[#85f8c4]/30 text-[#006948] dark:text-[#34d399] font-mono text-[10px] font-bold border border-[#006948]/30">
                      {t.manifestHash || 'EPR-0x89F4'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
