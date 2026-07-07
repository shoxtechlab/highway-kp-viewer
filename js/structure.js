import { LAYOUT, COLORS } from "./config.js";
import {
    createSVG,
    kpToY,
    getUpRoadX,
    getDownRoadX
} from "./utils.js";
import { getLabelStyle } from "./styleRules.js";

export function drawStructures(layer, structures) {

    //------------------------------------
    // ① 区間本体（全件描画）
    //------------------------------------

    structures.forEach(structure => {

        if (structure.up) {
            layer.appendChild(
                createStructureBody(
                    structure,
                    structure.up,
                    "up"
                )
            );
        }

        if (structure.down) {
            layer.appendChild(
                createStructureBody(
                    structure,
                    structure.down,
                    "down"
                )
            );
        }

    });

    //------------------------------------
    // ② ラベルレイアウト計算
    //------------------------------------

    const upLabels = layoutLabels(

        structures.filter(s => s.up),

        s => kpToY((s.up.start + s.up.end) / 2),

        s => kpToY(s.up.start) + LAYOUT.labelHeight / 2,

        s => kpToY(s.up.end) - LAYOUT.labelHeight / 2,

        LAYOUT.labelHeight + 4,

        s => s.up.end - s.up.start
    );

    const downLabels = layoutLabels(

        structures.filter(s => s.down),

        s => kpToY((s.down.start + s.down.end) / 2),

        s => kpToY(s.down.start) + LAYOUT.labelHeight / 2,

        s => kpToY(s.down.end) - LAYOUT.labelHeight / 2,

        LAYOUT.labelHeight + 4,

        s => s.down.end - s.down.start
    );

    //------------------------------------
    // ③ ラベルのみ描画
    //------------------------------------

    upLabels.forEach(({ item, y }) => {

        layer.appendChild(
            createStructureLabel(
                item,
                item.up,
                "up",
                y
            )
        );

    });

    downLabels.forEach(({ item, y }) => {

        layer.appendChild(
            createStructureLabel(
                item,
                item.down,
                "down",
                y
            )
        );

    });

}

/**
 * 区間1件を描画
 */
function createStructureBody(structure, data, direction, labelY) {

    const group = createSVG("g", {
        class: "structure"
    });

    const startY = kpToY(data.start);
    const endY = kpToY(data.end);

    const roadX =
        direction === "up"
            ? getUpRoadX()
            : getDownRoadX();

    //------------------------------------
    // 区間本体
    //------------------------------------

    group.appendChild(createSVG("rect", {
        "data-name" : structure.name,
        class: "structure-body",
        "data-direction": direction,

        x: roadX,
        y: startY,
        width: LAYOUT.roadWidth,
        height: endY - startY,

        fill: getStructureColor(structure.type),
        opacity: 0.6
    }));

    return group;
}

function createStructureLabel(structure, data, direction, labelY) {
    //------------------------------------
    // ラベル
    //------------------------------------
    const group = createSVG("g", {
        class: "structure"
    });
    group.appendChild(
        createLabel(
            structure,
            data,
            direction,
            labelY
        )
    );

    return group;
}

export function buildStructureCandidates(structures) {

    const bodies = [];
    const candidates = [];

    structures.forEach(structure => {

        if (structure.up) {

            bodies.push(
                createStructureBody(
                    structure,
                    structure.up,
                    "up"
                )
            );

            candidates.push({
                type: "structure",
                direction: "up",
                required: false,

                centerY: kpToY(
                    (structure.up.start + structure.up.end) / 2
                ),

                minY:
                    kpToY(structure.up.start) -
                    LAYOUT.labelHeight,

                maxY:
                    kpToY(structure.up.end) +
                    LAYOUT.labelHeight,

                priority:
                    structure.up.end - structure.up.start,

                draw(layer, y) {
                    layer.appendChild(
                        createStructureLabel(
                            structure,
                            structure.up,
                            "up",
                            y
                        )
                    );
                }
            });
        }

        if (structure.down) {

            bodies.push(
                createStructureBody(
                    structure,
                    structure.down,
                    "down"
                )
            );

            candidates.push({
                type: "structure",
                direction: "down",
                required: false,

                centerY: kpToY(
                    (structure.down.start + structure.down.end) / 2
                ),

                minY:
                    kpToY(structure.down.start) -
                    LAYOUT.labelHeight,

                maxY:
                    kpToY(structure.down.end) +
                    LAYOUT.labelHeight,

                priority:
                    structure.down.end - structure.down.start,

                draw(layer, y) {
                    layer.appendChild(
                        createStructureLabel(
                            structure,
                            structure.down,
                            "down",
                            y
                        )
                    );
                }
            });
        }

    });

    return {
        bodies,
        candidates
    };
}


function createLabel(structure, data, direction, labelY) {
    const style = getLabelStyle({
        kind: "structure",
        ...structure
    });

    const fixedKp =
        direction === "up"
            ? data.end
            : data.start;

    const group = createSVG("g", {
        "data-name": structure.name,
        class: "structure-label",
        "data-kp": fixedKp,
        "data-direction": direction
    });

    const anchorY = kpToY((data.start + data.end) / 2);
    const y = labelY ?? anchorY;

    const roadEdge =
        direction === "up"
            ? getUpRoadX()
            : getDownRoadX() + LAYOUT.roadWidth;

    const boxX =
        direction === "up"
            ? roadEdge - LAYOUT.labelMargin - LAYOUT.labelWidth
            : roadEdge + LAYOUT.labelMargin;

    group.appendChild(createSVG("line", {
        x1: direction === "up"
            ? boxX + LAYOUT.labelWidth
            : boxX,
        y1: y,
        x2: roadEdge,
        y2: anchorY,
        stroke: COLORS.leaderLine,
        "stroke-width": 1.5,
        opacity: 0.7
    }));

    group.appendChild(createSVG("rect", {
        x: boxX,
        y: y - LAYOUT.labelHeight / 2,
        width: LAYOUT.labelWidth,
        height: LAYOUT.labelHeight,
        rx: 5,
        fill: style.fill,
        stroke: style.stroke,
        "stroke-width": 1.5
    }));

    const text = createSVG("text", {
        x: boxX + LAYOUT.labelWidth / 2,
        y,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "font-size": LAYOUT.labelFontSize,
        fill: style.text
    });

    text.textContent = structure.name;
    group.appendChild(text);

    return group;
}

function getStructureColor(type) {

    switch (type) {

        case "BRIDGE":
            return COLORS.bridge;

        case "TUNNEL":
            return COLORS.tunnel;

        default:
            return COLORS.road;
    }

}

// function getStructureLabelStyle(type) {

//     switch (type) {

//         case "BRIDGE":
//             return {
//                 fill: "#FB8C00",
//                 stroke: "#E65100",
//                 text: "#000000"
//             };

//         case "TUNNEL":
//             return {
//                 fill: "#1E88E5",
//                 stroke: "#0D47A1",
//                 text: "#FFFFFF"
//             };

//         default:
//             return {
//                 fill: COLORS.labelFill,
//                 stroke: COLORS.labelStroke,
//                 text: "#000000"
//             };
//     }

// }