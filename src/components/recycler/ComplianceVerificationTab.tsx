import React, { useState } from 'react';
import { Language, UserProfile, EprCertificate } from '../../types';
import { speakVernacular, triggerHaptic } from '../../utils/speech';

interface ComplianceVerificationTabProps {
  profile: UserProfile;
  language: Language;
  certificate: EprCertificate;
  onUpdateCertificate: (cert: EprCertificate) => void;
  serviceRadiusKm: number;
  onUpdateServiceRadius: (radius: number) => void;
  hasFleetPickup: boolean;
  onToggleFleetPickup: (enabled: boolean) => void;
}

const ALL_MATERIALS = [
  { id: 'pcb-motherboard', nameEn: 'Printed Circuit Boards (PCBs)', nameHi: 'PCB मदरबोर्ड / सर्किट बोर्ड', nameMr: 'PCB मदरबोर्ड' },
  { id: 'copper-wire', nameEn: 'Bright Stripped Copper Wire', nameHi: 'चमकदार तांबा तार (Copper)', nameMr: 'तांब्याची तार' },
  { id: 'li-ion-battery', nameEn: 'Lithium-ion Battery Packs', nameHi: 'लिथियम-आयन बैटरी पैक', nameMr: 'लिथियम बॅटरी पॅक' },
  { id: 'server-boards', nameEn: 'Enterprise Server Backplanes', nameHi: 'सर्वर बैकप्लेन व कार्ड्स', nameMr: 'सर्व्हर कार्ड्स' },
  { id: 'telecom-scrap', nameEn: 'Telecom Base Station Relays', nameHi: 'टेलीकॉम रिले व कार्ड्स', nameMr: 'टेलिकॉम स्क्रॅप' },
  { id: 'crt-screens', nameEn: 'Monitors & Display Panels', nameHi: 'मॉनिटर व डिस्प्ले पैनल्स', nameMr: 'स्क्रीन व पॅनेल्स' },
];

