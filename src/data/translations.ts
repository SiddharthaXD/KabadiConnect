import { Language } from '../types';

export interface DashboardTranslations {
  // Common / Header / Switcher
  appName: string;
  langSwitchTitle: string;
  kabadiwalaRoleName: string;
  recyclerRoleName: string;
  switchRoleBtn: string;
  verifiedPartner: string;
  cpcbAuthorized: string;
  syncNow: string;
  syncedSuccess: string;
  syncing: string;

  // Global app audio feedback / common phrases
  globalSpeech: {
    photoCapturedProcessing: string;
    cameraInstruction: string;
    supportCallingMsg: string;
    dataResetMsg: string;
    receiptCopiedMsg: string;
  };

  // Kabadiwala Dashboard
  kabadiwala: {
    pageTitle: string;
    greeting: string;
    voiceBannerTitle: string;
    voiceBannerSubtitle: string;
    speakBtn: string;
    audioWelcomePrompt: string;
    offlineModeTitle: string;
    offlineModeDesc: string;
    syncPendingBtn: string;
    scanCtaTitle: string;
    scanCtaSubtitle: string;
    scanCtaBadge: string;
    scanCtaAction: string;
    earningsTitle: string;
    earningsSubtitle: string;
    weightTitle: string;
    weightSubtitle: string;
    dealsTitle: string;
    dealsSubtitle: string;
    calcTitle: string;
    calcProductLabel: string;
    calcSubtitle: string;
    weightLabel: string;
    ratePerKgLabel: string;
    calcCostLabel: string;
    calcProfitLabel: string;
    estPayoutLabel: string;
    weighThisNowBtn: string;
    presetQuickWeights: string;
    mandiRatesTitle: string;
    mandiRatesSubtitle: string;
    listenAllRatesBtn: string;
    tapToWeigh: string;
    audioRatesSpeech: string;
    cpcbNotice: string;
  };

  // Recycler Dashboard
  recycler: {
    pageTitle: string;
    intakeCenterActive: string;
    totalProcuredTitle: string;
    totalProcuredSubtitle: string;
    totalDisbursedTitle: string;
    totalDisbursedSubtitle: string;
    verifiedTokensTitle: string;
    verifiedTokensSubtitle: string;
    scanPassHeader: string;
    scanPassTitle: string;
    scanPassDesc: string;
    scanPassAction: string;
    scanningAction: string;
    validTokenFound: string;
    collectorLabel: string;
    payoutDueLabel: string;
    acceptPayBtn: string;
    cancelBtn: string;
    ratesManagerTitle: string;
    ratesManagerSubtitle: string;
    govtBaseRateLabel: string;
    rateUpdatedSuccess: string;
    incomingVansTitle: string;
    activePickupsCount: string;
    minsAway: string;
    callCollector: string;
    audioWelcomePrompt: string;
    audioScanInstruction: string;
  };

  // Bottom Nav labels
  nav: {
    home: string;
    portal: string;
    ledger: string;
    support: string;
  };

  // Offline / Online Toast notifications
  offlineToast: {
    title: string;
    desc: string;
    warningBadge: string;
    listenBtn: string;
    dismissBtn: string;
    recheckBtn: string;
    speechText: string;
    onlineRestoredTitle: string;
    onlineRestoredDesc: string;
  };
}

