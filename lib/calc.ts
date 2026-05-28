import type { Influencer } from "./types";

const safe = (n: number | undefined | null) =>
  n !== undefined && n !== null && Number.isFinite(n) ? n : undefined;

const div = (a?: number, b?: number) => {
  const aa = safe(a);
  const bb = safe(b);
  if (aa === undefined || bb === undefined || bb === 0) return null;
  return aa / bb;
};

const sub = (a?: number, b?: number) => {
  const aa = safe(a);
  const bb = safe(b);
  if (aa === undefined || bb === undefined) return null;
  return aa - bb;
};

export function coutInflu(i: Influencer): number | null {
  if (i.paymentType === "fixed") {
    const perVideo = safe(i.costPerVideo);
    const nbVideos = safe(i.nbVideos);
    if (perVideo === undefined || nbVideos === undefined) return null;
    return perVideo * nbVideos;
  }
  const rpm = safe(i.rpmGiven);
  const vues = safe(i.vues);
  if (rpm === undefined || vues === undefined) return null;
  return (rpm * vues) / 1000;
}

export function revenuParUser(i: Influencer) {
  return div(i.revenu, i.users);
}

export function rpmReel(i: Influencer) {
  const r = safe(i.revenu);
  const v = safe(i.vues);
  if (r === undefined || v === undefined || v === 0) return null;
  return (r / v) * 1000;
}

export function panierMoyen(i: Influencer) {
  return div(i.revenu, i.nbClients);
}

export function nbUserPar1000Vues(i: Influencer) {
  const u = safe(i.users);
  const v = safe(i.vues);
  if (u === undefined || v === undefined || v === 0) return null;
  return (u / v) * 1000;
}

export function coutAcqParUser(i: Influencer) {
  const c = coutInflu(i);
  return div(c ?? undefined, i.users);
}

export function coutBrutParClient(i: Influencer) {
  const c = coutInflu(i);
  return div(c ?? undefined, i.nbClients);
}

export function marge(i: Influencer) {
  const c = coutInflu(i);
  return sub(i.revenu, c ?? undefined);
}

export function roi(i: Influencer) {
  const c = coutInflu(i);
  const r = safe(i.revenu);
  if (c === null || c === undefined || c === 0 || r === undefined) return null;
  return ((r - c) / c) * 100;
}

export type AggregatedMetrics = {
  revenu: number;
  coutInflu: number;
  marge: number;
  roi: number | null;
  users: number;
  vues: number;
  nbClients: number;
  count: number;
};

export function aggregate(items: Influencer[]): AggregatedMetrics {
  let revenu = 0;
  let cout = 0;
  let users = 0;
  let vues = 0;
  let nbClients = 0;
  for (const i of items) {
    revenu += safe(i.revenu) ?? 0;
    cout += coutInflu(i) ?? 0;
    users += safe(i.users) ?? 0;
    vues += safe(i.vues) ?? 0;
    nbClients += safe(i.nbClients) ?? 0;
  }
  const marge = revenu - cout;
  const roi = cout > 0 ? (marge / cout) * 100 : null;
  return { revenu, coutInflu: cout, marge, roi, users, vues, nbClients, count: items.length };
}
