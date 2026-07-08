import { calcHeading } from "./utils.js";
import { kpToLatLon } from "./kpGeo.js";

// =======================
// 前後KP
// =======================
export function getNeighborKP(kp, direction) {
  const STEP = 0.05; // km固定

  if (direction === "up") {
    return {
      front: kp - STEP,
      back: kp + STEP
    };
  }

  return {
    front: kp + STEP,
    back: kp - STEP
  };
}

// =======================
// SV URL
// =======================
export function buildSVUrl(lat, lon, heading) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}&heading=${heading}&pitch=0`;
}

// =======================
// KP → StreetView
// =======================
export function kpToStreetView(index, kp, direction) {
  const pCenter = kpToLatLon(index, kp);

  const { front, back } = getNeighborKP(kp, direction);

  const pFront = kpToLatLon(index, front);
  const pBack = kpToLatLon(index, back);

  if (!pCenter || !pFront || !pBack) return null;

  const heading = calcHeading(pBack, pFront);

  return {
    lat: pCenter.lat,
    lon: pCenter.lon,
    heading,
    url: buildSVUrl(pCenter.lat, pCenter.lon, heading)
  };
}

// =======================
// UI model
// =======================
export function buildKPViewModel(kp, lane, facilityText) {
  return {
    directionText: lane === "up" ? "上り線" : "下り線",
    kp,
    facility: facilityText || "本線"
  };
}