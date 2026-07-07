import { LAYOUT, COLORS } from "./config.js";
import { kpToY, createSVG, getUpRoadX, getDownRoadX } from "./utils.js";
import { getLabelStyle } from "./styleRules.js";

export function buildFacilityCandidates(facilities) {

    const candidates = [];
    facilities.forEach(item => {

        if (item.up) {
            candidates.push({
                type: "facility",
                direction: "up",
                required: true,

                centerY: kpToY(item.up.kp),
                minY: -Infinity,
                maxY: Infinity,
                priority: 0,

                draw(layer, y) {
                    layer.appendChild(
                        createFacility(
                            item,
                            item.up.kp,
                            "up",
                            y
                        )
                    );
                }
            });
        }

        if (item.down) {
            candidates.push({
                type: "facility",
                direction: "down",
                required: true,

                centerY: kpToY(item.down.kp),
                minY: -Infinity,
                maxY: Infinity,
                priority: 0,

                draw(layer, y) {
                    layer.appendChild(
                        createFacility(
                            item,
                            item.down.kp,
                            "down",
                            y
                        )
                    );
                }
            });
        }
    });

    return {
        candidates
    };

}

function createFacility(facility, kp, direction, labelY = null) {

    const group = createSVG("g", {
        class: "facility",
        "data-name": facility.name,
        "data-type": facility.type,
        "data-direction": direction,
        "data-kp": kp
    });

    const style = getLabelStyle({
        kind: "facility",
        ...facility
    });

    const baseY = kpToY(kp);

    const y = labelY ?? baseY;

    const roadEdge = direction === "up"
        ? getUpRoadX()
        : getDownRoadX() + LAYOUT.roadWidth;

    const boxX = direction === "up"
        ? roadEdge - LAYOUT.labelMargin - LAYOUT.labelWidth
        : roadEdge + LAYOUT.labelMargin;

    group.appendChild(createSVG("line", {
        x1: direction === "up"
            ? boxX + LAYOUT.labelWidth
            : boxX,
        y1: y,
        x2: roadEdge,
        y2: baseY,
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
        stroke:  style.stroke,
        "stroke-width": 1.5
    }));

    const text = createSVG("text", {
        x: boxX + LAYOUT.labelWidth / 2,
        y,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "font-size": LAYOUT.labelFontSize,
        opacity: 1,
        fill: style.text
    });

    text.textContent = facility.name;
    group.appendChild(text);

    return group;
}
