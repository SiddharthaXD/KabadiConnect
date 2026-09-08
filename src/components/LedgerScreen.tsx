import React, { useState } from 'react';
import { Transaction, Language } from '../types';
import { speakVernacular, triggerHaptic } from '../utils/speech';

interface LedgerScreenProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  language: Language;
  onSync: () => void;
  isSyncing: boolean;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  transactions,
  onSelectTransaction,
  language,
  onSync,
  isSyncing,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const totalEarnings = transactions.reduce((acc, t) => acc + t.totalPayout, 0);
  const totalWeight = transactions.reduce((acc, t) => acc + t.weightKg, 0);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.scrapItem.id.includes(filter);
  });

  const handleHearSummary = () => {
    triggerHaptic(20);
    const earnStr = totalEarnings.toLocaleString('en-IN');
    const wtStr = totalWeight.toFixed(1);
    
    speakVernacular(
      language === 'mr'
        ? `खाते विवरण: तुम्ही एकूण ₹${earnStr} कमावले आहेत आणि ${wtStr} किलो ई-कचरा विकला आहे.`
        : language === 'en'
        ? `Ledger Summary: You have earned a total of ₹${earnStr} and sold ${wtStr} kg of scrap.`
        : `खाता विवरण: आपने कुल ₹${earnStr} कमाए हैं और ${wtStr} किलो स्क्रैप बेचा है।`,
      language
    );
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-4">
      {/* Top Banner Stats */}
      <div className="bg-[#006948] text-white rounded-2xl p-4 shadow-md border-2 border-[#002114]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#85f8c4]">
              receipt_long
            </span>
            <span className="text-[17px] font-bold">{language === 'en' ? 'Scrap Ledger Register' : language === 'mr' ? 'कबाड खाते रजिस्टर' : 'कबाड़ खाता रजिस्टर'}</span>
          </div>
          <button
            onClick={handleHearSummary}
            className="px-2.5 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[12px] font-bold flex items-center gap-1 active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{language === 'en' ? 'Listen' : language === 'mr' ? 'ऐका' : 'सुनो'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/20">
          <div>
            <span className="text-[11px] text-white/80 uppercase font-semibold">
              {language === 'en' ? 'Total Earnings' : language === 'mr' ? 'एकूण जमा रक्कम (Earnings)' : 'कुल जमा रकम (Earnings)'}
            </span>
            <div className="text-[26px] font-bold font-['Space_Grotesk'] text-[#85f8c4] leading-tight">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-white/80 uppercase font-semibold">
              {language === 'en' ? 'Total Scrap Weight' : language === 'mr' ? 'एकूण स्क्रॅप वजन (Weight)' : 'कुल स्क्रैप वजन (Weight)'}
            </span>
            <div className="text-[26px] font-bold font-['Space_Grotesk'] leading-tight">
              {totalWeight.toFixed(1)} <span className="text-[16px]">KG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: language === 'en' ? 'All' : language === 'mr' ? 'सर्व (All)' : 'सभी (All)' },
          { id: 'pcb', label: language === 'en' ? 'PCB Motherboard' : language === 'mr' ? 'PCB मदरबोर्ड' : 'PCB मदरबोर्ड' },
          { id: 'copper', label: language === 'en' ? 'Copper' : language === 'mr' ? 'तांबे (Copper)' : 'तांबा (Copper)' },
          { id: 'battery', label: language === 'en' ? 'Battery (Li-ion)' : language === 'mr' ? 'बॅटरी (Li-ion)' : 'बैटरी (Li-ion)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic(15);
              setFilter(tab.id);
            }}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all border ${
              filter === tab.id
                ? 'bg-[#006948] text-white border-[#002114] shadow-sm'
                : 'bg-white text-[#565e74] hover:bg-[#eceef0] border-[#bccac0]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sync Status strip */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#eceef0] border border-[#bccac0]/40">
        <span className="text-[12px] font-medium text-[#3d4a42]">
          {transactions.filter((t) => !t.isSynced).length} {language === 'en' ? 'Unsynced Records' : language === 'mr' ? 'अनसिंक्ड रेकॉर्ड' : 'अनसिंक्ड रिकॉर्ड'}
        </span>
        <button
          onClick={onSync}
          className="text-[12px] font-bold text-[#006948] flex items-center gap-1 hover:underline"
        >
          <span className={`material-symbols-outlined text-[15px] ${isSyncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isSyncing ? (language === 'en' ? 'Syncing...' : language === 'mr' ? 'सिंक होत आहे...' : 'सिंक हो रहा...') : (language === 'en' ? 'Sync Now' : language === 'mr' ? 'आता सिंक करा' : 'अब सिंक करें')}</span>
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-2.5">
        {filteredTransactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => {
              triggerHaptic(20);
              onSelectTransaction(tx);
            }}
            className="w-full bg-white rounded-xl p-3 shadow-sm border-2 border-[#191c1e] flex items-center justify-between active:scale-98 transition-all cursor-pointer hover:border-[#006948]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#f2f4f6] flex items-center justify-center shrink-0 border border-[#bccac0]/30">
                <span className="material-symbols-outlined text-[24px] text-[#006948]">
                  {tx.scrapItem.isHazardous ? 'warning' : 'memory'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-[#191c1e] truncate">
                    {language === 'mr' ? (tx.scrapItem.nameMr || tx.scrapItem.nameHi) : language === 'en' ? tx.scrapItem.nameEn : tx.scrapItem.nameHi}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      tx.isSynced ? 'bg-[#85f8c4] text-[#002114]' : 'bg-[#ffdcc3] text-[#8d4b00]'
                    }`}
                  >
                    {tx.isSynced ? (language === 'en' ? 'Synced' : language === 'mr' ? 'सिंक' : 'सिंक') : (language === 'en' ? 'Local' : language === 'mr' ? 'लोकल' : 'लोकल')}
                  </span>
                </div>
                <span className="text-[11px] text-[#565e74] truncate">
                  {tx.txnNumber} • {language === 'mr' ? (tx.recycler.nameMr || tx.recycler.nameHi) : language === 'en' ? tx.recycler.nameEn : tx.recycler.nameHi}
                </span>
                <span className="text-[11px] text-[#006948] font-bold">
                  {tx.weightKg.toFixed(1)} KG @ ₹{tx.ratePerKg}/KG
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="text-[20px] font-bold font-['Space_Grotesk'] text-[#006948]">
                ₹{tx.totalPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-[#565e74] flex items-center gap-0.5">
                <span>{language === 'en' ? 'View Receipt' : language === 'mr' ? 'पावती पहा' : 'रसीद देखें'}</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-[#565e74]">
            <span className="material-symbols-outlined text-[36px] text-[#bccac0]">
              inbox
            </span>
            <p className="text-[14px] font-medium mt-1">{language === 'en' ? 'No transactions found' : language === 'mr' ? 'कोणतेही व्यवहार आढळले नाहीत' : 'कोई ट्रांजैक्शन नहीं मिला'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
