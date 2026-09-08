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

  // Weighing Screen
  weighingScreen: {
    headerTitle: string;
    mandiRateStr: string;
    chooseRecycler: string;
    availableBuyers: string;
    govtAuthorized: string;
    kmAway: string;
    offerRate: string;
    perKg: string;
    scaleWeight: string;
    maxCapacity: string;
    quickPresets: string;
    totalPayout: string;
    instantPaymentNote: string;
    pickupIn: string;
    changeBtn: string;
    eWastePass: string;
    environmentalImpact: string;
    finalPayout: string;
    confirmHandover: string;
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
    appName: 'Kabadiwala Connect',
    langSwitchTitle: 'भाषा चुनें',
    kabadiwalaRoleName: 'कबाड़ीवाला',
    recyclerRoleName: 'रिसाइक्लर',
    switchRoleBtn: 'भूमिका बदलें',
    verifiedPartner: 'सत्यापित साथी',
    cpcbAuthorized: 'CPCB अधिकृत',
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
      pageTitle: 'Kabadiwala Connect - कबाड़ीवाला डैशबोर्ड',
      greeting: 'नमस्ते, रामेश्वर जी! आज का कारोबार शुरू करें',
      voiceBannerTitle: 'आवाज़ से सुनें',
      voiceBannerSubtitle: 'निर्देश और मंडी भाव सुनने हेतु टैप करें',
      speakBtn: 'बोलें',
      audioWelcomePrompt:
        'Kabadiwala Connect में आपका स्वागत है। बड़ा हरा कैमरा बटन दबाकर कचरा स्कैन करें और तुरंत सरकारी मंडी भाव जानें।',
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
      pageTitle: 'Kabadiwala Connect - अधिकृत रिसाइक्लर पोर्टल',
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

    weighingScreen: {
      headerTitle: 'हैंडओवर एवं वजन दर्ज करें',
      mandiRateStr: 'मंडी भाव',
      chooseRecycler: 'नजदीकी रिसाइक्लर चुनें',
      availableBuyers: '2 उपलब्ध खरीदार',
      govtAuthorized: 'अधिकृत खरीदार (Govt. Authorized)',
      kmAway: 'KM दूर',
      offerRate: 'ऑफर भाव',
      perKg: 'प्रति किलो',
      scaleWeight: 'सटीक वजन भरें (Scale Weight)',
      maxCapacity: 'अधिकतम 40 KG क्षमता',
      quickPresets: 'त्वरित वजन चयन (Quick Presets)',
      totalPayout: 'कुल मिलने वाली रकम (TOTAL PAYOUT)',
      instantPaymentNote: 'कांटा और ग्रेड सत्यापन के बाद तत्काल भुगतान सुनिश्चित',
      pickupIn: 'पिकअप वैन X मिनट में उपलब्ध',
      changeBtn: 'बदलें',
      eWastePass: 'पर्यावरण साथी प्रमाण (E-Waste Pass)',
      environmentalImpact: 'इस हैंडओवर से 2.3 किलो हानिकारक भारी धातुएं सुरक्षित निस्तारित होंगी।',
      finalPayout: 'कुल बिक्री मूल्य (Final Payout)',
      confirmHandover: 'डील पक्की करें & हैंडओवर',
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
    appName: 'Kabadiwala Connect',
    langSwitchTitle: 'Select Language',
    kabadiwalaRoleName: 'Kabadiwala',
    recyclerRoleName: 'Recycler',
    switchRoleBtn: 'Switch Role',
    verifiedPartner: 'Verified Partner',
    cpcbAuthorized: 'CPCB Authorized',
    syncNow: 'Sync Now',
    syncedSuccess: 'All records synced successfully.',
    syncing: 'Syncing...',

    globalSpeech: {
      photoCapturedProcessing: 'Photo captured. Processing scrap details.',
      cameraInstruction: 'Place e-waste in front of the camera and say take photo.',
      supportCallingMsg: 'Calling E-waste safety helpline.',
      dataResetMsg: 'App data has been successfully reset.',
      receiptCopiedMsg: 'Receipt details copied to clipboard.',
    },

    kabadiwala: {
      pageTitle: 'Kabadiwala Connect - Kabadiwala Dashboard',
      greeting: "Hello, Rameshwar! Start today's scrap business",
      voiceBannerTitle: 'Listen via Voice',
      voiceBannerSubtitle: 'Tap to hear app instructions and live mandi rates',
      speakBtn: 'Listen',
      audioWelcomePrompt:
        'Welcome to Kabadiwala Connect. Press the big green camera button to scan scrap and get live government rates.',
      offlineModeTitle: 'Offline Mode Protected',
      offlineModeDesc: 'Weights and receipts are saved locally even without internet',
      syncPendingBtn: 'Sync Now',
      scanCtaTitle: 'Scan E-Waste',
      scanCtaSubtitle: 'Use AI camera to identify e-waste, verify grade and check price',
      scanCtaBadge: 'Camera Live',
      scanCtaAction: 'Start Scanning',
      earningsTitle: 'Total Earnings Today',
      earningsSubtitle: 'Direct bank / Cash received',
      weightTitle: 'Total Weight Today',
      weightSubtitle: 'Verified via digital scale',
      dealsTitle: 'Completed Deals',
      dealsSubtitle: 'Verified transaction receipts',
      calcTitle: 'Quick Price Estimator',
      calcProductLabel: 'Select Product',
      calcSubtitle: 'Adjust weight slider to instantly calculate scrap value',
      weightLabel: 'Weight (KG)',
      ratePerKgLabel: 'Selling Rate/KG',
      calcCostLabel: 'My Cost Rate',
      calcProfitLabel: 'Estimated Profit',
      estPayoutLabel: 'Est. Total Payout',
      weighThisNowBtn: 'Weigh on Scale',
      presetQuickWeights: 'Quick Weights:',
      mandiRatesTitle: 'Live Government Benchmark',
      mandiRatesSubtitle: 'Daily certified government scrap benchmark rates',
      listenAllRatesBtn: 'Listen to all rates via Audio',
      tapToWeigh: 'Tap to Weigh',
      audioRatesSpeech:
        'Today\'s live market rates: PCB Motherboard 280 Rupees per KG, Copper Wire 540 Rupees per KG, Lithium Battery 120 Rupees per KG.',
      cpcbNotice: '100% Certified legal disposal under CPCB E-Waste Rules 2022.',
    },

    recycler: {
      pageTitle: 'Kabadiwala Connect - Recycler Portal',
      intakeCenterActive: 'Intake Center Active',
      totalProcuredTitle: 'Total Procured',
      totalProcuredSubtitle: 'E-Waste Inflow Volume',
      totalDisbursedTitle: 'Total Disbursed',
      totalDisbursedSubtitle: 'Cash & UPI Disbursed',
      verifiedTokensTitle: 'Verified Tokens',
      verifiedTokensSubtitle: 'CPCB Certified Handovers',
      scanPassHeader: 'COLLECTION COUNTER',
      scanPassTitle: 'Scan Kabadiwala Token',
      scanPassDesc: 'Scan digital QR pass from kabadiwala\'s phone to accept scrap',
      scanPassAction: 'Scan QR Pass',
      scanningAction: 'Scanning QR...',
      validTokenFound: 'Valid Token Found',
      collectorLabel: 'Collector',
      payoutDueLabel: 'Payout Due',
      acceptPayBtn: 'Accept & Mark Paid',
      cancelBtn: 'Cancel',
      ratesManagerTitle: 'Your Live Purchase Rates',
      ratesManagerSubtitle: 'Set live benchmark purchase rates for local collectors',
      govtBaseRateLabel: 'Govt Base Rate:',
      rateUpdatedSuccess: 'rate updated successfully!',
      incomingVansTitle: 'Incoming Scrap Vans',
      activePickupsCount: 'Active Pickups',
      minsAway: 'mins away',
      callCollector: 'Call',
      audioWelcomePrompt:
        'Welcome to the Recycler Portal. Scan kabadiwala QR codes and set live purchase rates.',
      audioScanInstruction: 'Hold the kabadiwala QR code properly in front of the camera.',
    },

    nav: {
      home: 'Home',
      portal: 'Portal',
      ledger: 'Ledger',
      support: 'Help',
    },

    weighingScreen: {
      headerTitle: 'Record Weight & Handover',
      mandiRateStr: 'Market Rate',
      chooseRecycler: 'Choose Nearby Recycler',
      availableBuyers: '2 Buyers Available',
      govtAuthorized: 'Govt. Authorized',
      kmAway: 'KM Away',
      offerRate: 'Offer Rate',
      perKg: 'per KG',
      scaleWeight: 'Enter Scale Weight',
      maxCapacity: 'Max 40 KG Capacity',
      quickPresets: 'Quick Presets',
      totalPayout: 'TOTAL PAYOUT',
      instantPaymentNote: 'Instant payment assured after scale and grade verification',
      pickupIn: 'Pickup van available in X mins',
      changeBtn: 'Change',
      eWastePass: 'E-Waste Pass',
      environmentalImpact: 'This handover will safely dispose of 2.3 kg of hazardous heavy metals.',
      finalPayout: 'Final Payout',
      confirmHandover: 'Confirm Deal & Handover',
    },

    offlineToast: {
      title: 'You are Offline',
      desc: 'Internet connection is lost. Don\'t worry, your weight logs and receipts are safely saved on the phone and will sync automatically when online.',
      warningBadge: 'Offline Protection Active',
      listenBtn: 'Listen',
      dismissBtn: 'OK',
      recheckBtn: 'Recheck',
      speechText:
        'Attention: You are currently offline. All your data is safely saved on your phone and will automatically sync once the internet is restored.',
      onlineRestoredTitle: 'Back Online!',
      onlineRestoredDesc: 'Internet is restored. Syncing all records...',
    },
  },

  mr: {
    appName: 'Kabadiwala Connect',
    langSwitchTitle: 'भाषा निवडा',
    kabadiwalaRoleName: 'कबाडीवाला',
    recyclerRoleName: 'रिसायकलर',
    switchRoleBtn: 'भूमिका बदला',
    verifiedPartner: 'सत्यापित साथी',
    cpcbAuthorized: 'CPCB अधिकृत',
    syncNow: 'सिंक करा',
    syncedSuccess: 'सर्व रेकॉर्ड यशस्वीरित्या सिंक झाले आहेत.',
    syncing: 'सिंक होत आहे...',

    globalSpeech: {
      photoCapturedProcessing: 'फोटो काढला आहे. तपशील तपासला जात आहे.',
      cameraInstruction: 'कॅमेऱ्यासमोर ई-कचरा किंवा मदरबोर्ड धरा आणि फोटो काढा.',
      supportCallingMsg: 'ई-कचरा सुरक्षा हेल्पलाइनला कॉल करत आहे.',
      dataResetMsg: 'ॲप डेटा यशस्वीरित्या रीसेट केला आहे.',
      receiptCopiedMsg: 'पावतीचा तपशील कॉपी केला आहे.',
    },

    kabadiwala: {
      pageTitle: 'Kabadiwala Connect - कबाडीवाला डॅशबोर्ड',
      greeting: 'नमस्कार, रामेश्वर जी! आजचा ई-कचरा व्यापार सुरू करा',
      voiceBannerTitle: 'आवाजाने ऐका',
      voiceBannerSubtitle: 'सूचना आणि थेट बाजार भाव ऐकण्यासाठी टॅप करा',
      speakBtn: 'ऐका',
      audioWelcomePrompt:
        'Kabadiwala Connect मध्ये आपले स्वागत आहे. मोठा हिरवा कॅमेरा बटण दाबून कचरा स्कॅन करा आणि थेट सरकारी बाजार भाव पहा.',
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
      pageTitle: 'Kabadiwala Connect - अधिकृत रिसायकलर पोर्टल',
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

    weighingScreen: {
      headerTitle: 'हँडओव्हर आणि वजन नोंदवा',
      mandiRateStr: 'बाजार भाव',
      chooseRecycler: 'जवळचा रिसायकलर निवडा',
      availableBuyers: '२ खरेदीदार उपलब्ध',
      govtAuthorized: 'अधिकृत खरेदीदार (Govt. Authorized)',
      kmAway: 'KM दूर',
      offerRate: 'ऑफर दर',
      perKg: 'प्रति किलो',
      scaleWeight: 'अचूक वजन भरा (Scale Weight)',
      maxCapacity: 'कमाल ४० KG क्षमता',
      quickPresets: 'झटपट वजन निवड (Quick Presets)',
      totalPayout: 'एकूण मिळणारी रक्कम (TOTAL PAYOUT)',
      instantPaymentNote: 'काटा आणि ग्रेड पडताळणीनंतर त्वरित पेमेंटची खात्री',
      pickupIn: 'पिकअप व्हॅन X मिनिटांत उपलब्ध',
      changeBtn: 'बदला',
      eWastePass: 'पर्यावरण साथी प्रमाण (E-Waste Pass)',
      environmentalImpact: 'या हँडओव्हरमुळे २.३ किलो हानिकारक जड धातूंची सुरक्षित विल्हेवाट लावली जाईल.',
      finalPayout: 'एकूण विक्री मूल्य (Final Payout)',
      confirmHandover: 'डील पक्की करा & हँडओव्हर',
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
