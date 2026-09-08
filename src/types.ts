export type UserRole = 'kabadiwala' | 'recycler';

export type ScreenName =
  | 'home'
  | 'scanner'
  | 'weighing'
  | 'receipt'
  | 'ledger'
  | 'support'
  | 'login'
  | 'recycler_dashboard';

export type Language = 'hi' | 'en' | 'mr';

export interface UserProfile {
  role: UserRole;
  name: string;
  nameEn?: string;
  nameMr?: string;
  nameHi?: string;
  phone: string;
  businessName: string;
  businessNameEn?: string;
  businessNameMr?: string;
  businessNameHi?: string;
  cpcbId?: string;
  zone: string;
  zoneEn?: string;
  zoneMr?: string;
  zoneHi?: string;
  avatarInitials: string;
  verifiedBadge: string;
  isOpen?: boolean;
}

export interface ScrapItem {
  id: string;
  nameHi: string;
  nameEn: string;
  nameMr?: string;
  categoryHi: string;
  categoryEn: string;
  categoryMr?: string;
  grade: string;
  baseRate: number; // e.g. 280
  marketMinRate: number; // 280
  marketMaxRate: number; // 310
  rateChange: string; // "+15 चढ़ा" or "+4.2% आज"
  rateTrend: 'up' | 'down' | 'stable';
  imageUrl: string;
  isHazardous?: boolean;
  hazardTypeHi?: string;
  hazardTypeEn?: string;
  hazardTypeMr?: string;
  hazardRiskHi?: string;
  hazardRiskEn?: string;
  hazardRiskMr?: string;
}

export interface Recycler {
  id: string;
  nameHi: string;
  nameEn: string;
  nameMr?: string;
  cpcbId: string;
  addressHi: string;
  addressEn: string;
  addressMr?: string;
  distanceKm: number;
  rating: number;
  pickupsCount: number;
  offerRate: number;
  phone: string;
  isGovtAuthorized: boolean;
  vanArrivalMins?: number;
  isOpen?: boolean;
}

export interface Transaction {
  id: string;
  txnNumber: string;
  timestamp: Date;
  scrapItem: ScrapItem;
  weightKg: number;
  ratePerKg: number;
  totalPayout: number;
  recycler: Recycler;
  isSynced: boolean;
  paymentMode: string;
  handoverPassed: boolean;
  collectorName?: string;
  collectorCpcbId?: string;
  geotag?: string;
  manifestHash?: string;
  verifiedNetWeightKg?: number;
  scaleDiscrepancyKg?: number;
}

export interface IncomingLead {
  id: string;
  lotNumber: string;
  collectorName: string;
  collectorPhone: string;
  collectorCpcbId: string;
  collectorZone: string;
  distanceKm: number;
  scrapItem: ScrapItem;
  estimatedWeightKg: number;
  offeredRate: number;
  totalOfferedAmount: number;
  photoUrl: string;
  aiConfidence: number;
  status: 'pending' | 'accepted_pickup' | 'accepted_dropoff' | 'countered' | 'rejected' | 'received';
  createdAt: string;
  counterRate?: number;
  counterAmount?: number;
  pickupEtaMins?: number;
  notes?: string;
}

export interface EprCertificate {
  cpcbNumber: string;
  spcbState: string;
  validTill: string;
  authorizedCapacityMT: number;
  currentProcessedMT: number;
  authorizedMaterials: string[];
  certificateFileName: string;
  verificationStatus: 'verified' | 'pending_audit' | 'expired';
}

export interface BulkRateTier {
  scrapId: string;
  minWeightKg: number;
  premiumBonusPerKg: number;
}
