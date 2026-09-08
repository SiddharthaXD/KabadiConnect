import { ScrapItem, Recycler, Transaction, UserProfile } from '../types';

export const DEFAULT_KABADIWALA_PROFILE: UserProfile = {
  role: 'kabadiwala',
  name: 'रामेश्वर कबाड़ीवाला',
  phone: '+91 98765 43210',
  businessName: 'रामेश्वर स्क्रैप ट्रेडर्स',
  zone: 'ओखला एवं मयूर विहार क्लस्टर, दिल्ली',
  avatarInitials: 'RK',
  verifiedBadge: 'सत्यापित कबाड़ीवाला',
};

export const DEFAULT_RECYCLER_PROFILE: UserProfile = {
  role: 'recycler',
  name: 'राजेश कुमार शर्मा',
  phone: '+91 98110 55443',
  businessName: 'ग्रीनटेक ऑथराइज़्ड रिसाइक्लर्स Pvt Ltd',
  cpcbId: 'CPCB-DL-8891-EW',
  zone: 'ओखला फेज-2 रीसाइक्लिंग हब, दिल्ली',
  avatarInitials: 'GR',
  verifiedBadge: 'CPCB अधिकृत रिसाइक्लर',
};

export const SCRAP_ITEMS: ScrapItem[] = [
  {
    id: 'pcb-motherboard',
    nameHi: 'PCB मदरबोर्ड',
    nameEn: 'Printed Circuit Board (High-grade PCB)',
    nameMr: 'PCB मदरबोर्ड (सर्किट बोर्ड)',
    categoryHi: 'कंप्यूटर मदरबोर्ड / सर्वर स्क्रैप',
    categoryEn: 'Computer / Mobile Board',
    categoryMr: 'संगणक मदरबोर्ड / सर्व्हर स्क्रॅप',
    grade: 'Grade A',
    baseRate: 280,
    marketMinRate: 280,
    marketMaxRate: 310,
    rateChange: '+₹15 चढ़ा',
    rateTrend: 'up',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAepkrxZACyHS-cL9Gh3nwH-dxWBCvciKiMuuRuPk-uMZM-A3zIYyG5wtT60X4-KCwUfFd4qdRfzXonsGJ_hOOJxYOHRs-fuCqPKfXmo2kLNiIxZdcY-qMBbne0p4zn_mId-K2fGQ_Kz7n1-N2VsAFPOaqC313XrLl1bjKSZEYTjuGvruWyfhXGL57WlZ0tkfr3OutxfF7tqkWwg5lzxBGnoYwHxmDdsrrxjoxGf_UzbMuv4gNMrkIK',
    isHazardous: false,
  },
  {
    id: 'copper-wire',
    nameHi: 'तांबा तार (Copper)',
    nameEn: 'Bright Stripped Copper Wire',
    nameMr: 'तांब्याची तार (कॉपर वायर)',
    categoryHi: 'चमकदार छिला हुआ तांबा तार',
    categoryEn: 'Bright Wire Stripped',
    categoryMr: 'चमकदार सोललेली तांब्याची तार',
    grade: 'Grade A99',
    baseRate: 540,
    marketMinRate: 530,
    marketMaxRate: 560,
    rateChange: '+₹20 चढ़ा',
    rateTrend: 'up',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjyghBELdYp30RmskQLVrn8xLWPGVnC751fQ0HGldnv9b_yRao3Yq6Fn0z45gkS4uE3vuQK5FHXqElmGeyt5QvJh09mU1SwKTdeY3HR6molaUaEQ0zZ9TmfU1wv5yxuDiGhLHLgIslDJ3j-6GFi38NQbi0OH8UVAPwSaAywU5rTBHmfPdh8WMQf64GSLbdNchksU63MQdfxPLpwSVVBPtf5mx3CUWHAlRkCw-2ETVvVm_Ae1m5iFp_',
    isHazardous: false,
  },
  {
    id: 'li-ion-battery',
    nameHi: 'बैटरी (Li-ion)',
    nameEn: 'Lithium-ion Battery Pack',
    nameMr: 'लिथियम-आयन बॅटरी पॅक',
    categoryHi: 'मोबाइल व लैपटॉप बैटरी पैक',
    categoryEn: 'Mobile & Laptop Pack',
    categoryMr: 'मोबाईल व लॅपटॉप बॅटरी',
    grade: 'Grade Standard',
    baseRate: 120,
    marketMinRate: 115,
    marketMaxRate: 130,
    rateChange: 'स्थिर (Stable)',
    rateTrend: 'stable',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAsina9efgFnY9OS4st0mySgGdZtjC4iRnPIAXF-1DUl3zSgTE2DVX-7Z8RFyjyRnCATHxdQpVabb-B8dWBTVjcwpNYaOZR4ErQPSMfK7V78jQ9ZkcmLJ7LkF_w93iUuQFuZbasRgnIVRljPtY5ATp7CO-NBYaDrNcEfFagA-PSCsiuODB7rm5qaXkuBDFLElElNzTpKb-eO0-AJeN5-1qHrHtqHd_bSUPhSo7c5x4J14ePVDExXa83',
    isHazardous: true,
    hazardTypeHi: 'लिथियम बैटरी (Lithium-ion Battery Pack)',
    hazardTypeEn: 'Lithium-ion Battery Pack',
    hazardTypeMr: 'लिथियम-आयन बॅटरी पॅक (Lithium-ion Battery)',
    hazardRiskHi: 'आग व विस्फोट का ख़तरा (Risk of Fire & Toxic Leak)',
    hazardRiskEn: 'Risk of Fire & Toxic Chemical Fumes',
    hazardRiskMr: 'आग व स्फोटाचा धोका (Risk of Fire & Toxic Leak)',
  },
];

