import { calcHeading } from "./utils.js";

export function buildKPIndex(feature) {
  const coords = feature.geometry.coordinates;
  const chainageM = feature.properties.chainage_m;

  if (!Array.isArray(coords) || !Array.isArray(chainageM)) {
    throw new Error("coordinates または chainage_m が存在しません");
  }

  if (coords.length !== chainageM.length) {
    throw new Error(
      `coordinates と chainage_m の数が一致しません: coordinates=${coords.length}, chainage_m=${chainageM.length}`
    );
  }

  return coords.map((c, i) => ({
    lon: c[0],
    lat: c[1],
    kp: chainageM[i] / 1000
  }));
}

// =======================
// KP → 座標
// =======================
export function kpToLatLon(index, targetKP) {

  if (!index || index.length < 2) return null;

  if (targetKP <= index[0].kp) return index[0];
  if (targetKP >= index[index.length - 1].kp)
    return index[index.length - 1];

  for (let i = 0; i < index.length - 1; i++) {

    const a = index[i];
    const b = index[i + 1];

    if (targetKP >= a.kp && targetKP <= b.kp) {

      const t = (targetKP - a.kp) / (b.kp - a.kp);

      return {
        lon: a.lon + (b.lon - a.lon) * t,
        lat: a.lat + (b.lat - a.lat) * t
      };
    }
  }

  return null;
}

// =======================
// 前後KP
// =======================
export function getNeighborKP(kp, direction) {

  const STEP = 0.05; // km固定（あなたの設計）

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