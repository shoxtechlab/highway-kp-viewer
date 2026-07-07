// =======================
// UIレイアウト定数（固定）
// =======================
export const LAYOUT = {

    width: 800,
    breakpoint: 800,
    marginTop: 50,
    marginBottom: 50,

    centerX: 400,

    roadWidth: 48,
    roadGap: 24,

    labelFontSize: 16,
    scaleFontSize: 12,

    labelWidth: 120,
    labelHeight: 24,
    labelMargin: 30
};


// =======================
// カラーパレット
// =======================
export const COLORS = {

    road: "#999",

    bridge: "#ff9800",
    tunnel: "#2196f3",

    labelFill: "#ffffff",
    labelStroke: "#444444",
    leaderLine: "#666666",

    icsaGreen: "#006c2a",
    icsaWhite: "#ffffff",

    sicPurple: "#81007c",

    bridgeLabel: "#fb8a007d",
    tunnelLabel: "#6A1B9A",

    labelText: "#ffffff",
};


// =======================
// UI状態（動的）
// =======================
export const STATE = {

    // スケール制御
    baseScale: 30,
    scale: 30,
    zoom: 1,

    // デバイス状態
    isMobile: false
};


// =======================
// KP設定
// =======================
export const KP_STEP = 0.05; // km