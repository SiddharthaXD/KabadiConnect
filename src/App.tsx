/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ScreenName, Language, ScrapItem, Recycler, Transaction, UserRole, UserProfile } from './types';
import { SCRAP_ITEMS, INITIAL_TRANSACTIONS, DEFAULT_KABADIWALA_PROFILE, DEFAULT_RECYCLER_PROFILE } from './data/scrapData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { CameraScanner } from './components/CameraScanner';
import { ScrapWeighingScreen } from './components/ScrapWeighingScreen';
import { SafetyHazardModal } from './components/SafetyHazardModal';
import { TransactionReceipt } from './components/TransactionReceipt';
import { LedgerScreen } from './components/LedgerScreen';
import { SupportScreen } from './components/SupportScreen';
import { LoginScreen } from './components/LoginScreen';
import { RecyclerDashboard } from './components/RecyclerDashboard';
import { OfflineToast } from './components/OfflineToast';
import { speakVernacular, triggerHaptic } from './utils/speech';
import { TRANSLATIONS } from './data/translations';

export default function App() {
  // Role & Profile state: Two options - Log in as Kabadiwala, Log in as Recycler
  const [userRole, setUserRole] = useState<UserRole>('kabadiwala');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_KABADIWALA_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // App opens with the login page first as requested
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('login');
  const [language, setLanguage] = useState<Language>('hi');
  const [scrapItemsList, setScrapItemsList] = useState<ScrapItem[]>(SCRAP_ITEMS);
  const [selectedScrapItem, setSelectedScrapItem] = useState<ScrapItem>(SCRAP_ITEMS[0]);
  const [weighingWeight, setWeighingWeight] = useState<number>(15.5);

  // Hazardous material handling modal state
  const [isHazardModalOpen, setIsHazardModalOpen] = useState<boolean>(false);
  const [hazardScrapItem, setHazardScrapItem] = useState<ScrapItem>(SCRAP_ITEMS[2]); // Li-ion

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeReceipt, setActiveReceipt] = useState<Transaction>(INITIAL_TRANSACTIONS[0]);

  // Online & Sync state
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(false);
  const [offlineToastMode, setOfflineToastMode] = useState<'offline' | 'restored'>('offline');
  const prevOnlineRef = useRef<boolean>(true);
  const isFirstMountRef = useRef<boolean>(true);

  // Prevent background body scrolling when any modal is open (removes duplicate/unnecessary background scrollbar)
  useEffect(() => {
    const isAnyModalOpen = showLoginModal || isHazardModalOpen;
    if (isAnyModalOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [showLoginModal, isHazardModalOpen]);

  // Track online/offline status from browser events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Visual indicator toast triggers when 'isOnline' transitions
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevOnlineRef.current = isOnline;
      // If initialized offline, show indicator
      if (!isOnline) {
        setOfflineToastMode('offline');
        setShowOfflineToast(true);
      }
      return;
    }

    if (prevOnlineRef.current !== isOnline) {
      if (!isOnline) {
        // Transitioned to OFFLINE: warn user that data will sync once connection is restored
        setOfflineToastMode('offline');
        setShowOfflineToast(true);
        triggerHaptic([40, 50, 40]);
      } else {
        // Transitioned back to ONLINE: notify and auto-sync
        setOfflineToastMode('restored');
        setShowOfflineToast(true);
        triggerHaptic(30);
        handleSync();

        // Auto-dismiss the restored toast after 4 seconds
        const timer = setTimeout(() => {
          setShowOfflineToast(false);
        }, 4000);
        return () => clearTimeout(timer);
      }
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline]);

  // Toggle offline/online for testing or user preference
  const handleToggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  // Recheck connection action from the toast
  const handleRecheckConnection = () => {
    triggerHaptic(20);
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
      if (browserOnline) {
        setIsOnline(true);
      } else {
        triggerHaptic([30, 30]);
        speakVernacular(
          language === 'hi'
            ? 'अभी भी ऑफ़लाइन है। आपका डेटा स्थानीय रूप से सुरक्षित है।'
            : language === 'mr'
            ? 'अजूनही ऑफलाइन आहे. डेटा सुरक्षित आहे.'
            : 'Still offline. Data is saved locally and will sync once connected.',
          language
        );
      }
    }, 900);
  };

  // Handle Login or Role Switch
  const handleLogin = (role: UserRole, profile: UserProfile) => {
    setUserRole(role);
    setUserProfile(profile);
    setIsLoggedIn(true);
    setShowLoginModal(false);

    if (role === 'recycler') {
      setCurrentScreen('recycler_dashboard');
    } else {
      setCurrentScreen('home');
    }
  };

  // Sync simulation
  const handleSync = () => {
    triggerHaptic(30);
    setIsSyncing(true);
    setTimeout(() => {
      setTransactions((prev) => prev.map((tx) => ({ ...tx, isSynced: true })));
      setIsSyncing(false);
      speakVernacular(TRANSLATIONS[language].syncedSuccess, language);
    }, 1200);
  };

  // Recycler updates market rates dynamically
  const handleUpdateRate = (scrapId: string, newRate: number) => {
    setScrapItemsList((prev) =>
      prev.map((item) =>
        item.id === scrapId
          ? { ...item, baseRate: newRate, marketMaxRate: Math.max(item.marketMaxRate, newRate) }
          : item
      )
    );
  };

  // Recycler verifies and completes a handover
  const handleVerifyTransaction = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txnId ? { ...tx, handoverPassed: true, isSynced: true } : tx
      )
    );
  };

  // From Home or List: select item for weighing
  const handleSelectItemForWeighing = (item: ScrapItem, initialWeight: number = 15.0) => {
    setSelectedScrapItem(item);
    setWeighingWeight(initialWeight);

    if (item.isHazardous) {
      setHazardScrapItem(item);
      setIsHazardModalOpen(true);
    } else {
      setCurrentScreen('weighing');
    }
  };

  // From Camera: capture detected scrap
  const handleCaptureScrap = (detectedItem: ScrapItem) => {
    setSelectedScrapItem(detectedItem);
    setWeighingWeight(15.5);

    if (detectedItem.isHazardous) {
      setHazardScrapItem(detectedItem);
      setIsHazardModalOpen(true);
    } else {
      setCurrentScreen('weighing');
    }
  };

  // From Hazard modal: acknowledged & proceed
  const handleHazardProceed = () => {
    setIsHazardModalOpen(false);
    setCurrentScreen('weighing');
  };

  // Confirm deal & generate receipt
  const handleConfirmDeal = (weight: number, recycler: Recycler, totalPayout: number) => {
    const newTxNumber = `#TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      txnNumber: newTxNumber,
      timestamp: new Date(),
      scrapItem: selectedScrapItem,
      weightKg: weight,
      ratePerKg: recycler.offerRate,
      totalPayout,
      recycler,
      isSynced: false,
      paymentMode: 'नकद / UPI',
      handoverPassed: true,
    };

    setTransactions([newTx, ...transactions]);
    setActiveReceipt(newTx);
    setCurrentScreen('receipt');
  };

  // Total metrics
  const totalEarned = transactions.reduce((acc, t) => acc + t.totalPayout, 0);
  const totalWeight = transactions.reduce((acc, t) => acc + t.weightKg, 0);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home':
        return 'Kabadiwala Connect';
      case 'recycler_dashboard':
        return 'Kabadiwala Connect (रीसाइक्लर)';
      case 'scanner':
        return 'सामान स्कैन करें';
      case 'weighing':
        return 'New Scrap Weighing';
      case 'receipt':
        return 'Transaction Detail Receipt';
      case 'ledger':
        return 'खाता रजिस्टर (Ledger)';
      case 'support':
        return 'मदद व सहायता (Support)';
      case 'login':
        return language === 'en' ? 'Kabadiwala Connect Sign In' : 'Kabadiwala Connect लॉगिन';
      default:
        return 'Kabadiwala Connect';
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col antialiased">
      {/* Top App Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        language={language}
        onLanguageChange={setLanguage}
        isOnline={isOnline}
        onSync={handleSync}
        isSyncing={isSyncing}
        title={getScreenTitle()}
        userProfile={userProfile}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => {
          triggerHaptic(20);
          setShowLoginModal(true);
        }}
        onToggleOnline={handleToggleOnline}
      />

      {/* Visual Toast Indicator when 'isOnline' changes to offline / restored */}
      <OfflineToast
        isVisible={showOfflineToast}
        isOnline={isOnline}
        language={language}
        mode={offlineToastMode}
        onDismiss={() => setShowOfflineToast(false)}
        onRecheck={handleRecheckConnection}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full flex flex-col">
        {/* Recycler Dedicated Portal Screen */}
        {currentScreen === 'recycler_dashboard' && (
          <RecyclerDashboard
            profile={userProfile}
            language={language}
            onLanguageChange={setLanguage}
            transactions={transactions}
            onVerifyTransaction={handleVerifyTransaction}
            onSwitchRole={() => {
              triggerHaptic(25);
              setCurrentScreen('login');
            }}
            onUpdateRate={handleUpdateRate}
          />
        )}

        {/* Kabadiwala Collector Home Dashboard */}
        {currentScreen === 'home' && (
          <HomeDashboard
            onNavigate={setCurrentScreen}
            onSelectItemForWeighing={handleSelectItemForWeighing}
            language={language}
            onLanguageChange={setLanguage}
            onSync={handleSync}
            isSyncing={isSyncing}
            totalEarned={totalEarned}
            totalWeight={totalWeight}
          />
        )}

        {/* Login Screen (presented initially on app launch or on role switch) */}
        {currentScreen === 'login' && (
          <LoginScreen
            onLogin={handleLogin}
            language={language}
            onLanguageChange={setLanguage}
            currentRole={userRole}
            onCancel={
              isLoggedIn
                ? () =>
                    setCurrentScreen(userRole === 'recycler' ? 'recycler_dashboard' : 'home')
                : undefined
            }
          />
        )}

        {currentScreen === 'scanner' && (
          <CameraScanner onCapture={handleCaptureScrap} language={language} />
        )}

        {currentScreen === 'weighing' && (
          <ScrapWeighingScreen
            item={selectedScrapItem}
            initialWeight={weighingWeight}
            onConfirmDeal={handleConfirmDeal}
            language={language}
          />
        )}

        {currentScreen === 'receipt' && (
          <TransactionReceipt
            transaction={activeReceipt}
            onGoHome={() =>
              setCurrentScreen(userRole === 'recycler' ? 'recycler_dashboard' : 'home')
            }
            language={language}
          />
        )}

        {currentScreen === 'ledger' && (
          <LedgerScreen
            transactions={transactions}
            onSelectTransaction={(tx) => {
              setActiveReceipt(tx);
              setCurrentScreen('receipt');
            }}
            language={language}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
        )}

        {currentScreen === 'support' && (
          <SupportScreen
            language={language}
            onResetData={() => {
              setTransactions(INITIAL_TRANSACTIONS);
              setActiveReceipt(INITIAL_TRANSACTIONS[0]);
            }}
            userProfile={userProfile}
            onSwitchRole={() => {
              triggerHaptic(20);
              setCurrentScreen('login');
            }}
          />
        )}
      </main>

      {/* Role Selection / Login Modal Overlay */}
      {showLoginModal && (
        <div
          id="login-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              triggerHaptic(15);
              setShowLoginModal(false);
            }
          }}
        >
          <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#191c1e] animate-in zoom-in-95 duration-200">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#f7f9fb] border-b border-[#bccac0]/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#006948] text-white flex items-center justify-center font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#191c1e] leading-tight">
                    {language === 'mr'
                      ? 'लॉगिन / भूमिका निवडा'
                      : language === 'en'
                      ? 'Select Role / Login'
                      : 'लॉगिन / भूमिका चयन'}
                  </span>
                  <span className="text-[11px] text-[#565e74]">
                    {language === 'mr'
                      ? 'कबाडीवाला किंवा रिसायकलर'
                      : language === 'en'
                      ? 'Kabadiwala or Recycler'
                      : 'कबाड़ीवाला या अधिकृत रीसाइक्लर'}
                  </span>
                </div>
              </div>

              <button
                id="btn-close-login-modal"
                onClick={() => {
                  triggerHaptic(15);
                  setShowLoginModal(false);
                }}
                className="w-8 h-8 rounded-full bg-[#e6e8ea] hover:bg-[#d8dbdd] flex items-center justify-center text-[#191c1e] active:scale-95 transition-all"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body: Single necessary scrollbar inside the card */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <LoginScreen
                onLogin={handleLogin}
                language={language}
                onLanguageChange={setLanguage}
                currentRole={userRole}
                onCancel={() => setShowLoginModal(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hazardous Materials Safety Bottom Sheet */}
      <SafetyHazardModal
        item={hazardScrapItem}
        isOpen={isHazardModalOpen}
        onConfirmProceed={handleHazardProceed}
        onRetakePhoto={() => {
          setIsHazardModalOpen(false);
          setCurrentScreen('scanner');
        }}
        language={language}
      />

      {/* Bottom Navigation Bar */}
      {currentScreen !== 'scanner' && currentScreen !== 'login' && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          userRole={userRole}
          language={language}
        />
      )}
    </div>
  );
}