export const CAMERA_PREVIEW_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDfGgb9PtkTWCdZx1VMNXHvVIFIYZkbVEWwwO43a6eraeEdUY0AuodNEvojSrgf_jlxFF8u1KtSENUiIpvT_9uJr87Y6wDWXKauQzxg7gy-9Ja-lo8FddSydt3RS6Ocfu8_lkn00ngCADu4fKiMfduDMD303xrCBhf0SBxuzC0XpJNLPEv6xKiXaQ22pmVd-PqpWtaK3KX8oUtUGoMoQ0OmPXkrq_7mzmhUI8EoOsUFmSwQus_7PFNr';

export const WEIGHING_PCB_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhNw2JUBBbKmcJhnVICbEIM50tifknxYlGZ16C1LxX-WuBmpDQDn0FiI0hI6ZQOP2D7IuQdhEfFjJ4xx-46IjPTSAJEKR3SXFsn73j6b3e6f5rtUf76lxKhIKn1DKiIdoMQKqiUd_eK7QL9DE-vG8aOxFI8zhZrJjh6WkV5yI3pGip_ueXlByqumn_BVbcsX4C6a6mls66rmq5hrRlmamiqbUU6NvOr7rp8GW7WgAmbdJUDs2Vduy';

export const RECYCLERS: Recycler[] = [
  {
    id: 'greentech-recyclers',
    nameHi: 'ग्रीनटेक ऑथराइज़्ड रिसाइक्लर्स',
    nameEn: 'Greentech Recyclers Pvt Ltd',
    cpcbId: 'DL-8891',
    addressHi: 'ओखला फेज-2, दिल्ली',
    addressEn: 'Okhla Phase-2, New Delhi',
    distanceKm: 1.8,
    rating: 4.8,
    pickupsCount: 240,
    offerRate: 300,
    phone: '+91 98110 24890',
    isGovtAuthorized: true,
    vanArrivalMins: 15,
  },
  {
    id: 'eco-waste-solution',
    nameHi: 'इको-वेस्ट सॉल्यूशन',
    nameEn: 'Eco-Waste Solution Pvt Ltd',
    cpcbId: 'DL-4412',
    addressHi: 'मयूर विहार, दिल्ली',
    addressEn: 'Mayur Vihar, New Delhi',
    distanceKm: 3.2,
    rating: 4.6,
    pickupsCount: 120,
    offerRate: 290,
    phone: '+91 98730 55120',
    isGovtAuthorized: true,
    vanArrivalMins: 25,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    txnNumber: '#TXN-89421',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    scrapItem: SCRAP_ITEMS[0], // PCB
    weightKg: 15.5,
    ratePerKg: 300,
    totalPayout: 4650,
    recycler: RECYCLERS[0],
    isSynced: false,
    paymentMode: 'नकद / UPI',
    handoverPassed: true,
  },
  {
    id: 'tx-2',
    txnNumber: '#TXN-89390',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    scrapItem: SCRAP_ITEMS[1], // Copper
    weightKg: 12.0,
    ratePerKg: 540,
    totalPayout: 6480,
    recycler: RECYCLERS[0],
    isSynced: true,
    paymentMode: 'UPI (PhonePe)',
    handoverPassed: true,
  },
  {
    id: 'tx-3',
    txnNumber: '#TXN-89215',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
    scrapItem: SCRAP_ITEMS[0], // PCB
    weightKg: 13.5,
    ratePerKg: 275,
    totalPayout: 3720,
    recycler: RECYCLERS[1],
    isSynced: true,
    paymentMode: 'नकद (Cash)',
    handoverPassed: true,
  },
];