export const ComplianceVerificationTab: React.FC<ComplianceVerificationTabProps> = ({
  profile,
  language,
  certificate,
  onUpdateCertificate,
  serviceRadiusKm,
  onUpdateServiceRadius,
  hasFleetPickup,
  onToggleFleetPickup,
}) => {
  const [certNumber, setCertNumber] = useState(certificate.cpcbNumber);
  const [spcbState, setSpcbState] = useState(certificate.spcbState);
  const [validTill, setValidTill] = useState(certificate.validTill);
  const [authorizedCapacity, setAuthorizedCapacity] = useState(certificate.authorizedCapacityMT);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(certificate.authorizedMaterials);
  const [uploadedFileName, setUploadedFileName] = useState(certificate.certificateFileName);
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  const handleToggleMaterial = (matId: string) => {
    triggerHaptic(15);
    setSelectedMaterials((prev) =>
      prev.includes(matId) ? prev.filter((m) => m !== matId) : [...prev, matId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(20);
      setUploadedFileName(file.name);
      const msg =
        language === 'en'
          ? `Certificate ${file.name} uploaded successfully.`
          : 'प्रमाणपत्र सफलतापूर्वक अपलोड किया गया।';
      speakVernacular(msg, language);
    }
  };

  const handleSaveCompliance = () => {
    triggerHaptic(30);
    const updated: EprCertificate = {
      ...certificate,
      cpcbNumber: certNumber,
      spcbState,
      validTill,
      authorizedCapacityMT: authorizedCapacity,
      authorizedMaterials: selectedMaterials,
      certificateFileName: uploadedFileName,
      verificationStatus: 'verified',
    };
    onUpdateCertificate(updated);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);

    const msg =
      language === 'en'
        ? 'Compliance and license profile verified and updated.'
        : language === 'mr'
        ? 'परवाना आणि अनुपालन तपशील अद्यतनित झाले.'
        : 'अनुपालन व लाइसेंस प्रोफाइल सफलतापूर्वक अपडेट हुआ।';
    speakVernacular(msg, language);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Verification Gatekeeper Banner */}
      <div className="bg-gradient-to-r from-[#006948] to-[#004d34] text-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#002114] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white text-[#006948] flex items-center justify-center font-bold text-[24px] shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[28px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-black leading-tight">
                {language === 'en'
                  ? 'CPCB / SPCB Authorized Recycler Portal'
                  : language === 'mr'
                  ? 'CPCB अधिकृत रिसायकलर पडताळणी'
                  : 'CPCB / SPCB अधिकृत रीसाइक्लर सत्यापन'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-bold text-[10px]">
                GOVT CERTIFIED
              </span>
            </div>
            <p className="text-[12px] text-white/85 mt-0.5">
              {language === 'en'
                ? 'Only verified recyclers can participate in the digital EPR scrap traceability chain.'
                : 'केवल सत्यापित रीसाइक्लर्स ही सरकारी EPR डिजिटल ट्रेसिबिलिटी में भाग ले सकते हैं।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-bold text-[12px] border border-white/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#85f8c4] animate-pulse"></span>
            {language === 'en' ? 'License Active (Audit OK)' : 'लाइसेंस सक्रिय (ऑडिट OK)'}
          </span>
        </div>
      </div>

      {isSavedBanner && (
        <div className="p-3 bg-[#85f8c4]/30 text-[#002114] dark:bg-[#062b1e] dark:text-[#34d399] border-2 border-[#006948]/40 rounded-xl text-[13px] font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>
            {language === 'en'
              ? 'Compliance configuration saved and synchronized with Ministry registry!'
              : 'अनुपालन सेटिंग्स सफलतापूर्वक सहेजी गईं!'}
          </span>
        </div>
      )}

      {/* 1. License & Authorization Certificate Upload */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#bccac0]/40 dark:border-[#263849] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[22px]">
              badge
            </span>
            <h4 className="text-[16px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {language === 'en'
                ? '1. License & Registration Certificate'
                : '1. लाइसेंस व पंजीकरण प्रमाणपत्र'}
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#565e74] dark:text-[#94a3b8]">
            E-Waste Rules 2022
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#f1f5f9] block mb-1">
              {language === 'en' ? 'CPCB / EPR Registration Number' : 'CPCB / EPR पंजीकरण संख्या'}
            </label>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="w-full h-11 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[13px] font-bold font-mono text-[#191c1e] dark:text-[#ffffff] focus:border-[#006948] focus:outline-hidden"
              placeholder="e.g. CPCB/EPR-EWASTE/2026/DL-8891"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#f1f5f9] block mb-1">
              {language === 'en' ? 'Issuing State Pollution Board' : 'जारीकर्ता राज्य प्रदूषण बोर्ड'}
            </label>
            <input
              type="text"
              value={spcbState}
              onChange={(e) => setSpcbState(e.target.value)}
              className="w-full h-11 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] focus:border-[#006948] focus:outline-hidden"
              placeholder="e.g. Delhi Pollution Control Committee (DPCC)"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#f1f5f9] block mb-1">
              {language === 'en' ? 'Validity Expiry Date' : 'वैधता समाप्ति तिथि'}
            </label>
            <input
              type="text"
              value={validTill}
              onChange={(e) => setValidTill(e.target.value)}
              className="w-full h-11 px-3 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] focus:border-[#006948] focus:outline-hidden"
              placeholder="e.g. 31-Mar-2028"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#191c1e] dark:text-[#f1f5f9] block mb-1">
              {language === 'en' ? 'Authorized Annual Capacity (MT/Year)' : 'अधिकृत वार्षिक क्षमता (MT/वर्ष)'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={authorizedCapacity}
                onChange={(e) => setAuthorizedCapacity(Number(e.target.value))}
                className="w-full h-11 px-3 pr-12 bg-[#f7f9fb] dark:bg-[#0d141b] border border-[#bccac0]/60 dark:border-[#33485c] rounded-xl text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] focus:border-[#006948] focus:outline-hidden"
              />
              <span className="absolute right-3 top-2.5 text-[12px] font-bold text-[#565e74] dark:text-[#94a3b8]">
                MT
              </span>
            </div>
          </div>
        </div>

        {/* Certificate File Upload Drag & Drop */}
        <div className="p-3.5 bg-[#f2f4f6] dark:bg-[#182430] rounded-xl border-2 border-dashed border-[#006948]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006948]/10 text-[#006948] dark:text-[#34d399] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">description</span>
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] block">
                {uploadedFileName || 'CPCB_Auth_Certificate_2026.pdf'}
              </span>
              <span className="text-[11px] text-[#006948] dark:text-[#34d399] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {language === 'en' ? 'Verified Government Document (2.4 MB)' : 'सत्यापित सरकारी दस्तावेज (2.4 MB)'}
              </span>
            </div>
          </div>

          <label className="px-4 py-2 bg-white dark:bg-[#0d141b] hover:bg-[#85f8c4]/30 text-[#006948] dark:text-[#34d399] rounded-xl font-bold text-[12px] border border-[#006948]/40 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">upload</span>
            <span>{language === 'en' ? 'Upload New Certificate' : 'नया प्रमाणपत्र अपलोड करें'}</span>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* 2. Licensed Material Configuration */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-[#bccac0]/40 dark:border-[#263849] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[22px]">
              checklist_rtl
            </span>
            <h4 className="text-[16px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {language === 'en' ? '2. Licensed Material Intake Scope' : '2. अधिकृत सामग्री चयन (Material Scope)'}
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#006948] dark:text-[#34d399]">
            {selectedMaterials.length} / {ALL_MATERIALS.length} {language === 'en' ? 'Enabled' : 'स्वीकृत'}
          </span>
        </div>

        <p className="text-[12px] text-[#565e74] dark:text-[#94a3b8]">
          {language === 'en'
            ? 'Select only materials your facility is legally permitted and equipped to process.'
            : 'केवल वही सामग्री चुनें जिसे संसाधित करने के लिए आपकी इकाई सरकारी रूप से अधिकृत है।'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {ALL_MATERIALS.map((mat) => {
            const isSelected = selectedMaterials.includes(mat.id);
            return (
              <div
                key={mat.id}
                onClick={() => handleToggleMaterial(mat.id)}
                className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#006948] bg-[#85f8c4]/15 dark:bg-[#062b1e]'
                    : 'border-[#bccac0]/40 dark:border-[#263849] bg-[#f7f9fb] dark:bg-[#0d141b] opacity-75'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-4 h-4 mt-0.5 accent-[#006948] cursor-pointer"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] leading-tight">
                    {language === 'en' ? mat.nameEn : language === 'mr' ? mat.nameMr : mat.nameHi}
                  </span>
                  <span className="text-[10px] text-[#565e74] dark:text-[#94a3b8] mt-0.5">
                    {isSelected ? '✓ Processing Authorized' : '✕ Excluded'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Service Area & Logistics Radius */}
      <div className="bg-white dark:bg-[#131c24] rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-[#191c1e] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#bccac0]/40 dark:border-[#263849] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948] dark:text-[#34d399] text-[22px]">
              radar
            </span>
            <h4 className="text-[16px] font-black text-[#191c1e] dark:text-[#ffffff]">
              {language === 'en' ? '3. Service Area & Logistics Matchmaking' : '3. सेवा क्षेत्र एवं लॉजिस्टिक्स दायरा'}
            </h4>
          </div>
          <span className="text-[12px] font-black text-[#006948] dark:text-[#34d399]">
            {serviceRadiusKm} KM RADIUS
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px] font-bold text-[#565e74] dark:text-[#94a3b8]">
            <span>{language === 'en' ? 'Operating Pickup Radius' : 'पिकअप दायरा'}</span>
            <span className="text-[#191c1e] dark:text-[#ffffff]">{serviceRadiusKm} km around {profile.zone}</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={serviceRadiusKm}
            onChange={(e) => {
              triggerHaptic(10);
              onUpdateServiceRadius(Number(e.target.value));
            }}
            className="w-full accent-[#006948] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#565e74] dark:text-[#94a3b8]">
            <span>5 km (Hyperlocal)</span>
            <span>25 km (City-wide)</span>
            <span>50 km (NCR/Region)</span>
          </div>
        </div>

        <div className="p-3 bg-[#f7f9fb] dark:bg-[#0d141b] rounded-xl border border-[#bccac0]/40 dark:border-[#263849] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#191c1e] dark:text-[#ffffff] block">
                {language === 'en' ? 'Active Pickup Fleet Available' : 'सक्रिय पिकअप वैन बेड़ा उपलब्ध'}
              </span>
              <span className="text-[11px] text-[#565e74] dark:text-[#94a3b8]">
                {language === 'en' ? 'Dispatches van within 15-30 mins for lots >20kg' : '20 किलो से अधिक के लॉट के लिए वैन तत्काल भेजी जाएगी'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              onToggleFleetPickup(!hasFleetPickup);
            }}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              hasFleetPickup ? 'bg-[#006948]' : 'bg-[#bccac0]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                hasFleetPickup ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveCompliance}
          className="w-full sm:w-auto px-6 h-12 bg-[#006948] hover:bg-[#005238] text-white font-black text-[14px] rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          <span>{language === 'en' ? 'Save & Sync Compliance Profile' : 'अनुपालन प्रोफाइल सुरक्षित करें'}</span>
        </button>
      </div>
    </div>
  );
};
