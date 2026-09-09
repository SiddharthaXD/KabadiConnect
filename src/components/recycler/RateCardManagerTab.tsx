import React, { useState } from 'react';
import { Language, ScrapItem, BulkRateTier } from '../../types';
import { SCRAP_ITEMS } from '../../data/scrapData';
import { speakVernacular, triggerHaptic } from '../../utils/speech';

interface RateCardManagerTabProps {
  language: Language;
  scrapRates: Record<string, number>;
  onUpdateRate: (scrapId: string, newRate: number) => void;
  bulkTiers: BulkRateTier[];
  onUpdateBulkTiers: (tiers: BulkRateTier[]) => void;
}

export const RateCardManagerTab: React.FC<RateCardManagerTabProps> = ({
  language,
  scrapRates,
  onUpdateRate,
  bulkTiers,
  onUpdateBulkTiers,
}) => {
  const [activeTiers, setActiveTiers] = useState<BulkRateTier[]>(bulkTiers);
  const [publishedNotice, setPublishedNotice] = useState<boolean>(false);
  const [lastPublishedTime, setLastPublishedTime] = useState<string>('Today at 08:30 AM');

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const handleRateInputChange = (scrapId: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onUpdateRate(scrapId, num);
    }
  };

  const handleAdjustRate = (scrap: ScrapItem, delta: number) => {
    triggerHaptic(15);
    const current = scrapRates[scrap.id] || scrap.baseRate;
    const next = Math.max(10, current + delta);
    onUpdateRate(scrap.id, next);
  };

  const handleTierChange = (scrapId: string, minWeightKg: number, premiumBonusPerKg: number) => {
    triggerHaptic(15);
    const updated = activeTiers.filter((t) => t.scrapId !== scrapId);
    updated.push({ scrapId, minWeightKg, premiumBonusPerKg });
    setActiveTiers(updated);
    onUpdateBulkTiers(updated);
  };

  const handlePublishRatesToNetwork = () => {
    triggerHaptic([30, 40, 50]);
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastPublishedTime(`Today at ${formatted}`);
    setPublishedNotice(true);
    setTimeout(() => setPublishedNotice(false), 4000);

    const speech =
      language === 'en'
        ? `Rate card published live across the Kabadiwala network at ${formatted}.`
        : language === 'mr'
        ? `नवीन खरेदी दर कबाडीवाला नेटवर्कवर लाइव्ह प्रकाशित झाले.`
        : `नई खरीद दरें कबाड़ीवाला नेटवर्क पर लाइव प्रकाशित कर दी गई हैं।`;

    speakVernacular(speech, language);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header with Broadcast Publish Action */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[24px]">
              currency_rupee
            </span>
            <h3 className="text-[17px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {language === 'en'
                ? 'Dynamic Rate Card & Bulk Premiums'
                : language === 'mr'
                ? 'दर सूची आणि बल्क प्रीमियम व्यवस्थापक'
                : 'दैनिक खरीद दर एवं बल्क प्रीमियम प्रबंधक'}
            </h3>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-[#94a3b8] mt-0.5">
            {language === 'en'
              ? 'These live rates feed directly into collector apps and AI valuation algorithms.'
              : language === 'mr'
              ? 'हे थेट दर कबाडीवाला ॲप आणि AI मूल्य निर्धारण प्रणालीमध्ये लगेच परावर्तित होतात.'
              : 'ये दरें कबाड़ीवाला ऐप व AI गणना इंजन में वास्तविक समय में दिखाई देती हैं।'}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <button
            id="btn-publish-rates-network"
            type="button"
            onClick={handlePublishRatesToNetwork}
            className="h-11 px-5 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_2px_0px_#191c1e] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cell_tower</span>
            <span>
              {language === 'en'
                ? 'Publish Rates to Network'
                : language === 'mr'
                ? 'नेटवर्कवर थेट दर प्रकाशित करा'
                : 'नेटवर्क पर लाइव रेट्स जारी करें'}
            </span>
          </button>
          <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8]">
            {language === 'en' ? 'Last Broadcast:' : language === 'mr' ? 'शेवटचे प्रसारण:' : 'अंतिम प्रसारण:'} {lastPublishedTime}
          </span>
        </div>
      </div>

      {publishedNotice && (
        <div className="p-3 bg-[#85f8c4]/30 text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399] border-2 border-[#006948]/40 rounded-xl text-[13px] font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>
            {language === 'en'
              ? 'Rates synchronized! All nearby collectors received your new rate card.'
              : language === 'mr'
              ? 'दर अद्ययावत झाले! सर्व जवळच्या कबाडीवाल्यांना नवीन दर सूची मिळाली आहे.'
              : 'दरें प्रसारित हुईं! सभी नजदीकी कबाड़ीवालों के ऐप पर नई दरें लागू हो गई हैं।'}
          </span>
        </div>
      )}

      {/* Daily Price Table */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#bccac0]/40 dark:border-[#263849] pb-3">
          <h4 className="text-[15px] font-black text-[#191c1e] dark:text-[#ffffff] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[20px]">
              table_chart
            </span>
            {language === 'en'
              ? 'Daily Price Updater Table'
              : language === 'mr'
              ? 'दैनंदिन खरेदी दर तक्ता'
              : 'दैनिक खरीद मूल्य सारणी'}
          </h4>
          <span className="text-[11px] font-bold text-[#565e74] dark:text-[#94a3b8]">
            {language === 'mr' ? 'एकक: रुपये प्रति किलो (₹/KG)' : 'Unit: INR per KG (₹/KG)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bccac0]/40 dark:border-[#263849] text-[11px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8]">
                <th className="py-2.5 px-3">
                  {language === 'en' ? 'Material Category' : language === 'mr' ? 'साहित्य प्रकार' : 'सामग्री श्रेणी'}
                </th>
                <th className="py-2.5 px-3 text-center">
                  {language === 'en' ? 'Govt Benchmark' : language === 'mr' ? 'सरकारी बेंचमार्क' : 'सरकारी बेंचमार्क'}
                </th>
                <th className="py-2.5 px-3 text-center">
                  {language === 'en' ? 'Your Buying Rate' : language === 'mr' ? 'तुमचा खरेदी दर' : 'आपकी खरीद दर'}
                </th>
                <th className="py-2.5 px-3 text-center">
                  {language === 'en' ? 'Bulk Premium (>25kg)' : language === 'mr' ? 'बल्क प्रीमियम (>२५ किलो)' : 'बल्क प्रीमियम (>25kg)'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {language === 'en' ? 'Status' : language === 'mr' ? 'स्थिती' : 'स्थिति'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bccac0]/30 dark:divide-[#263849]">
              {SCRAP_ITEMS.map((item) => {
                const currentRate = scrapRates[item.id] || item.baseRate;
                const tier = activeTiers.find((t) => t.scrapId === item.id) || {
                  scrapId: item.id,
                  minWeightKg: 25,
                  premiumBonusPerKg: item.id === 'copper-wire' ? 25 : 15,
                };

                const spread = currentRate - item.baseRate;

                return (
                  <tr key={item.id} className="hover:bg-[#f7f9fb] dark:hover:bg-[#0d141b]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.imageUrl}
                          alt={item.nameEn}
                          className="w-10 h-10 rounded-lg object-cover border border-[#bccac0]/40 shrink-0"
                        />
                        <div>
                          <span className="text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] block leading-tight">
                            {getItemName(item)}
                          </span>
                          <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8]">
                            {item.grade} • {item.isHazardous ? '⚠️ Hazardous CPCB Class' : 'Non-Hazardous'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[13px] font-bold text-[#565e74] dark:text-[#94a3b8] font-mono">
                        ₹{item.baseRate}/kg
                      </span>
                      <span className="block text-[10px] text-[#565e74]">CPCB Index</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-[#f2f4f6] dark:bg-[#182430] p-1 rounded-xl border border-[#bccac0]/40 dark:border-[#33485c]">
                        <button
                          type="button"
                          onClick={() => handleAdjustRate(item, -5)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#0d141b] text-[#191c1e] dark:text-[#ffffff] font-bold flex items-center justify-center border border-[#bccac0]/50 shadow-2xs active:scale-95"
                        >
                          -
                        </button>
                        <div className="flex items-center px-1">
                          <span className="text-[12px] font-bold text-[#565e74] dark:text-[#94a3b8] mr-0.5">₹</span>
                          <input
                            type="number"
                            value={currentRate}
                            onChange={(e) => handleRateInputChange(item.id, e.target.value)}
                            className="w-14 text-center font-black text-[14px] text-[#006948] dark:text-[#34d399] font-mono bg-transparent focus:outline-hidden"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdjustRate(item, 5)}
                          className="w-7 h-7 rounded-lg bg-[#006948] text-white font-bold flex items-center justify-center shadow-2xs active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-[11px] font-bold text-[#006948] dark:text-[#34d399] bg-[#85f8c4]/30 dark:bg-[#062b1e] px-2 py-1 rounded-lg border border-[#006948]/30">
                          +₹{tier.premiumBonusPerKg}/kg
                        </span>
                        <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8]">
                          (if &gt;{tier.minWeightKg}kg)
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          spread >= 0
                            ? 'bg-[#85f8c4]/30 text-[#006948] dark:bg-[#062b1e] dark:text-[#34d399]'
                            : 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-[#3b1010] dark:text-[#f87171]'
                        }`}
                      >
                        {spread >= 0 ? `+₹${spread} spread` : `-₹${Math.abs(spread)} spread`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Incentive Rule Card */}
      <div className="bg-[#ffdcc3] dark:bg-[#3d2306] rounded-2xl p-4 border-2 border-[#8d4b00]/30 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#8d4b00] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">auto_graph</span>
        </div>
        <div>
          <h4 className="text-[14px] font-black text-[#2f1500] dark:text-[#ffedd5]">
            {language === 'en'
              ? 'Bulk Sourcing Incentive Rule'
              : 'थोक खरीद प्रोत्साहन नियम'}
          </h4>
          <p className="text-[12px] text-[#4a2800] dark:text-[#cbd5e1] mt-0.5">
            {language === 'en'
              ? 'Offering a +₹15 to +₹25 per KG bulk premium attracts high-volume aggregated lots from tier-1 kabadiwalas, increasing your monthly EPR quota fulfillment speed by 3.4x.'
              : 'बल्क प्रीमियम पेश करने से बड़े कबाड़ी सीधे आपकी इकाई में माल लाते हैं, जिससे आपकी EPR लक्ष्य पूर्ति दर तेजी से बढ़ती है।'}
          </p>
        </div>
      </div>
    </div>
  );
};
