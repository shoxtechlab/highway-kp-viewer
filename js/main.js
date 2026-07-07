import { STATE, LAYOUT } from "./config.js";
import { createExpresswaySvg } from "./svg.js";
import { mouseYToKp, getSvgPoint } from "./utils.js";
import {
    buildKPViewModel,
    buildKPIndex,
    kpToStreetView
} from "./svEngine.js";

async function main() {
    const params = new URLSearchParams(location.search);
    const routeId = params.get("route") || "e28";

    const geoData = await fetch(`./data/${routeId}/route.geojson`)
        .then(r => r.json());

    const geoUp = geoData.features.find(f => f.properties.name === "up");
    const geoDown = geoData.features.find(f => f.properties.name === "down");

    const upIndex = buildKPIndex(geoUp);
    const downIndex = buildKPIndex(geoDown);

    const road = await fetch(`./data/${routeId}/road.json`)
        .then(r => r.json());

    const container = document.getElementById("app");
    const kpUI = document.getElementById("kp-ui");
    const routeTitle = document.getElementById("route-title");

    const miniMapEl = document.getElementById("mini-map");
    let miniMap = null;
    let miniMarker = null;

    const pageTitle = road.name || routeId.toUpperCase();
    document.title = `${pageTitle} | KP Viewer`;
    if (routeTitle) routeTitle.textContent = pageTitle;

    function updateScale() {
        const isMobile = window.innerWidth < LAYOUT.breakpoint;
        STATE.isMobile = isMobile;
        STATE.fitFactor = isMobile
            ? window.innerWidth / LAYOUT.breakpoint
            : 1;
        STATE.scale =
            STATE.baseScale *
            STATE.fitFactor *
            STATE.zoom;
    }

    function updateKPUI(kp, lane, facilityText, index) {
        if (kp == null || isNaN(kp)) return;

        const vm = buildKPViewModel(kp, lane, facilityText);
        const sv = kpToStreetView(index, kp, lane);
        if (!sv) return;

        if (!STATE.isMobile) {
            initMiniMap(sv.lat, sv.lon);

            if (miniMap && miniMarker) {
                miniMap.panTo([sv.lat, sv.lon]);
                miniMarker.setLatLng([sv.lat, sv.lon]);
            }
        }

        const latlonText = `${sv.lat.toFixed(6)}, ${sv.lon.toFixed(6)}`;
        const coordHtml = STATE.isMobile
            ? ""
            : `<div>${latlonText}</div>`;

        const buttonText = STATE.isMobile
            ? "SV"
            : "Street Viewを開く";

        kpUI.innerHTML = `
            <div>${vm.directionText}</div>
            <div>${vm.kp.toFixed(2)} KP</div>
            <div>${vm.facility}</div>
            ${coordHtml}
            <a href="${sv.url}" target="_blank" rel="noopener noreferrer"
                style="
                    display:inline-block;
                    padding:6px 12px;
                    background:#2d6cdf;
                    color:#fff;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:600;
                ">
                ${buttonText}
            </a>
        `;
    }

    function render() {
        container.innerHTML = "";
        const svg = createExpresswaySvg(road, handleClick);
        container.appendChild(svg);
    }

    function selectIndex(direction) {
        return direction === "up" ? upIndex : downIndex;
    }

    function handleKpSelect(kp, direction, name) {
        STATE.selectedKp = kp;
        updateKPUI(kp, direction, name, selectIndex(direction));
        render();
    }

    function handleClick(e, svg) {
        const target = e.target;

        const facility = target.closest(".facility");
        if (facility) {
            handleKpSelect(
                Number(facility.dataset.kp),
                facility.dataset.direction,
                facility.dataset.name
            );
            return;
        }

        const structureLabel = target.closest(".structure-label");
        if (structureLabel) {
            handleKpSelect(
                Number(structureLabel.dataset.kp),
                structureLabel.dataset.direction,
                structureLabel.dataset.name
            );
            return;
        }

        const structureBody = target.closest(".structure-body");
        if (structureBody) {
            const point = getSvgPoint(e, svg);
            handleKpSelect(
                mouseYToKp(point.y),
                structureBody.dataset.direction,
                structureBody.dataset.name
            );
            return;
        }

        const roadEl = target.closest(".road");
        if (roadEl) {
            const point = getSvgPoint(e, svg);
            handleKpSelect(
                mouseYToKp(point.y),
                roadEl.dataset.direction,
                "本線"
            );
        }
    }

    function initMiniMap(lat, lon) {
        if (!miniMapEl || STATE.isMobile) return;
        if (miniMap) return;

        miniMap = L.map("mini-map", {
            zoomControl: false,
            attributionControl: false
        }).setView([lat, lon], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
        }).addTo(miniMap);

        miniMarker = L.marker([lat, lon]).addTo(miniMap);
    }

    updateScale();
    render();

    window.addEventListener("resize", () => {
        const prev = STATE.isMobile;
        updateScale();

        if (prev !== STATE.isMobile || STATE.isMobile) {
            render();
        }
    });

    const slider = document.createElement("input");

    slider.type = "range";
    slider.min = "0.5";
    slider.max = "3.0";
    slider.step = "0.1";
    slider.value = "1";

    slider.style.position = "fixed";
    slider.style.right = "10px";
    slider.style.bottom = "10px";
    slider.style.zIndex = "9999";

    slider.addEventListener("input", (e) => {
        STATE.zoom = Number(e.target.value);
        updateScale();
        render();
    });

    document.body.appendChild(slider);
}

main();