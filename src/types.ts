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
  phone: string;
  businessName: string;
  cpcbId?: string;
  zone: string;
  avatarInitials: string;
  verifiedBadge: string;
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
}