export const TRANSLATIONS: Record<Language, DashboardTranslations> = {
  hi: {
    appName: 'SmartKabadi',
    langSwitchTitle: 'भाषा बदलें (Select Language)',
    kabadiwalaRoleName: 'कबाड़ीवाला',
    recyclerRoleName: 'रीसाइक्लर',
    switchRoleBtn: 'भूमिका बदलें',
    verifiedPartner: 'सत्यापित साथी',
    cpcbAuthorized: 'CPCB अधिकृत रिसाइक्लर',
    syncNow: 'सिंक करें',
    syncedSuccess: 'सारा रिकॉर्ड सफलतापूर्वक सिंक हो गया है।',
    syncing: 'सिंक हो रहा है...',

    globalSpeech: {
      photoCapturedProcessing: 'फोटो खींच ली गई है। विवरण जांचा जा रहा है।',
      cameraInstruction: 'सामने इलेक्ट्रॉनिक कचरा रखें और फोटो खींचो बोलें।',
      supportCallingMsg: 'ई-कचरा सुरक्षा हेल्पलाइन पर कॉल किया जा रहा है।',
      dataResetMsg: 'डेटा रीसेट कर दिया गया है।',
      receiptCopiedMsg: 'रसीद का विवरण कॉपी कर लिया गया है।',
    },

    kabadiwala: {
      pageTitle: 'SmartKabadi - कबाड़ीवाला डैशबोर्ड',
      greeting: 'नमस्ते, रामेश्वर जी! आज का कारोबार शुरू करें',
      voiceBannerTitle: 'आवाज़ से सुनें',
      voiceBannerSubtitle: 'निर्देश और मंडी भाव सुनने हेतु टैप करें',
      speakBtn: 'बोलें',
      audioWelcomePrompt:
        'SmartKabadi में आपका स्वागत है। बड़ा हरा कैमरा बटन दबाकर कचरा स्कैन करें और तुरंत सरकारी मंडी भाव जानें।',
      offlineModeTitle: 'ऑफलाइन मोड सुरक्षित',
      offlineModeDesc: 'इंटरनेट न होने पर भी वजन और रसीद सुरक्षित रहती है',
      syncPendingBtn: 'सिंक करें (Sync Now)',
      scanCtaTitle: 'सामान स्कैन करें',
      scanCtaSubtitle: 'AI कैमरा से ई-कचरा पहचानें, ग्रेड जांचें व रेट देखें',
      scanCtaBadge: 'कैमरा लाइव',
      scanCtaAction: 'स्कैन शुरू करें',
      earningsTitle: 'आज की कुल कमाई',
      earningsSubtitle: 'सीधे खाते / नकद में',
      weightTitle: 'आज का कुल वजन',
      weightSubtitle: 'डिजिटल कांटे से प्रमाणित',
      dealsTitle: 'सक्रिय सौदे',
      dealsSubtitle: 'सफल लेनदेन रसीदें',
      calcTitle: 'त्वरित मूल्य कैलकुलेटर',
      calcProductLabel: 'उत्पाद चुनें',
      calcSubtitle: 'वजन बदलें और तुरंत अनुमानित कमाई देखें',
      weightLabel: 'वजन (किलो)',
      ratePerKgLabel: 'प्रति किलो रेट',
      calcCostLabel: 'मेरी खरीद दर (My Cost)',
      calcProfitLabel: 'अनुमानित मुनाफा (Profit)',
      estPayoutLabel: 'अनुमानित कुल कमाई',
      weighThisNowBtn: 'कांटे पर तौलें (Weigh Now)',
      presetQuickWeights: 'त्वरित वजन:',
      mandiRatesTitle: 'सरकारी लाइव मंडी भाव',
      mandiRatesSubtitle: 'दैनिक प्रमाणित ई-कचरा खरीद दरें',
      listenAllRatesBtn: 'ऑडियो से सभी भाव सुनें',
      tapToWeigh: 'तौलने के लिए चुनें',
      audioRatesSpeech:
        'आज के लाइव भाव: पीसीबी मदरबोर्ड दो सौ अस्सी रुपये किलो, तांबा तार पांच सौ चालीस रुपये किलो, लिथियम बैटरी एक सौ बीस रुपये किलो।',
      cpcbNotice: 'CPCB ई-कचरा नियम 2022 के तहत शत-प्रतिशत प्रमाणित एवं कानूनी निपटान।',
    },

    recycler: {
      pageTitle: 'SmartKabadi - अधिकृत रिसाइक्लर पोर्टल',
      intakeCenterActive: 'खरीद केंद्र सक्रिय',
      totalProcuredTitle: 'कुल खरीद (Procured)',
      totalProcuredSubtitle: 'ई-कचरा आवक',
      totalDisbursedTitle: 'वितरित राशि (Disbursed)',
      totalDisbursedSubtitle: 'नकद व UPI भुगतान',
      verifiedTokensTitle: 'सत्यापित टोकन',
      verifiedTokensSubtitle: 'CPCB प्रमाणित डील',
      scanPassHeader: 'कलेक्शन काउंटर (INSPECTION & INTAKE)',
      scanPassTitle: 'कबाड़ीवाला टोकन स्कैन करें',
      scanPassDesc: 'कबाड़ीवाले के फोन से डिजिटल क्यूआर पास स्कैन कर स्क्रैप स्वीकारें',
      scanPassAction: 'क्यूआर पास स्कैन करें (Scan QR)',
      scanningAction: 'क्यूआर स्कैन हो रहा है...',
      validTokenFound: 'वैध टोकन पाया गया',
      collectorLabel: 'संग्राहक (Collector)',
      payoutDueLabel: 'देय भुगतान (Payout)',
      acceptPayBtn: 'स्वीकारें & भुगतान दें',
      cancelBtn: 'रद्द करें',
      ratesManagerTitle: 'आपकी मंडी खरीद दरें',
      ratesManagerSubtitle: 'थोक खरीद भाव नियंत्रित करें (Live Buyer Rates)',
      govtBaseRateLabel: 'सरकारी आधार भाव:',
      rateUpdatedSuccess: 'का नया भाव अपडेट हुआ!',
      incomingVansTitle: 'आवक स्क्रैप वैन सूची',
      activePickupsCount: 'सक्रिय पिकअप',
      minsAway: 'मिनट दूर',
      callCollector: 'कॉल करें',
      audioWelcomePrompt:
        'रीसाइक्लर पोर्टल में आपका स्वागत है। कबाड़ीवाले का क्यूआर कोड स्कैन करें और लाइव खरीद दरें सेट करें।',
      audioScanInstruction: 'कबाड़ीवाला का क्यूआर कोड कैमरे के सामने रखें।',
    },

    nav: {
      home: 'घर',
      portal: 'पोर्टल',
      ledger: 'खाता',
      support: 'मदद',
    },

    offlineToast: {
      title: 'आप ऑफ़लाइन हैं (Offline)',
      desc: 'इंटरनेट कनेक्शन कट गया है। आपका डेटा (वजन, सौदे और रसीदें) फोन में सुरक्षित रहेगा और कनेक्शन वापस आते ही अपने आप सिंक हो जाएगा।',
      warningBadge: 'ऑफ़लाइन सुरक्षा सक्रिय',
      listenBtn: 'सुनो (Listen)',
      dismissBtn: 'समझ गया (OK)',
      recheckBtn: 'पुनः जांचें',
      speechText:
        'सावधान: इंटरनेट कनेक्शन बंद है। आपकी सभी प्रविष्टियां फोन में सुरक्षित हैं और कनेक्शन बहाल होने पर अपने आप सिंक हो जाएंगी।',
      onlineRestoredTitle: 'वापस ऑनलाइन! (Back Online)',
      onlineRestoredDesc: 'इंटरनेट चालू हो गया है। आपका डेटा सिंक किया जा रहा है...',
    },
  },

  en: {
    appName: 'SmartKabadi',
    langSwitchTitle: 'Select Language',
    kabadiwalaRoleName: 'Kabadiwala',
    recyclerRoleName: 'Recycler',
    switchRoleBtn: 'Switch Role',
    verifiedPartner: 'Verified Collector',
    cpcbAuthorized: 'CPCB Authorized Recycler',
    syncNow: 'Sync Data',
    syncedSuccess: 'All records have been synchronized successfully.',
    syncing: 'Syncing records...',

    globalSpeech: {
      photoCapturedProcessing: 'Photo captured. Verifying details.',
      cameraInstruction: 'Hold electronic scrap in front of camera and tap take photo.',
      supportCallingMsg: 'Calling E-waste safety helpline.',
      dataResetMsg: 'App data has been reset successfully.',
      receiptCopiedMsg: 'Receipt details copied to clipboard.',
    },

    kabadiwala: {
      pageTitle: 'SmartKabadi - Collector Dashboard',
      greeting: 'Welcome back, Rameshwar! Start today’s scrap collection',
      voiceBannerTitle: 'Audio Assistance',
      voiceBannerSubtitle: 'Tap to hear app instructions and live mandi rates',
      speakBtn: 'Listen',
      audioWelcomePrompt:
        'Welcome to SmartKabadi. Tap the large green camera button to scan scrap and check government mandi rates instantly.',
      offlineModeTitle: 'Offline Mode Protected',
      offlineModeDesc: 'Weighing logs and receipts are saved even without internet',
      syncPendingBtn: 'Sync Now',
      scanCtaTitle: 'Scan Scrap Item',
      scanCtaSubtitle: 'Use AI camera to identify e-waste, verify grade and check price',
      scanCtaBadge: 'AI Live',
      scanCtaAction: 'Launch Scanner',
      earningsTitle: 'Today’s Earnings',
      earningsSubtitle: 'Direct bank / Cash received',
      weightTitle: 'Total Weight',
      weightSubtitle: 'Verified via digital scale',
      dealsTitle: 'Completed Deals',
      dealsSubtitle: 'Verified transaction receipts',
      calcTitle: 'Quick Price Estimator',
      calcProductLabel: 'Select Product',
      calcSubtitle: 'Adjust weight slider to instantly calculate scrap value',
      weightLabel: 'Weight (KG)',
      ratePerKgLabel: 'Selling Rate/KG',
      calcCostLabel: 'My Cost/KG',
      calcProfitLabel: 'Est. Profit',
      estPayoutLabel: 'Estimated Total Payout',
      weighThisNowBtn: 'Proceed to Weighing Scale',
      presetQuickWeights: 'Quick presets:',
      mandiRatesTitle: 'Official Mandi Scrap Rates',
      mandiRatesSubtitle: 'Daily certified government scrap benchmark rates',
      listenAllRatesBtn: 'Listen to All Rates via Audio',
      tapToWeigh: 'Select for Weighing',
      audioRatesSpeech:
        'Today live rates: Printed Circuit Board 280 rupees per kg, Stripped Copper Wire 540 rupees per kg, Lithium-ion battery 120 rupees per kg.',
      cpcbNotice: '100% compliant with Central Pollution Control Board E-Waste Rules 2022.',
    },

    recycler: {
      pageTitle: 'SmartKabadi - Recycler Intake Portal',
      intakeCenterActive: 'Intake Center Open',
      totalProcuredTitle: 'Total Procured',
      totalProcuredSubtitle: 'E-Waste Inflow Volume',
      totalDisbursedTitle: 'Total Disbursed',
      totalDisbursedSubtitle: 'Cash & UPI Disbursed',
      verifiedTokensTitle: 'Verified Tokens',
      verifiedTokensSubtitle: 'CPCB Certified Handovers',
      scanPassHeader: 'INTAKE COUNTER & INSPECTION',
      scanPassTitle: 'Scan Collector QR Token',
      scanPassDesc: 'Scan digital QR handover pass from collector to verify material and release payout',
      scanPassAction: 'Scan Collector QR Code',
      scanningAction: 'Scanning QR Token...',
      validTokenFound: 'Valid Token Verified',
      collectorLabel: 'Collector',
      payoutDueLabel: 'Payable Amount',
      acceptPayBtn: 'Accept & Disburse Payment',
      cancelBtn: 'Dismiss',
      ratesManagerTitle: 'Your Mandi Buying Rates',
      ratesManagerSubtitle: 'Set live benchmark purchase rates for local collectors',
      govtBaseRateLabel: 'Official Base Rate:',
      rateUpdatedSuccess: 'new buying rate saved!',
      incomingVansTitle: 'Inbound Scrap Vans Queue',
      activePickupsCount: 'Active Vans',
      minsAway: 'mins away',
      callCollector: 'Call Collector',
      audioWelcomePrompt:
        'Welcome to the Authorized Recycler Portal. Scan collector QR tokens and manage your live buying prices.',
      audioScanInstruction: 'Hold the collector QR code steady in front of the camera.',
    },

    nav: {
      home: 'Home',
      portal: 'Portal',
      ledger: 'Ledger',
      support: 'Support',
    },

    offlineToast: {
      title: 'You are Offline',
      desc: 'Internet connection lost. Don’t worry, your weighing logs, receipts, and deals are safely stored locally and will automatically sync once the connection is restored.',
      warningBadge: 'Offline Protection Active',
      listenBtn: 'Listen',
      dismissBtn: 'Got it',
      recheckBtn: 'Check Status',
      speechText:
        'Warning: You are currently offline. Your data is safely saved on this device and will automatically synchronize once your connection is restored.',
      onlineRestoredTitle: 'Back Online!',
      onlineRestoredDesc: 'Connection restored. Synchronizing your offline records now...',
    },
  },

  mr: {
    appName: 'SmartKabadi',
    langSwitchTitle: 'भाषा निवडा (Select Language)',
    kabadiwalaRoleName: 'कबाडीवाला',
    recyclerRoleName: 'रिसायकलर',
    switchRoleBtn: 'भूमिका बदला',
    verifiedPartner: 'प्रमाणित संकलक',
    cpcbAuthorized: 'CPCB अधिकृत रिसायकलर',
    syncNow: 'सिंक करा',
    syncedSuccess: 'सर्व नोंदी यशस्वीरित्या सिंक झाल्या आहेत.',
    syncing: 'सिंक होत आहे...',

    globalSpeech: {
      photoCapturedProcessing: 'फोटो काढला आहे. तपशील तपासले जात आहेत.',
      cameraInstruction: 'कॅमेऱ्यासमोर ई-कचरा किंवा मदरबोर्ड धरा आणि फोटो काढा.',
      supportCallingMsg: 'ई-कचरा सुरक्षा हेल्पलाइनला कॉल करत आहे.',
      dataResetMsg: 'ॲप डेटा यशस्वीरित्या रीसेट केला आहे.',
      receiptCopiedMsg: 'पावतीचा तपशील कॉपी केला आहे.',
    },

    kabadiwala: {
      pageTitle: 'SmartKabadi - कबाडीवाला डॅशबोर्ड',
      greeting: 'नमस्कार, रामेश्वर जी! आजचा ई-कचरा व्यापार सुरू करा',
      voiceBannerTitle: 'आवाजाने ऐका',
      voiceBannerSubtitle: 'सूचना आणि थेट बाजार भाव ऐकण्यासाठी टॅप करा',
      speakBtn: 'ऐका',
      audioWelcomePrompt:
        'SmartKabadi मध्ये आपले स्वागत आहे. मोठा हिरवा कॅमेरा बटण दाबून कचरा स्कॅन करा आणि थेट सरकारी बाजार भाव पहा.',
      offlineModeTitle: 'ऑफलाईन मोड सुरक्षित',
      offlineModeDesc: 'इंटरनेट नसतानाही वजन नोंदी आणि डिजिटल पावत्या सुरक्षित राहतात',
      syncPendingBtn: 'सिंक करा (Sync Now)',
      scanCtaTitle: 'ई-कचरा स्कॅन करा',
      scanCtaSubtitle: 'AI कॅमेऱ्याने कचरा ओळखा, प्रत तपासा आणि थेट भाव मिळवा',
      scanCtaBadge: 'थेट कॅमेरा',
      scanCtaAction: 'स्कॅन सुरू करा',
      earningsTitle: 'आजची एकूण कमाई',
      earningsSubtitle: 'थेट बँक / रोख जमा',
      weightTitle: 'आजचे एकूण वजन',
      weightSubtitle: 'काट्यावर प्रमाणित वजन',
      dealsTitle: 'पूर्ण झालेले सौदे',
      dealsSubtitle: 'प्रमाणित व्यवहार पावत्या',
      calcTitle: 'झटपट मूल्य कॅल्क्युलेटर',
      calcProductLabel: 'उत्पादन निवडा',
      calcSubtitle: 'वजन बदला आणि अंदाजे मिळणारी रक्कम त्वरित पहा',
      weightLabel: 'वजन (किलो)',
      ratePerKgLabel: 'विक्री दर (प्रति किलो)',
      calcCostLabel: 'माझी खरेदी दर',
      calcProfitLabel: 'अंदाजित नफा',
      estPayoutLabel: 'अंदाजे एकूण रक्कम',
      weighThisNowBtn: 'काट्यावर वजन करा (Weigh Now)',
      presetQuickWeights: 'झटपट वजन:',
      mandiRatesTitle: 'शासकीय थेट बाजार भाव',
      mandiRatesSubtitle: 'दैनिक प्रमाणित ई-कचरा खरेदी दर',
      listenAllRatesBtn: 'सर्व भाव आवाजात ऐका',
      tapToWeigh: 'वजनासाठी निवडा',
      audioRatesSpeech:
        'आजचे थेट बाजार भाव: पीसीबी मदरबोर्ड २८० रुपये किलो, तांब्याची वायर ५४० रुपये किलो, लिथियम बॅटरी १२० रुपये किलो.',
      cpcbNotice: 'CPCB ई-कचरा नियम २०२२ अंतर्गत पूर्णपणे प्रमाणित व अधिकृत पुनर्वापर.',
    },

    recycler: {
      pageTitle: 'SmartKabadi - अधिकृत रिसायकलर पोर्टल',
      intakeCenterActive: 'खरेदी केंद्र सुरू आहे',
      totalProcuredTitle: 'एकूण खरेदी (Procured)',
      totalProcuredSubtitle: 'ई-कचरा आवक प्रमाण',
      totalDisbursedTitle: 'वाटप केलेली रक्कम (Disbursed)',
      totalDisbursedSubtitle: 'रोख व UPI देयके',
      verifiedTokensTitle: 'प्रमाणित टोकन',
      verifiedTokensSubtitle: 'CPCB संमत व्यवहार',
      scanPassHeader: 'संकलन तपासणी केंद्र (INSPECTION & INTAKE)',
      scanPassTitle: 'कबाडीवाला क्यूआर टोकन स्कॅन करा',
      scanPassDesc: 'कबाडीवाल्याच्या फोनवरून डिजिटल क्यूआर पास स्कॅन करून ई-कचरा स्वीकारा व पेमेंट करा',
      scanPassAction: 'क्यूआर पास स्कॅन करा (Scan QR)',
      scanningAction: 'क्यूआर स्कॅन होत आहे...',
      validTokenFound: 'वैध टोकन आढळले',
      collectorLabel: 'संकलक (Collector)',
      payoutDueLabel: 'देय रक्कम (Payout)',
      acceptPayBtn: 'स्वीकारा आणि पेमेंट करा',
      cancelBtn: 'रद्द करा',
      ratesManagerTitle: 'तुमचे थेट खरेदी बाजार दर',
      ratesManagerSubtitle: 'स्थानिक संकलकांसाठी थेट खरेदी दर नियंत्रित करा',
      govtBaseRateLabel: 'शासकीय आधारभूत दर:',
      rateUpdatedSuccess: 'चा नवीन दर सेव्ह झाला!',
      incomingVansTitle: 'येणाऱ्या स्क्रॅप गाड्यांची यादी',
      activePickupsCount: 'सक्रिय गाड्या',
      minsAway: 'मिनिटे अंतरावर',
      callCollector: 'कॉल करा',
      audioWelcomePrompt:
        'अधिकृत रिसायकलर पोर्टलमध्ये आपले स्वागत आहे. कबाडीवाल्याचे क्यूआर कोड स्कॅन करा आणि थेट खरेदी दर सेट करा.',
      audioScanInstruction: 'कबाडीवाल्याचा क्यूआर कोड कॅमेऱ्यासमोर व्यवस्थित धरा.',
    },

    nav: {
      home: 'घर',
      portal: 'पोर्टल',
      ledger: 'खातेवही',
      support: 'मदत',
    },

    offlineToast: {
      title: 'तुम्ही ऑफलाइन आहात (Offline)',
      desc: 'इंटरनेट बंद झाले आहे. काळजी करू नका, तुमच्या वजनाच्या नोंदी आणि पावत्या फोनमध्ये सुरक्षित सेव्ह आहेत आणि इंटरनेट सुरू झाल्यावर आपोआप सिंक होतील.',
      warningBadge: 'ऑफलाइन सुरक्षा सक्रिय',
      listenBtn: 'ऐका (Listen)',
      dismissBtn: 'समजले (OK)',
      recheckBtn: 'तपासा',
      speechText:
        'लक्ष द्या: तुम्ही सध्या ऑफलाइन आहात. तुमचा सर्व डेटा फोनमध्ये सुरक्षित आहे आणि इंटरनेट सुरू होताच आपोआप सिंक होईल.',
      onlineRestoredTitle: 'पुन्हा ऑनलाइन! (Back Online)',
      onlineRestoredDesc: 'इंटरनेट सुरू झाले आहे. सर्व नोंदी सिंक केल्या जात आहेत...',
    },
  },
};
