// =======================
// KP geometry utilities
// =======================

export function buildKPIndex(feature) {
    const coords = feature.geometry.coordinates;
  
    // 新形式: properties.raw_chainage_m
    // 旧形式: properties.chainage_m
    const chainageM =
      feature.properties.raw_chainage_m ??
      feature.properties.chainage_m;
  
    if (!Array.isArray(coords) || !Array.isArray(chainageM)) {
      throw new Error("coordinates または chainage_m/raw_chainage_m が存在しません");
    }
  
    if (coords.length !== chainageM.length) {
      throw new Error(
        `coordinates と chainage_m の数が一致しません: coordinates=${coords.length}, chainage_m=${chainageM.length}`
      );
    }
  
    return coords.map((c, i) => ({
      lon: c[0],
      lat: c[1],
      chainageM: chainageM[i],
      kp: chainageM[i] / 1000
    }));
  }
  
  // =======================
  // KP → 座標
  // =======================
  export function kpToLatLon(index, targetKP) {
    if (!index || index.length < 2) return null;
  
    if (targetKP <= index[0].kp) return index[0];
  
    if (targetKP >= index[index.length - 1].kp) {
      return index[index.length - 1];
    }
  
    for (let i = 0; i < index.length - 1; i++) {
      const a = index[i];
      const b = index[i + 1];
  
      if (targetKP >= a.kp && targetKP <= b.kp) {
        const t = (targetKP - a.kp) / (b.kp - a.kp);
  
        return {
          lon: a.lon + (b.lon - a.lon) * t,
          lat: a.lat + (b.lat - a.lat) * t,
          kp: targetKP,
          chainageM: targetKP * 1000,
          segmentIndex: i,
          t
        };
      }
    }
  
    return null;
  }