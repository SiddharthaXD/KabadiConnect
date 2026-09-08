import React, { useState } from 'react';
import { UserProfile, Language, Transaction, IncomingLead, EprCertificate, BulkRateTier } from '../types';
import { INITIAL_LEADS, DEFAULT_EPR_CERTIFICATE } from '../data/scrapData';
import { TRANSLATIONS } from '../data/translations';
import { speakVernacular, triggerHaptic } from '../utils/speech';
import { LanguageBar } from './LanguageBar';
import { ComplianceVerificationTab } from './recycler/ComplianceVerificationTab';
import { RateCardManagerTab } from './recycler/RateCardManagerTab';
import { IncomingLeadsTab } from './recycler/IncomingLeadsTab';
import { QrHandoverVerificationTab } from './recycler/QrHandoverVerificationTab';
import { EprComplianceReportsTab } from './recycler/EprComplianceReportsTab';

interface RecyclerDashboardProps {
  profile: UserProfile;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  transactions: Transaction[];
  onVerifyTransaction: (txnId: string) => void;
  onAddTransaction?: (txn: Transaction) => void;
  onSwitchRole: () => void;
  onUpdateRate: (scrapId: string, newRate: number) => void;
  isCenterOpen?: boolean;
  onToggleCenterStatus?: (isOpen: boolean) => void;
}

