import { LAYOUT } from "./config.js";
import { createSVG, kpToY } from "./utils.js";

/**
 * KP目盛り描画
 */
export function drawScale(layer, roadLength) {

    const step = 5; // 5km刻み（後で可変化）

    for (let kp = 0; kp <= roadLength; kp += step) {

        const y = kpToY(kp);

        //--------------------------------
        // グループ
        //--------------------------------

        const g = createSVG("g", {
            class: "scale-item"
        });

        //--------------------------------
        // ライン
        //--------------------------------

        g.appendChild(createSVG("line", {
            x1: 0,
            y1: y,
            x2: 10,
            y2: y,
            stroke: "#999",
            "stroke-width": 1
        }));

        //--------------------------------
        // テキスト
        //--------------------------------

        const text = createSVG("text", {
            x: 15,
            y: y + 4,
            "font-size": LAYOUT.scaleFontSize,
            fill: "#666"
        });

        text.textContent = `${kp} km`;

        g.appendChild(text);

        layer.appendChild(g);
    }
}