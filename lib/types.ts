export type PaymentType = "fixed" | "rpm";

export type Platform = "tiktok" | "instagram" | "youtube" | "snapchat" | "x" | "other";

export type Influencer = {
  id: string;
  appId: string;
  name: string;
  handle?: string;
  platform?: Platform;
  paymentType: PaymentType;
  launched?: boolean;
  rpmGiven?: number;
  costPerVideo?: number;
  nbVideos?: number;
  revenu?: number;
  users?: number;
  vues?: number;
  nbClients?: number;
  notes?: string;
  createdAt: string;
};

export type App = {
  id: string;
  name: string;
  emoji?: string;
  logoUrl?: string;
  accentColor?: string;
  createdAt: string;
};

export type PresetKey = "rose" | "ocean" | "forest" | "sunset" | "violet" | "mono" | "custom";

export type Settings = {
  themeMode: "dark" | "light";
  preset: PresetKey;
  customAccent?: string;
};

export type ExportPayload = {
  version: 1;
  exportedAt: string;
  apps: App[];
  influencers: Influencer[];
  settings: Settings;
};