type RecyclerTab = 'leads' | 'intake' | 'rates' | 'epr' | 'compliance';

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({
  profile,
  language,
  onLanguageChange,
  transactions,
  onVerifyTransaction,
  onAddTransaction,
  onSwitchRole,
  onUpdateRate,
  isCenterOpen,
  onToggleCenterStatus,
}) => {
  const t = TRANSLATIONS[language];
  const rc = t.recycler;

  const [localIsOpen, setLocalIsOpen] = useState<boolean>(
    isCenterOpen !== undefined ? isCenterOpen : profile.isOpen !== false
  );

  // Keep synced if parent changes
  const centerIsOpen = isCenterOpen !== undefined ? isCenterOpen : localIsOpen;

  const handleToggleCenter = (nextState: boolean) => {
    triggerHaptic(35);
    setLocalIsOpen(nextState);
    if (onToggleCenterStatus) {
      onToggleCenterStatus(nextState);
    }
    const msg = nextState
      ? language === 'mr'
        ? 'रिसायकलिंग केंद्र आता सुरू केले आहे. कबाडीवाल्यांना केंद्र सुरू दिसेल.'
        : language === 'en'
        ? 'Recycling center is now OPEN. Collectors will see your center active.'
        : 'रीसाइक्लिंग केंद्र अब चालू कर दिया गया है। कबाड़ीवालों को केंद्र खुला दिखेगा।'
      : language === 'mr'
        ? 'रिसायकलिंग केंद्र आता बंद केले आहे. कबाडीवाल्यांना केंद्र बंद दिसेल.'
        : language === 'en'
        ? 'Recycling center is now CLOSED. Collectors will see your center marked closed.'
        : 'रीसाइक्लिंग केंद्र अब बंद कर दिया गया है। कबाड़ीवालों को केंद्र बंद दिखेगा।';
    speakVernacular(msg, language);
  };

  const [activeTab, setActiveTab] = useState<RecyclerTab>('leads');
  const [leads, setLeads] = useState<IncomingLead[]>(INITIAL_LEADS);
  const [certificate, setCertificate] = useState<EprCertificate>(DEFAULT_EPR_CERTIFICATE);
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(18);
  const [hasFleetPickup, setHasFleetPickup] = useState<boolean>(true);
  const [initialScannedToken, setInitialScannedToken] = useState<string>('');

  const [scrapRates, setScrapRates] = useState<Record<string, number>>({
    'pcb-motherboard': 300,
    'copper-wire': 550,
    'li-ion-battery': 130,
  });

  const [bulkTiers, setBulkTiers] = useState<BulkRateTier[]>([
    { scrapId: 'copper-wire', minWeightKg: 25, premiumBonusPerKg: 25 },
    { scrapId: 'pcb-motherboard', minWeightKg: 20, premiumBonusPerKg: 15 },
  ]);

  // Key stats
  const totalWeightProcured = transactions.reduce((acc, t) => acc + (t.weightKg || 0), 0);
  const totalPayoutDisbursed = transactions.reduce((acc, t) => acc + (t.totalPayout || 0), 0);
  const pendingLeadsCount = leads.filter((l) => l.status === 'pending').length;

  const getLocalizedBusinessName = () => {
    if (language === 'mr') return profile.businessNameMr || profile.businessName || 'ग्रीनटेक अधिकृत रिसायकलर्स प्रा. लि.';
    if (language === 'en') return profile.businessNameEn || 'GreenTech Authorized Recyclers Pvt Ltd';
    return profile.businessNameHi || profile.businessName || 'ग्रीनटेक ऑथराइज़्ड रीसाइक्लर्स प्रा. लि.';
  };

  const getLocalizedPersonName = () => {
    if (language === 'en') return profile.nameEn || 'Rajesh Kumar Sharma';
    if (language === 'mr') return profile.nameMr || profile.name || 'राजेश कुमार शर्मा';
    return profile.nameHi || profile.name || 'राजेश कुमार शर्मा';
  };

  const getLocalizedZone = () => {
    if (language === 'mr') return profile.zoneMr || profile.zone || 'ओखला फेज-२ रिसायकलिंग हब, नवी दिल्ली';
    if (language === 'en') return profile.zoneEn || 'Okhla Phase-2 Recycling Hub, New Delhi';
    return profile.zoneHi || profile.zone || 'ओखला फेज-2 रीसाइक्लिंग हब, दिल्ली';
  };

  const handleUpdateRate = (scrapId: string, newRate: number) => {
    setScrapRates((prev) => ({ ...prev, [scrapId]: newRate }));
    onUpdateRate(scrapId, newRate);
  };

  const handleUpdateLeadStatus = (
    leadId: string,
    status: IncomingLead['status'],
    details?: { counterRate?: number; counterAmount?: number; pickupEtaMins?: number }
  ) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, ...details } : l))
    );
  };

  const handleInitiateIntakeFromLead = (lead: IncomingLead) => {
    triggerHaptic(25);
    setInitialScannedToken(lead.lotNumber);
    setActiveTab('intake');
  };

  const handleCompleteVerifiedIntake = (completedTxn: Transaction) => {
    onVerifyTransaction(completedTxn.id);
    if (onAddTransaction) {
      onAddTransaction(completedTxn);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-3 sm:px-6 pt-24 pb-28 gap-5">
      {/* Multilingual Selector Bar */}
      {onLanguageChange && (
        <div className="w-full flex justify-end">
          <LanguageBar currentLanguage={language} onLanguageChange={onLanguageChange} />
        </div>
      )}

      {/* 1. Recycler Web Dashboard Header */}
      <div className="bg-gradient-to-r from-[#006948] via-[#00573c] to-[#003b29] text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-[#002114] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#006948] flex items-center justify-center font-black text-[22px] shadow-sm shrink-0">
              {profile.avatarInitials || 'GR'}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-black text-[10px] uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  {t.cpcbAuthorized}
                </span>
                <span className="text-[11px] text-white/80 font-mono">
                  {certificate.cpcbNumber}
                </span>
              </div>
              <h1 className="text-[20px] sm:text-[22px] font-black text-white leading-tight truncate mt-0.5">
                {getLocalizedBusinessName()}
              </h1>
              <span className="text-[12px] text-white/85 truncate">
                {getLocalizedPersonName()} • {getLocalizedZone()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-recycler-header-status-toggle"
              type="button"
              onClick={() => handleToggleCenter(!centerIsOpen)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                centerIsOpen
                  ? 'bg-[#85f8c4] text-[#002114] border-[#85f8c4] hover:bg-[#85f8c4]/90'
                  : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6] hover:bg-[#ffdad6]/90'
              }`}
              title={centerIsOpen ? rc.toggleCenterClose : rc.toggleCenterOpen}
            >
              <span className={`w-2 h-2 rounded-full ${centerIsOpen ? 'bg-[#006948] animate-ping' : 'bg-[#ba1a1a]'}`}></span>
              <span>{centerIsOpen ? (language === 'mr' ? 'सुरू (OPEN)' : language === 'en' ? 'OPEN' : 'खुला है (OPEN)') : (language === 'mr' ? 'बंद (CLOSED)' : language === 'en' ? 'CLOSED' : 'बंद है (CLOSED)')}</span>
            </button>

            <button
              onClick={onSwitchRole}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold flex items-center gap-1 active:scale-95 transition-all border border-white/30 cursor-pointer"
              title="Switch role"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>{t.switchRoleBtn}</span>
            </button>
          </div>
        </div>

        {/* Live Facility KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/20">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-white/80 block">
              {rc.totalProcuredTitle}
            </span>
            <span className="text-[18px] font-black font-mono text-white">
              {totalWeightProcured.toFixed(1)} <span className="text-[12px]">KG</span>
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-white/80 block">
              {rc.totalDisbursedTitle}
            </span>
            <span className="text-[18px] font-black font-mono text-white truncate block">
              ₹{totalPayoutDisbursed.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-white/80 block">
              {language === 'mr' ? 'EPR लक्ष्य प्रगती' : language === 'en' ? 'EPR Target Progress' : 'EPR लक्ष्य प्रगति'}
            </span>
            <span className="text-[18px] font-black font-mono text-[#85f8c4]">
              {((certificate.currentProcessedMT + totalWeightProcured / 1000)).toFixed(1)} / {certificate.authorizedCapacityMT} MT
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-white/80 block">
              {language === 'mr' ? 'सक्रिय फ्लीट त्रिज्या' : language === 'en' ? 'Active Fleet Radius' : 'सक्रिय फ्लीट दायरा'}
            </span>
            <span className="text-[18px] font-black font-mono text-white">
              {serviceRadiusKm} <span className="text-[12px]">KM</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Operational Center Open / Closed Status Quick Bar */}
      <div
        id="recycler-center-status-card"
        className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 border-2 shadow-sm transition-all ${
          centerIsOpen
            ? 'bg-[#85f8c4]/15 border-[#006948] text-[#002114] dark:bg-[#042419] dark:text-[#85f8c4] dark:border-[#006948]'
            : 'bg-[#ffdad6]/25 border-[#ba1a1a] text-[#410002] dark:bg-[#2c1515] dark:text-[#ffdad6] dark:border-[#ba1a1a]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[24px] shrink-0 shadow-sm ${
              centerIsOpen
                ? 'bg-[#006948] text-white'
                : 'bg-[#ba1a1a] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {centerIsOpen ? 'store' : 'lock_clock'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black tracking-tight">
                {centerIsOpen ? rc.centerStatusOpen : rc.centerStatusClosed}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                  centerIsOpen
                    ? 'bg-[#006948] text-white'
                    : 'bg-[#ba1a1a] text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${centerIsOpen ? 'bg-[#85f8c4] animate-ping' : 'bg-white'}`} />
                {centerIsOpen
                  ? (language === 'mr' ? 'नकाशावर सक्रिय' : language === 'en' ? 'LIVE ON MAP' : 'नक्शे पर लाइव')
                  : (language === 'mr' ? 'कबाडीवाल्यांसाठी बंद' : language === 'en' ? 'OFFLINE FOR KABADIWALA' : 'कबाड़ीवालों के लिए बंद')}
              </span>
            </div>
            <p className="text-[12px] opacity-90 leading-tight mt-0.5">
              {centerIsOpen ? rc.centerOpenNotice : rc.centerClosedNotice}
            </p>
          </div>
        </div>

        {/* Action Toggle Switch */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            id="btn-recycler-mark-open"
            type="button"
            onClick={() => handleToggleCenter(true)}
            className={`flex-1 sm:flex-none h-10 px-4 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              centerIsOpen
                ? 'bg-[#006948] text-white shadow-sm font-black border-2 border-[#006948]'
                : 'bg-white/80 dark:bg-white/10 text-[#565e74] hover:text-[#191c1e] border border-[#bccac0]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{language === 'mr' ? 'सुरू (OPEN)' : language === 'en' ? 'Mark OPEN' : 'खुला (OPEN)'}</span>
          </button>

          <button
            id="btn-recycler-mark-closed"
            type="button"
            onClick={() => handleToggleCenter(false)}
            className={`flex-1 sm:flex-none h-10 px-4 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !centerIsOpen
                ? 'bg-[#ba1a1a] text-white shadow-sm font-black border-2 border-[#ba1a1a]'
                : 'bg-white/80 dark:bg-white/10 text-[#565e74] hover:text-[#ba1a1a] border border-[#bccac0]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            <span>{language === 'mr' ? 'बंद (CLOSED)' : language === 'en' ? 'Mark CLOSED' : 'बंद (CLOSED)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Facility Navigation Tab Bar (5 Pillars for Recycler Portal) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#131c24] rounded-2xl border-2 border-[#191c1e] shadow-sm overflow-x-auto scrollbar-none">
        <button
          id="tab-recycler-leads"
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setActiveTab('leads');
          }}
          className={`px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">hub</span>
          <span>{rc.tabLeads}</span>
          {pendingLeadsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#ffdcc3] text-[#6e3900] text-[10px] font-bold flex items-center justify-center">
              {pendingLeadsCount}
            </span>
          )}
        </button>

        <button
          id="tab-recycler-intake"
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setActiveTab('intake');
          }}
          className={`px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'intake'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          <span>{rc.tabIntake}</span>
        </button>

        <button
          id="tab-recycler-rates"
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setActiveTab('rates');
          }}
          className={`px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'rates'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
          <span>{rc.tabRates}</span>
        </button>

        <button
          id="tab-recycler-epr"
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setActiveTab('epr');
          }}
          className={`px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'epr'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>{rc.tabEpr}</span>
        </button>

        <button
          id="tab-recycler-compliance"
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setActiveTab('compliance');
          }}
          className={`px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'compliance'
              ? 'bg-[#006948] text-white shadow-sm'
              : 'text-[#565e74] dark:text-[#94a3b8] hover:text-[#191c1e] dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>{rc.tabCompliance}</span>
        </button>
      </div>

      {/* 3. Active Tab Content Rendering */}
      <div>
        {activeTab === 'leads' && (
          <IncomingLeadsTab
            language={language}
            leads={leads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onInitiateIntakeFromLead={handleInitiateIntakeFromLead}
          />
        )}

        {activeTab === 'intake' && (
          <QrHandoverVerificationTab
            language={language}
            transactions={transactions}
            onCompleteVerifiedIntake={handleCompleteVerifiedIntake}
            initialScannedToken={initialScannedToken}
          />
        )}

        {activeTab === 'rates' && (
          <RateCardManagerTab
            language={language}
            scrapRates={scrapRates}
            onUpdateRate={handleUpdateRate}
            bulkTiers={bulkTiers}
            onUpdateBulkTiers={setBulkTiers}
          />
        )}

        {activeTab === 'epr' && (
          <EprComplianceReportsTab
            language={language}
            transactions={transactions}
            certificate={certificate}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceVerificationTab
            profile={profile}
            language={language}
            certificate={certificate}
            onUpdateCertificate={setCertificate}
            serviceRadiusKm={serviceRadiusKm}
            onUpdateServiceRadius={setServiceRadiusKm}
            hasFleetPickup={hasFleetPickup}
            onToggleFleetPickup={setHasFleetPickup}
            isCenterOpen={centerIsOpen}
            onToggleCenterStatus={handleToggleCenter}
          />
        )}
      </div>
    </div>
  );
};
