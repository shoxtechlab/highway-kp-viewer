import { LAYOUT, STATE } from "./config.js";
import { createSVG } from "./utils.js";

import { drawRoad } from "./road.js";
import { buildStructureCandidates } from "./structure.js";
import { buildFacilityCandidates } from "./facility.js";
import { layoutLabels } from "./layout.js";
import { drawScale } from "./scale.js";

/**
 * 高速道路SVG生成（純粋描画 + 入力フック）
 */
export function createExpresswaySvg(road, onClick) {

    //------------------------------------
    // 高さ（論理座標）
    //------------------------------------

    const height =
        road.length * STATE.scale +
        LAYOUT.marginTop +
        LAYOUT.marginBottom;

    //------------------------------------
    // SVG本体
    //------------------------------------

    const svg = createSVG("svg", {
        width: STATE.isMobile ? "100%" : LAYOUT.width,
        viewBox: `0 0 ${LAYOUT.width} ${height}`,
        preserveAspectRatio: "xMinYMin meet"
    });

    //------------------------------------
    // レイヤー生成
    //------------------------------------

    const layerNames = [
        "background",
        "road",
        "structure",
        "facility",
        "scale",
        "marker",
        "overlay",
        "popup"
    ];

    const layers = {};

    layerNames.forEach(name => {

        const layer = createSVG("g", {
            id: `${name}-layer`
        });

        svg.appendChild(layer);

        layers[name] = layer;
    });

    //------------------------------------
    // 描画
    //------------------------------------

    drawScale(layers.scale, road.length);
    drawRoad(layers.road, road);
    // drawStructures(layers.structure, road.structures);

    const structure = buildStructureCandidates(road.structures);

    structure.bodies.forEach(body => {
        layers.structure.appendChild(body);
    });

    const facility = buildFacilityCandidates(road.facilities);

    const candidates = [
        ...structure.candidates,
        ...facility.candidates
    ];

    const upCandidates = candidates.filter(c => c.direction === "up");
    const downCandidates = candidates.filter(c => c.direction === "down");

    const upLayout = layoutLabels(
        upCandidates,
        c => c.centerY,
        c => c.minY,
        c => c.maxY,
        LAYOUT.labelHeight,
        c => c.priority
    );

    const downLayout = layoutLabels(
        downCandidates,
        c => c.centerY,
        c => c.minY,
        c => c.maxY,
        LAYOUT.labelHeight,
        c => c.priority
    );

    [...upLayout, ...downLayout].forEach(({ item, y }) => {
        item.draw(
            item.type === "structure"
                ? layers.structure
                : layers.facility,
            y
        );
    });

    //------------------------------------
    // 🎯 クリックイベント（外から注入）
    //------------------------------------

    if (typeof onClick === "function") {

        svg.addEventListener("click", (e) => {
            onClick(e, svg, road);
        });

    }

    return svg;
}