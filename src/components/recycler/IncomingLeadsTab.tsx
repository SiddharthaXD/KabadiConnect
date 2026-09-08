import React, { useState } from 'react';
import { Language, IncomingLead, ScrapItem } from '../../types';
import { speakVernacular, triggerHaptic } from '../../utils/speech';

interface IncomingLeadsTabProps {
  language: Language;
  leads: IncomingLead[];
  onUpdateLeadStatus: (
    leadId: string,
    status: IncomingLead['status'],
    details?: { counterRate?: number; counterAmount?: number; pickupEtaMins?: number }
  ) => void;
  onInitiateIntakeFromLead: (lead: IncomingLead) => void;
}

export const IncomingLeadsTab: React.FC<IncomingLeadsTabProps> = ({
  language,
  leads,
  onUpdateLeadStatus,
  onInitiateIntakeFromLead,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'countered'>('all');
  const [counterModalLead, setCounterModalLead] = useState<IncomingLead | null>(null);
  const [counterRateInput, setCounterRateInput] = useState<number>(300);
  const [counterReason, setCounterReason] = useState<string>('Visual AI detects mixed lower-grade capacitors.');
  const [photoInspectLead, setPhotoInspectLead] = useState<IncomingLead | null>(null);

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'pending') return lead.status === 'pending';
    if (filter === 'accepted')
      return lead.status === 'accepted_pickup' || lead.status === 'accepted_dropoff';
    if (filter === 'countered') return lead.status === 'countered';
    return true;
  });

  const handleAcceptDropoff = (lead: IncomingLead) => {
    triggerHaptic(20);
    onUpdateLeadStatus(lead.id, 'accepted_dropoff');
    const msg =
      language === 'en'
        ? `Lot ${lead.lotNumber} accepted for facility drop-off.`
        : language === 'mr'
        ? `लॉट ${lead.lotNumber} केंद्रावर ड्रॉप-ऑफसाठी स्वीकारला गेला.`
        : `लॉट ${lead.lotNumber} को सुविधा में ड्रॉप-ऑफ हेतु स्वीकार किया गया।`;
    speakVernacular(msg, language);
  };

  const handleSchedulePickup = (lead: IncomingLead) => {
    triggerHaptic(25);
    onUpdateLeadStatus(lead.id, 'accepted_pickup', { pickupEtaMins: 20 });
    const msg =
      language === 'en'
        ? `Pickup van dispatched for ${lead.collectorName}. ETA 20 mins.`
        : language === 'mr'
        ? `${lead.collectorName} साठी पिकअप व्हॅन रवाना. अंदाजे वेळ २० मिनिटे.`
        : `${lead.collectorName} के लिए पिकअप वैन रवाना। आगमन समय 20 मिनट।`;
    speakVernacular(msg, language);
  };

  const handleOpenCounterModal = (lead: IncomingLead) => {
    triggerHaptic(15);
    setCounterModalLead(lead);
    setCounterRateInput(lead.offeredRate > 20 ? lead.offeredRate - 25 : lead.offeredRate);
  };

  const handleSubmitCounterOffer = () => {
    if (!counterModalLead) return;
    triggerHaptic(30);
    const newAmount = Math.round(counterRateInput * counterModalLead.estimatedWeightKg);
    onUpdateLeadStatus(counterModalLead.id, 'countered', {
      counterRate: counterRateInput,
      counterAmount: newAmount,
    });
    const msg =
      language === 'en'
        ? `Counter offer of ₹${counterRateInput}/kg sent to ${counterModalLead.collectorName}.`
        : language === 'mr'
        ? `${counterModalLead.collectorName} यांना ₹${counterRateInput}/kg चा काउंटर ऑफर पाठवला.`
        : `${counterModalLead.collectorName} को ₹${counterRateInput}/kg का काउंटर-ऑफ़र भेजा गया।`;
    speakVernacular(msg, language);
    setCounterModalLead(null);
  };

  const handleRejectLead = (lead: IncomingLead) => {
    triggerHaptic(20);
    onUpdateLeadStatus(lead.id, 'rejected');
    const msg =
      language === 'en'
        ? `Lot ${lead.lotNumber} declined.`
        : language === 'mr'
        ? `लॉट ${lead.lotNumber} नाकारला गेला.`
        : `लॉट ${lead.lotNumber} अस्वीकार किया गया।`;
    speakVernacular(msg, language);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner & Filter Controls */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[24px]">
              hub
            </span>
            <h3 className="text-[17px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {language === 'en'
                ? 'Incoming Leads & AI Matchmaking Kanban'
                : language === 'mr'
                ? 'येणारे लॉट्स आणि AI मॅचमेकिंग डॅशबोर्ड'
                : 'इनकमिंग लॉट एवं AI मैचमेकिंग डैशबोर्ड'}
            </h3>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-[#94a3b8] mt-0.5">
            {language === 'en'
              ? 'Real-time e-waste lots posted by verified kabadiwalas in your licensed radius.'
              : language === 'mr'
              ? 'तुमच्या परवाना कक्षेत सत्यापित कबाडीवाल्यांनी पोस्ट केलेले रिअल-टाइम लॉट्स.'
              : 'आपके निर्धारित दायरे में सत्यापित कबाड़ीवालों द्वारा पोस्ट किए गए वास्तविक समय के लॉट।'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#f2f4f6] dark:bg-[#182430] p-1 rounded-xl border border-[#bccac0]/40 dark:border-[#33485c] self-start sm:self-auto">
          {(['all', 'pending', 'accepted', 'countered'] as const).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setFilter(tabKey);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                filter === tabKey
                  ? 'bg-[#006948] text-white shadow-xs'
                  : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e]'
              }`}
            >
              {tabKey === 'all'
                ? language === 'en'
                  ? 'All Leads'
                  : language === 'mr'
                  ? 'सर्व लॉट्स'
                  : 'सभी'
                : tabKey === 'pending'
                ? language === 'en'
                  ? 'Pending Review'
                  : language === 'mr'
                  ? 'प्रलंबित'
                  : 'प्रतीक्षारत'
                : tabKey === 'accepted'
                ? language === 'en'
                  ? 'Active Pickups'
                  : language === 'mr'
                  ? 'स्वीकृत'
                  : 'स्वीकृत'
                : language === 'en'
                ? 'Countered'
                : language === 'mr'
                ? 'काउंटर'
                : 'काउंटर'}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeads.map((lead) => {
          const isPending = lead.status === 'pending';
          const isAcceptedPickup = lead.status === 'accepted_pickup';
          const isAcceptedDropoff = lead.status === 'accepted_dropoff';
          const isCountered = lead.status === 'countered';

          return (
            <div
              key={lead.id}
              className={`bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 flex flex-col justify-between gap-4 transition-all ${
                isPending
                  ? 'border-[#191c1e]'
                  : isAcceptedPickup || isAcceptedDropoff
                  ? 'border-[#006948] bg-[#85f8c4]/5 dark:bg-[#062b1e]/30'
                  : 'border-[#bccac0]/50 dark:border-[#263849]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f2f4f6] dark:bg-[#182430] text-[#191c1e] dark:text-[#ffffff] font-mono text-[11px] font-bold border border-[#bccac0]/40">
                      {lead.lotNumber}
                    </span>
                    <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8]">
                      {lead.createdAt}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      isPending
                        ? 'bg-[#ffdcc3] text-[#6e3900] dark:bg-[#3d2306] dark:text-[#fbbf24]'
                        : isAcceptedPickup
                        ? 'bg-[#85f8c4] text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399]'
                        : isAcceptedDropoff
                        ? 'bg-[#dae2fd] text-[#131b2e] dark:bg-[#254168] dark:text-[#93c5fd]'
                        : isCountered
                        ? 'bg-[#ffdad6] text-[#ba1a1a] dark:bg-[#3b1010] dark:text-[#f87171]'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isPending
                      ? '● Pending Review'
                      : isAcceptedPickup
                      ? '⚡ Van Dispatched'
                      : isAcceptedDropoff
                      ? '🏢 Drop-off Scheduled'
                      : isCountered
                      ? '💬 Counter Sent'
                      : lead.status}
                  </span>
                </div>

                {/* Main Lot Summary */}
                <div className="flex items-center gap-3.5 mt-3.5">
                  <div
                    className="relative cursor-pointer group shrink-0"
                    onClick={() => setPhotoInspectLead(lead)}
                  >
                    <img
                      src={lead.photoUrl}
                      alt={lead.scrapItem.nameEn}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#191c1e] shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="text-[15px] font-black text-[#191c1e] dark:text-[#ffffff] leading-tight truncate">
                      {getItemName(lead.scrapItem)}
                    </h4>
                    <span className="text-[12px] text-[#565e74] dark:text-[#94a3b8] mt-0.5">
                      {lead.estimatedWeightKg} KG • Est. ₹{lead.offeredRate}/kg
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#85f8c4]/30 text-[#006948] dark:text-[#34d399] font-bold text-[10px] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        AI: {lead.aiConfidence}% Match
                      </span>
                      <span className="text-[11px] font-bold text-[#565e74] dark:text-[#94a3b8]">
                        📍 {lead.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#565e74] dark:text-[#94a3b8] block">
                      Valuation
                    </span>
                    <span className="text-[18px] font-black font-mono text-[#006948] dark:text-[#34d399]">
                      ₹{lead.totalOfferedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Collector Contact & Location */}
                <div className="mt-3 p-2.5 bg-[#f7f9fb] dark:bg-[#0d141b] rounded-xl border border-[#bccac0]/40 dark:border-[#263849] flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                      {lead.collectorName.slice(0, 2)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[#191c1e] dark:text-[#ffffff] truncate">
                        {lead.collectorName}
                      </span>
                      <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8] truncate">
                        {lead.collectorCpcbId} • {lead.collectorZone}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${lead.collectorPhone}`}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#182430] text-[#006948] dark:text-[#34d399] flex items-center justify-center border border-[#bccac0]/40 shadow-2xs hover:bg-[#85f8c4]/20 shrink-0"
                    title="Call Collector"
                  >
                    <span className="material-symbols-outlined text-[16px]">phone</span>
                  </a>
                </div>

                {lead.notes && (
                  <p className="text-[11px] text-[#565e74] dark:text-[#94a3b8] mt-2 italic px-1">
                    "{lead.notes}"
                  </p>
                )}

                {isCountered && (
                  <div className="mt-2 p-2 bg-[#ffdcc3] dark:bg-[#3d2306] rounded-lg text-[11px] font-bold text-[#2f1500] dark:text-[#ffedd5] flex items-center justify-between">
                    <span>Counter Proposed: ₹{lead.counterRate}/kg</span>
                    <span>Total: ₹{lead.counterAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#bccac0]/40 dark:border-[#263849] flex flex-wrap items-center gap-2">
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSchedulePickup(lead)}
                      className="flex-1 h-10 bg-[#006948] hover:bg-[#005238] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                      <span>{language === 'en' ? 'Dispatch Van' : language === 'mr' ? 'पिकअप पाठवा' : 'वैन भेजें'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAcceptDropoff(lead)}
                      className="h-10 px-3 bg-[#f2f4f6] dark:bg-[#182430] text-[#191c1e] dark:text-[#ffffff] rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 border border-[#bccac0]/50 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">done</span>
                      <span>{language === 'en' ? 'Drop-off' : language === 'mr' ? 'ड्रॉप-ऑफ' : 'ड्रॉप-ऑफ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCounterModal(lead)}
                      className="h-10 px-3 bg-white dark:bg-[#0d141b] text-[#003b8e] dark:text-[#93c5fd] rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 border border-[#003b8e]/40 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      <span>{language === 'en' ? 'Counter' : language === 'mr' ? 'काउंटर' : 'काउंटर'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectLead(lead)}
                      className="w-10 h-10 bg-white dark:bg-[#0d141b] text-[#ba1a1a] rounded-xl font-bold flex items-center justify-center border border-[#ba1a1a]/30 active:scale-95 cursor-pointer"
                      title={language === 'en' ? 'Reject Lot' : language === 'mr' ? 'लॉट नाकारा' : 'लॉट अस्वीकार करें'}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </>
                )}

                {(isAcceptedPickup || isAcceptedDropoff || isCountered) && (
                  <button
                    type="button"
                    onClick={() => onInitiateIntakeFromLead(lead)}
                    className="w-full h-11 bg-[#006948] text-white rounded-xl font-black text-[13px] flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    <span>
                      {language === 'en'
                        ? 'Collector Arrived: Verify Weigh & Intake'
                        : language === 'mr'
                        ? 'कबाडीवाला आला: वजन व इनटेक तपासा'
                        : 'कबाड़ी पहुंच गया: तौल व सत्यापन शुरू करें'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Counter Offer Modal */}
      {counterModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#131c24] rounded-3xl p-5 max-w-md w-full border-2 border-[#191c1e] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#bccac0]/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003b8e] text-[22px]">swap_horiz</span>
                <h4 className="text-[16px] font-black text-[#191c1e] dark:text-[#ffffff]">
                  {language === 'en' ? 'Send Counter Offer' : 'काउंटर ऑफर भेजें'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCounterModalLead(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#f7f9fb] dark:bg-[#0d141b] rounded-xl border border-[#bccac0]/40">
              <img
                src={counterModalLead.photoUrl}
                alt={counterModalLead.scrapItem.nameEn}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff]">
                  {getItemName(counterModalLead.scrapItem)} ({counterModalLead.estimatedWeightKg} KG)
                </span>
                <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8]">
                  Collector Asked: ₹{counterModalLead.offeredRate}/kg (Total: ₹
                  {counterModalLead.totalOfferedAmount})
                </span>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#ffffff] block mb-1">
                {language === 'en' ? 'Proposed Buying Rate (₹/KG)' : 'प्रस्तावित खरीद दर (₹/किलो)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={counterRateInput}
                  onChange={(e) => setCounterRateInput(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[16px] font-black font-mono text-[#006948] dark:text-[#34d399] focus:outline-hidden"
                />
                <span className="text-[13px] font-bold text-[#565e74] whitespace-nowrap">
                  = ₹{Math.round(counterRateInput * counterModalLead.estimatedWeightKg).toLocaleString('en-IN')} Total
                </span>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#ffffff] block mb-1">
                {language === 'en' ? 'Reason / Photo Inspection Note' : 'कारण / फोटो निरीक्षण टिप्पणी'}
              </label>
              <textarea
                rows={2}
                value={counterReason}
                onChange={(e) => setCounterReason(e.target.value)}
                className="w-full p-2.5 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[12px] text-[#191c1e] dark:text-[#ffffff] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSubmitCounterOffer}
                className="flex-1 h-11 bg-[#003b8e] hover:bg-[#002b66] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{language === 'en' ? 'Submit Counter to Collector' : 'कबाड़ी को काउंटर भेजें'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCounterModalLead(null)}
                className="px-4 h-11 bg-gray-100 dark:bg-gray-800 text-[#565e74] rounded-xl font-bold text-[13px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Inspection Modal */}
      {photoInspectLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPhotoInspectLead(null)}
        >
          <div
            className="bg-white dark:bg-[#131c24] rounded-3xl p-4 max-w-lg w-full border-2 border-[#191c1e] shadow-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-black text-[#191c1e] dark:text-[#ffffff]">
                AI Scrap Inspection: {getItemName(photoInspectLead.scrapItem)}
              </span>
              <button
                type="button"
                onClick={() => setPhotoInspectLead(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={photoInspectLead.photoUrl}
              alt="Scrap item inspected"
              className="w-full h-64 object-cover rounded-2xl border border-[#191c1e]"
            />
            <div className="p-3 bg-[#f2f4f6] dark:bg-[#0d141b] rounded-xl flex items-center justify-between text-[12px]">
              <span className="font-bold text-[#006948] dark:text-[#34d399]">
                AI Verified Grade A: {photoInspectLead.aiConfidence}% confidence
              </span>
              <span className="text-[#565e74]">{photoInspectLead.lotNumber}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
