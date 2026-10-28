/* ==============================================================================
   LÓGICA DEL GEOVISOR Y GEMELO DIGITAL SSR - AQUAVISOR SAN IGNACIO (V2 MAP-FIRST)
   ============================================================================== */

// Estado Global de la Aplicación
const AppState = {
    profile: 'directivo', // 'directivo' | 'operativo'
    currentHour: 13, // 0 a 23
    isPlaying: false,
    playInterval: null,
    emergencyMode: false,
    valveSelectMode: false,
    activeBurst: null,
    tankCapacity: 50.0, // m³
    tankCurrentVol: 38.5, // m³
    pumpStatus: 'ENCENDIDA',
    pumpFlow: 6.8, // L/s
    selectedFeature: null,
    valvesState: {}, // { 'VALV-01': true, ... }
    activeValveOutage: null
};

// Referencias a Capas Leaflet y Estado de Selección
let map;
let selectedPipeLayer = null;
let activeBurstLayer = null;
let lastDrawerActionTime = 0;
let layers = {
    redes: null,
    edificaciones_n9: null,
    valvulas: null,
    arranques: null,
    accesorios: null,
    fuentes: null,
    concesion: null,
    censo: null,
    outageLayer: null
};

// Patrón Horario de Demanda NCh 691
const HourlyDemandPattern = [
    0.30, 0.25, 0.22, 0.20, 0.25, 0.45,
    0.85, 1.45, 1.70, 1.50, 1.35, 1.40,
    1.95, 1.80, 1.30, 1.15, 1.20, 1.35,
    1.65, 1.85, 1.75, 1.40, 0.90, 0.50
];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initLayers();
    initDrawerControls();
    initEventListeners();
    updateDigitalTwin(AppState.currentHour);
    initSearchEngine();
    initRoleManager();
    initCommercialEngine();
    initCopilotEngine();
    initWhatsAppModal();
});

// ------------------------------------------------------------------------------
// 1. INICIALIZACIÓN DEL MAPA LEAFLET
// ------------------------------------------------------------------------------
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([-36.8480, -71.9380], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Control GPS personalizado adyacente a la herramienta de Zoom
    const GpsControl = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom-gps');
            const btn = L.DomUtil.create('a', 'leaflet-control-gps-btn', container);
            btn.href = '#';
            btn.title = 'Centrar en mi ubicación GPS (Terreno)';
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', 'Centrar en mi ubicación GPS');
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="7"></circle>
                <circle cx="12" cy="12" r="2.5" fill="currentColor"></circle>
                <line x1="12" y1="1" x2="12" y2="4"></line>
                <line x1="12" y1="20" x2="12" y2="23"></line>
                <line x1="1" y1="12" x2="4" y2="12"></line>
                <line x1="20" y1="12" x2="23" y2="12"></line>
            </svg>`;
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(btn, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                locateUserGPS();
            });
            return container;
        }
    });
    map.addControl(new GpsControl());

    // Panes dedicados con jerarquía estricta de z-index y eventos táctiles:
    // 1. Área de Concesión / Island Spotlight (Fondo pasivo sin captura de clics)
    map.createPane('concesionPane');
    map.getPane('concesionPane').style.zIndex = '350';
    map.getPane('concesionPane').style.pointerEvents = 'none';

    // 2. Redes de Tuberías
    map.createPane('redesPane');
    map.getPane('redesPane').style.zIndex = '450';

    // 3. Válvulas y Accesorios
    map.createPane('valvulasPane');
    map.getPane('valvulasPane').style.zIndex = '600';

    // 4. Arranques y Medidores (Prioridad TÁCTIL ABSOLUTA sobre polígonos y tuberías)
    map.createPane('arranquesPane');
    map.getPane('arranquesPane').style.zIndex = '680';
    map.getPane('arranquesPane').style.pointerEvents = 'auto';

    // 5. Simulación de Corte (destaque prioritario de viviendas afectadas)
    map.createPane('outagePane');
    map.getPane('outagePane').style.zIndex = '720';

    // 1. Google Satélite (Imágenes aéreas de alta resolución sin etiquetas)
    const googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
    });

    // 2. Google Híbrido (Satélite + Calles, Caminos y Toponimia)
    const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
    });

    // 3. OpenStreetMap (OSM - Servidor oficial OSM con estilo Mapnik auténtico, sin bloqueo de Referer local)
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '© OpenStreetMap contributors'
    });

    // Mecanismo de respaldo automático ante cualquier incidencia de red
    osm.on('tileerror', function(error) {
        if (error.tile && error.tile.src) {
            const src = error.tile.src;
            if (src.includes('openstreetmap.de')) {
                error.tile.src = src.replace('openstreetmap.de', 'tile.openstreetmap.fr/osmfr');
            }
        }
    });

    // Capa base por defecto: Google Satélite
    googleSat.addTo(map);

    // Conmutador interactivo de mapas base
    document.querySelectorAll('input[name="basemap"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (map.hasLayer(googleSat)) map.removeLayer(googleSat);
            if (map.hasLayer(googleHybrid)) map.removeLayer(googleHybrid);
            if (map.hasLayer(osm)) map.removeLayer(osm);

            if (e.target.value === 'google_sat') {
                googleSat.addTo(map);
            } else if (e.target.value === 'google_hybrid') {
                googleHybrid.addTo(map);
            } else if (e.target.value === 'osm') {
                osm.addTo(map);
            }
        });
    });

    // Clic en fondo de mapa: deseleccionar tuberías activas y cerrar emergencia
    map.on('click', () => {
        if (Date.now() - lastDrawerActionTime < 350) return;
        if (AppState.activeBurst) {
            clearBurstSimulation();
            if (AppState.emergencyMode) {
                toggleEmergencyMode();
            }
        }
        if (selectedPipeLayer && layers.redes) {
            layers.redes.resetStyle(selectedPipeLayer);
            selectedPipeLayer = null;
        }
    });
}

// ------------------------------------------------------------------------------
// 2. CONTROLADORES DE PANELES DESPLEGABLES (MAP-FIRST)
// ------------------------------------------------------------------------------
function initDrawerControls() {
    const drawerLeft = document.getElementById('drawer-left');
    const drawerLeftHeader = document.getElementById('drawer-left-header');
    const btnCollapseLeft = document.getElementById('btn-collapse-drawer-left');

    const drawerRight = document.getElementById('drawer-right');
    const btnToggleTelemetry = document.getElementById('btn-toggle-telemetry');
    const btnCloseRight = document.getElementById('btn-close-drawer-right');
    const tabBtnTelemetry = document.getElementById('tab-btn-telemetry');
    const tabBtnCommercial = document.getElementById('tab-btn-commercial');
    const tabBtnDetail = document.getElementById('tab-btn-detail');
    const tabContentTelemetry = document.getElementById('tab-content-telemetry');
    const tabContentCommercial = document.getElementById('tab-content-commercial');
    const tabContentDetail = document.getElementById('tab-content-detail');

    const backdrop = document.getElementById('drawer-backdrop');

    // Control de Colapso / Expansión de la Caja de Capas Izquierda
    function toggleCollapseLayers(e) {
        if (e) e.stopPropagation();
        if (!drawerLeft) return;
        drawerLeft.classList.toggle('collapsed');
        if (btnCollapseLeft) {
            btnCollapseLeft.innerHTML = drawerLeft.classList.contains('collapsed') ? '▸' : '▾';
            btnCollapseLeft.title = drawerLeft.classList.contains('collapsed') ? 'Expandir panel de capas' : 'Minimizar panel de capas';
        }
    }
    window.toggleLayersDrawer = toggleCollapseLayers;

    if (btnCollapseLeft) btnCollapseLeft.addEventListener('click', toggleCollapseLayers);
    if (drawerLeftHeader) {
        drawerLeftHeader.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                toggleCollapseLayers(e);
            }
        });
    }

    // Estado inicial de la caja de capas: asegurar colapsado por defecto
    if (drawerLeft && btnCollapseLeft) {
        if (!drawerLeft.classList.contains('collapsed')) {
            drawerLeft.classList.add('collapsed');
        }
        btnCollapseLeft.innerHTML = '▸';
        btnCollapseLeft.title = 'Expandir panel de capas';
    }

    function syncBackdrop() {
        if (!backdrop) return;
        const isManeuver = !!(AppState.activeBurst || AppState.activeValveOutage || (drawerRight && (drawerRight.classList.contains('maneuver-peek') || drawerRight.classList.contains('maneuver-active'))));
        if (isManeuver) {
            backdrop.classList.remove('active');
            return;
        }
        if (window.innerWidth < 1024 && drawerRight && drawerRight.classList.contains('open') && !drawerRight.classList.contains('maneuver-peek')) {
            backdrop.classList.add('active');
        } else {
            backdrop.classList.remove('active');
        }
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            if (Date.now() - lastDrawerActionTime < 350) return;
            if (drawerRight && drawerRight.classList.contains('open')) closeRightDrawer();
        });
    }

    // Panel Derecho (Telemetría / Ficha)
    function openRightDrawer(tabName = 'telemetry') {
        lastDrawerActionTime = Date.now();
        drawerRight.classList.add('open');
        document.body.classList.add('drawer-open');
        const dockBtn = document.getElementById('btn-panel-dock');
        if (dockBtn) dockBtn.style.display = 'none';
        if (btnToggleTelemetry) btnToggleTelemetry.classList.add('active');
        switchRightTab(tabName);
        syncBackdrop();
    }

    function closeRightDrawer() {
        drawerRight.classList.remove('open');
        drawerRight.classList.remove('maneuver-peek');
        drawerRight.classList.remove('maneuver-active');
        document.body.classList.remove('drawer-open');
        const dockBtn = document.getElementById('btn-panel-dock');
        if (dockBtn) dockBtn.style.display = 'flex';
        if (btnToggleTelemetry) btnToggleTelemetry.classList.remove('active');
        if (selectedPipeLayer && layers.redes) {
            layers.redes.resetStyle(selectedPipeLayer);
            selectedPipeLayer = null;
        }
        syncBackdrop();
    }

    // Exponer globalmente para cerrar panel derecho
    window.closeRightDrawer = closeRightDrawer;

    function switchRightTab(tabName) {
        if (tabName === 'copilot') {
            if (typeof window.openCopilotAssistant === 'function') {
                window.openCopilotAssistant();
            }
            return;
        }

        const allBtns = [tabBtnTelemetry, tabBtnCommercial, tabBtnDetail];
        const allContents = [tabContentTelemetry, tabContentCommercial, tabContentDetail];

        allBtns.forEach(btn => { if (btn) btn.classList.remove('active'); });
        allContents.forEach(cnt => { if (cnt) cnt.style.display = 'none'; });

        if (tabName === 'telemetry') {
            if (tabBtnTelemetry) tabBtnTelemetry.classList.add('active');
            if (tabContentTelemetry) tabContentTelemetry.style.display = 'block';
        } else if (tabName === 'commercial') {
            if (tabBtnCommercial) tabBtnCommercial.classList.add('active');
            if (tabContentCommercial) tabContentCommercial.style.display = 'block';
        } else {
            if (tabBtnDetail) {
                tabBtnDetail.style.display = 'inline-flex';
                tabBtnDetail.classList.add('active');
            }
            if (tabContentDetail) tabContentDetail.style.display = 'block';
        }
    }

    if (btnToggleTelemetry) {
        btnToggleTelemetry.addEventListener('click', () => {
            if (drawerRight.classList.contains('open') && tabBtnTelemetry.classList.contains('active')) {
                closeRightDrawer();
            } else {
                openRightDrawer('telemetry');
            }
        });
    }

    if (btnCloseRight) btnCloseRight.addEventListener('click', closeRightDrawer);
    if (tabBtnTelemetry) tabBtnTelemetry.addEventListener('click', () => switchRightTab('telemetry'));
    if (tabBtnCommercial) tabBtnCommercial.addEventListener('click', () => switchRightTab('commercial'));
    if (tabBtnDetail) tabBtnDetail.addEventListener('click', () => switchRightTab('detail'));

    window.switchRightTab = switchRightTab;
    window.openRightDrawer = openRightDrawer;

    // Exponer globalmente para abrir detalles
    window.openDetailTab = function() {
        openRightDrawer('detail');
    };

    // Cerrar Emergencia
    const btnCloseEmergency = document.getElementById('btn-close-emergency');
    if (btnCloseEmergency) {
        btnCloseEmergency.addEventListener('click', () => {
            clearBurstSimulation();
            if (AppState.emergencyMode) {
                toggleEmergencyMode();
            }
        });
    }
}

// ------------------------------------------------------------------------------
// 3. CARGA Y SIMBOLOGÍA DE CAPAS GEOESPACIALES
// ------------------------------------------------------------------------------
function initLayers() {
    // A. Área de Concesión Oficial (DOH / Ley 20.998) - IDEA C: Efecto "Island Spotlight" (Enfoque Territorial de Isla)
    if (typeof json_Area_Servicio_4 !== 'undefined') {
        // 0. Viñeta Inversa (Spotlight Mask): Oscurece el exterior del territorio para hacer brillar la concesión
        const worldRing = [
            [-180, -85],
            [180, -85],
            [180, 85],
            [-180, 85],
            [-180, -85]
        ];
        const holes = [];
        json_Area_Servicio_4.features.forEach(f => {
            if (f.geometry.type === 'Polygon') {
                holes.push(f.geometry.coordinates[0]);
            } else if (f.geometry.type === 'MultiPolygon') {
                f.geometry.coordinates.forEach(poly => {
                    holes.push(poly[0]);
                });
            }
        });

        const maskGeoJson = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [worldRing, ...holes]
            },
            properties: {}
        };

        const spotlightMaskLayer = L.geoJSON(maskGeoJson, {
            pane: 'concesionPane',
            style: {
                color: 'transparent',
                weight: 0,
                fillColor: '#050a19',
                fillOpacity: 0.40,
                interactive: false
            }
        });

        // 1. Capa Halo Exterior Luminous Glow (Ancho 8px translúcido dorado/ámbar)
        const haloLayer = L.geoJSON(json_Area_Servicio_4, {
            pane: 'concesionPane',
            style: {
                color: '#f59e0b',
                weight: 8,
                opacity: 0.40,
                fill: false,
                interactive: false
            }
        });

        // 2. Capa Interior de Precisión Catastral (Trazo nítido de deslinde sin captura de clics)
        const boundaryLayer = L.geoJSON(json_Area_Servicio_4, {
            pane: 'concesionPane',
            interactive: false,
            style: {
                color: '#ea580c',
                weight: 2.6,
                opacity: 1.0,
                dashArray: '10, 4, 2, 4',
                fill: false,
                interactive: false
            }
        });

        // Agrupación unificada: Máscara Spotlight + Halo + Límite de Precisión (100% pasivo)
        layers.concesion = L.featureGroup([spotlightMaskLayer, haloLayer, boundaryLayer]).addTo(map);
        layers.concesionBoundary = boundaryLayer;
    }

    // B. Localidad Censal Santa Juana
    if (typeof json_Santa_Juanacartografia_censo2024_pais__localidades_cpv24_3 !== 'undefined') {
        layers.censo = L.geoJSON(json_Santa_Juanacartografia_censo2024_pais__localidades_cpv24_3, {
            interactive: false,
            style: {
                color: '#8b5cf6',
                weight: 1.5,
                fillColor: '#8b5cf6',
                fillOpacity: 0.03,
                interactive: false
            }
        });
    }

    // C. Redes de Tuberías
    if (typeof json_Redes_Enriquecidas !== 'undefined') {
        layers.redes = L.geoJSON(json_Redes_Enriquecidas, {
            pane: 'redesPane',
            style: stylePipes,
            onEachFeature: onEachPipeFeature
        }).addTo(map);
    }

    // D. Fuentes y Estanque
    if (typeof json_Fuentefuente__output_point_layer_6 !== 'undefined') {
        layers.fuentes = L.geoJSON(json_Fuentefuente__output_point_layer_6, {
            pointToLayer: createSourceMarker
        }).addTo(map);
    }

    // E. Válvulas de Sectorización
    if (typeof json_Valvulas_GeoConecta !== 'undefined') {
        json_Valvulas_GeoConecta.features.forEach(f => {
            AppState.valvesState[f.properties.id] = true;
        });

        layers.valvulas = L.geoJSON(json_Valvulas_GeoConecta, {
            pointToLayer: createValveMarker
        }).addTo(map);
    }

    // F. Accesorios
    if (typeof json_Accesorios_GeoConecta !== 'undefined') {
        layers.accesorios = L.geoJSON(json_Accesorios_GeoConecta, {
            pointToLayer: createAccessoryMarker
        }).addTo(map);
    }

    // G. Edificaciones Santa Juana Nº9 (Precenso / Censo 2024)
    if (typeof json_Edificaciones_Santa_Juana_N9 !== 'undefined') {
        layers.edificaciones_n9 = L.geoJSON(json_Edificaciones_Santa_Juana_N9, {
            pointToLayer: function(feature, latlng) {
                const p = feature.properties;
                const isVivienda = (p.USO_EDIFIC || p.uso || '').toUpperCase().includes('VIVIENDA');
                const color = isVivienda ? '#c084fc' : '#f472b6';
                return L.circleMarker(latlng, {
                    radius: 2.8,
                    fillColor: color,
                    color: '#ffffff',
                    weight: 0.8,
                    opacity: 0.7,
                    fillOpacity: 0.4
                });
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties;
                const estado = p.estado_comercial || 'Al Día';
                const estadoColor = estado.includes('Moroso') ? '#f59e0b' : (estado.includes('Suspendido') ? '#ef4444' : '#10b981');
                const badgeBg = estado.includes('Moroso') ? 'rgba(245,158,11,0.2)' : (estado.includes('Suspendido') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)');

                let popupContent = '';
                if (p.socio && p.id_arranque) {
                    popupContent = `
                        <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; gap:6px;">
                            <span style="font-size:10px; font-weight:800; color:#c084fc; letter-spacing:0.4px;">🏠 USUARIO SSR Nº9</span>
                            <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:${badgeBg}; color:${estadoColor}; border:1px solid ${estadoColor}; white-space:nowrap;">
                                ● ${estado}
                            </span>
                        </div>
                        <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                            ${p.socio}
                        </div>
                        <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                            RUT: <strong style="color:#f1f5f9;">${p.rut || '-'}</strong> | Med: <strong style="color:#00d2ff;">${p.n_medidor || '-'}</strong>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:6px 8px; border-radius:8px; margin-bottom:8px;">
                            <div>
                                <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Presión Grifo</div>
                                <div style="font-size:12.5px; font-weight:800; color:#10b981;">
                                    ${p.presion_servicio_mca || '-'} mca
                                </div>
                            </div>
                            <div>
                                <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Consumo Prom.</div>
                                <div style="font-size:12.5px; font-weight:800; color:#ffffff;">
                                    ${p.consumo_prom_m3 || '-'} <small style="font-size:8.5px; color:#cbd5e1;">m³/m</small>
                                </div>
                            </div>
                        </div>
                        <button class="btn-popup-view-detail" onclick="openConsumerDrawerFromPopup('${p.id_arranque}')" style="
                            width: 100%;
                            padding: 7px 10px;
                            background: linear-gradient(135deg, #7c3aed, #a855f7);
                            border: none;
                            border-radius: 8px;
                            color: #ffffff;
                            font-size: 11px;
                            font-weight: 700;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 5px;
                            box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
                        ">
                            <span>📋</span> Ver Ficha Técnica Completa
                        </button>
                    `;
                } else {
                    popupContent = `
                        <div style="font-size:10px; font-weight:800; color:#c084fc; margin-bottom:4px; text-transform:uppercase;">
                            🏠 EDIFICACIÓN CATASTRADA
                        </div>
                        <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:4px; line-height:1.2;">
                            ${p.USO_EDIFIC || p.uso || 'Edificación'}
                        </div>
                        <div style="font-size:11px; color:#cbd5e1; margin-bottom:4px;">
                            Sector: <strong>Santa Juana Nº9</strong>
                        </div>
                        <div style="font-size:10.5px; color:#94a3b8; margin-bottom:4px;">
                            Comuna: <strong style="color:#f1f5f9;">${p.N_COMUNA || p.comuna || 'San Ignacio'}</strong>
                        </div>
                        <div style="font-size:10px; color:#a855f7;">
                            ID: <em>${p.id_edif || p.fid || '-'}</em> | Fuente: <em>${p.FUENTE || 'Precenso INE'}</em>
                        </div>
                    `;
                }
                layer.bindPopup(`<div class="popup-consumer">${popupContent}</div>`, { className: 'aquavisor-popup', maxWidth: 280 });
            }
        }).addTo(map);
    }

    // H. Arranques y Medidores
    if (typeof json_Arranques_GeoConecta !== 'undefined') {
        layers.arranques = L.geoJSON(json_Arranques_GeoConecta, {
            pointToLayer: createConsumerMarker
        }).addTo(map);

    // Listener de adaptación dinámica de escala para Arranques (Opción 1)
    map.on('zoomend', () => {
        if (!layers || !layers.arranques) return;
        const z = map.getZoom();
        const r = getArranqueRadiusForZoom(z);
        const w = getArranqueWeightForZoom(z);

        layers.arranques.eachLayer(layer => {
            if (!layer.feature) return;
            const p = layer.feature.properties;
            let extraR = 0;

            if (typeof commercialSemaphoreActive !== 'undefined' && commercialSemaphoreActive) {
                const comm = (typeof COMMERCIAL_DB !== 'undefined') ? COMMERCIAL_DB[p.id_arranque] : null;
                if (comm && comm.debtMonths >= 3) extraR = 1.5;
            }

            if (layer.setRadius) layer.setRadius(r + extraR);
            layer.setStyle({ weight: w });
        });
    });

    }

    // I. Capa Dinámica de Simulación de Corte (Afectación de Viviendas)
    layers.outageLayer = L.featureGroup().addTo(map);

    // Checkboxes
    bindLayerCheckbox('chk-redes', layers.redes);
    bindLayerCheckbox('chk-edificaciones-n9', layers.edificaciones_n9);
    bindLayerCheckbox('chk-valvulas', layers.valvulas);
    bindLayerCheckbox('chk-arranques', layers.arranques);
    bindLayerCheckbox('chk-fuentes', layers.fuentes);
    bindLayerCheckbox('chk-accesorios', layers.accesorios);
    bindLayerCheckbox('chk-concesion', layers.concesion);
    bindLayerCheckbox('chk-censo', layers.censo);
}

function bindLayerCheckbox(id, layer) {
    const chk = document.getElementById(id);
    if (chk && layer) {
        chk.addEventListener('change', (e) => {
            if (e.target.checked) map.addLayer(layer);
            else map.removeLayer(layer);
        });
    }
}

function stylePipes(feature) {
    const p = feature.properties;
    const diam = p.diametro_nominal || '75 mm';
    const sector = p.sector || '';

    // Simulación de Corte de Válvula Activo (Tubería Despresurizada / Aislada)
    if (AppState.activeValveOutage && typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined') {
        const sim = VALVE_OUTAGE_SIMULATION_DB[AppState.activeValveOutage];
        if (sim && sim.pipes && sim.pipes.includes(p.id_tramo)) {
            return {
                color: '#ef4444', // Rojo Alerta para tubería sin agua
                weight: 6.5,
                opacity: 1.0,
                dashArray: '7, 6',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'hud-pipe-burst'
            };
        }
    }

    // 1. Línea de Impulsión Pozo - Estanque (Alta Presión de Bombeo DGA)
    if (p.id_tramo === 'TUB-11' || sector.includes('Impulsión')) {
        return {
            color: '#a855f7', // Púrpura Neón Eléctrico / Bombeo
            weight: 5.0,
            opacity: 0.95,
            dashArray: '10, 5',
            lineCap: 'round',
            lineJoin: 'round',
            className: 'pipe-impulsion'
        };
    }

    // 2. Matriz Troncal Principal (110 mm y 90 mm - Columna Vertebral Hidráulica)
    if (diam.includes('110') || diam.includes('90')) {
        return {
            color: '#0084ff', // Azul Cobalto Neón Luminoso de Alto Contraste
            weight: 6.0,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'pipe-troncal'
        };
    }

    // 3. Redes Ramales Secundarias (75 mm y 63 mm - Distribución a Calles y Pasajes)
    return {
        color: '#00e5ff', // Cian Neón Cristalino / Red Ramal
        weight: 3.6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'pipe-ramal'
    };
}

function onEachPipeFeature(feature, layer) {
    const p = feature.properties;
    const diam = p.diametro_nominal || '75 mm';
    const isTroncal = diam.includes('110') || diam.includes('90');
    const isImpulsion = p.id_tramo === 'TUB-11' || (p.sector && p.sector.includes('Impulsión'));
    const tipoRed = isImpulsion ? 'Línea de Impulsión' : (isTroncal ? 'Matriz Principal Troncal' : 'Red Ramal Secundaria');
    const tipoColor = isImpulsion ? '#818cf8' : (isTroncal ? '#38bdf8' : '#00e5ff');
    const tipoBadge = isImpulsion ? 'IMPULSIÓN' : (isTroncal ? 'MATRIZ TRONCAL' : 'RED RAMAL');
    const badgeBg = isImpulsion ? 'rgba(99,102,241,0.2)' : (isTroncal ? 'rgba(2,132,199,0.25)' : 'rgba(0,229,255,0.18)');
    const headerTitle = isImpulsion ? '🟣 LÍNEA DE IMPULSIÓN' : (isTroncal ? '🌊 MATRIZ TRONCAL (EPANET)' : '💧 RED RAMAL SECUNDARIA');

    // Ficha resumida interactiva sobre el mapa (evaluada dinámicamente según perfil)
    layer.bindPopup(() => {
        if (AppState.emergencyMode || AppState.activeBurst) return '';
        const canSimulate = typeof currentAppRole !== 'undefined' && currentAppRole === 'terreno';
        const burstButtonHtml = canSimulate ? `
            <button class="btn-popup-burst" onclick="simulateBurstByPipeId('${p.id_tramo}')" style="
                width: 100%;
                margin-top: 6px;
                padding: 6px 10px;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35));
                border: 1px solid #ef4444;
                border-radius: 8px;
                color: #fca5a5;
                font-size: 10.5px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            ">
                <span>🚨</span> Simular Rotura en este Tramo
            </button>
        ` : '';

        return `
            <div class="popup-consumer">
                <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                    <span style="font-size:10px; font-weight:800; color:${tipoColor}; letter-spacing:0.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${headerTitle}</span>
                    <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:${badgeBg}; color:${tipoColor}; border:1px solid ${tipoColor}; white-space:nowrap; flex-shrink:0;">
                        ● ${tipoBadge}
                    </span>
                </div>
                <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                    ${p.id_tramo || 'Tubería'} - ${p.sector || 'Red Distribución'}
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                    Material: <strong style="color:#f1f5f9;">${p.material || 'PVC'}</strong> (${p.clase || 'Clase 10'})
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:7px 9px; border-radius:8px; margin-bottom:8px;">
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Diámetro Nom.</div>
                        <div style="font-size:13px; font-weight:800; color:${tipoColor};">
                            ${p.diametro_nominal || '-'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Caudal Diseño</div>
                        <div style="font-size:13px; font-weight:800; color:#ffffff;">
                            ${p.caudal_diseno_lps || '-'} <small style="font-size:9px; font-weight:500; color:#cbd5e1;">L/s</small>
                        </div>
                    </div>
                </div>
                <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">
                    • D. Interior: <strong style="color:#f1f5f9;">${p.diametro_interior_mm ? p.diametro_interior_mm + ' mm' : '-'}</strong><br>
                    • Prof. Tapada: <strong style="color:#f1f5f9;">${p.profundidad_tapada_m ? p.profundidad_tapada_m + ' m' : '1.0 m'}</strong><br>
                    • Rugosidad: <span>C = ${p.rugosidad_hazen_williams || 145} (Hazen-Williams)</span><br>
                    • Estado Operativo: <strong style="color:var(--accent-green);">● ${p.estado_tuberia || 'Bueno / En Servicio'}</strong>
                </div>
                ${canSimulate ? `
                <button class="btn-popup-view-detail" onclick="openPipeDrawerFromPopup('${p.id_tramo}')" style="
                    width: 100%;
                    padding: 7px 10px;
                    background: linear-gradient(135deg, #0284c7, #00d2ff);
                    border: none;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    box-shadow: 0 2px 8px rgba(0, 210, 255, 0.4);
                ">
                    <span>📋</span> Ver Ficha Técnica Completa
                </button>
                ${burstButtonHtml}
                ` : `
                <div style="font-size:10px; color:#94a3b8; background:rgba(255,255,255,0.04); padding:6px 8px; border-radius:6px; margin-top:6px; border:1px solid rgba(255,255,255,0.08); line-height:1.35;">
                    🔒 <em>Tramo de distribución hidráulica. Fichas de red y simulador de roturas restringidos a <strong>Operación en Terreno</strong>.</em>
                </div>
                `}
            </div>
        `;
    }, {
        className: 'aquavisor-popup',
        maxWidth: 290,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [20, 20]
    });

    layer.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }

        if (AppState.emergencyMode) {
            if (map && map.closePopup) map.closePopup();
            triggerBurstSimulation(feature, layer);
            return;
        } else {
            // Modo normal: aplicar principio de ficha resumida (popup en el mapa)
            // Cerrar el drawer lateral derecho si estuviese abierto para despejar el mapa
            if (window.closeRightDrawer) {
                window.closeRightDrawer();
            } else {
                const drawerRight = document.getElementById('drawer-right');
                if (drawerRight) drawerRight.classList.remove('open');
                const btnToggleTelemetry = document.getElementById('btn-toggle-telemetry');
                if (btnToggleTelemetry) btnToggleTelemetry.classList.remove('active');
                const backdrop = document.getElementById('drawer-backdrop');
                if (backdrop) backdrop.classList.remove('active');
            }

            // Deseleccionar tubería previa si la hubiera
            if (selectedPipeLayer && selectedPipeLayer !== layer && layers.redes) {
                layers.redes.resetStyle(selectedPipeLayer);
            }

            selectedPipeLayer = layer;
            layer.setStyle({
                color: '#fbbf24', // Dorado/amarillo brillante de selección técnica
                weight: isTroncal ? 7.0 : 5.5,
                opacity: 1
            });
            layer.bringToFront();

            // Abrir SIEMPRE la ficha resumida (popup sobre el mapa) por defecto
            if (e && e.latlng) {
                layer.openPopup(e.latlng);
            } else {
                layer.openPopup();
            }
        }
    });

    layer.on('mouseover', function() {
        if (!AppState.activeBurst || (AppState.activeBurst && AppState.activeBurst.id !== p.id_tramo)) {
            if (!selectedPipeLayer || selectedPipeLayer !== layer) {
                layer.setStyle({
                    color: '#38bdf8',
                    weight: isTroncal ? 7.5 : (isImpulsion ? 6.5 : 5.0)
                });
            }
        }
    });

    layer.on('mouseout', function() {
        if (!selectedPipeLayer || selectedPipeLayer !== layer) {
            if (layers.redes && (!AppState.activeBurst || AppState.activeBurst.id !== p.id_tramo)) {
                layers.redes.resetStyle(layer);
            }
        }
    });

    layer.on('popupclose', () => {
        const drawerRight = document.getElementById('drawer-right');
        const isDrawerOpen = drawerRight && drawerRight.classList.contains('open');
        if (!isDrawerOpen && selectedPipeLayer === layer && layers.redes && !AppState.activeBurst) {
            layers.redes.resetStyle(layer);
            selectedPipeLayer = null;
        }
    });
}

// Estilo y comportamiento de las Conexiones Domiciliarias (Arranques a Red dentro del Área de Servicio)
function styleConnection(feature) {
    return {
        color: '#facc15', // Amarillo oro cálido distintivo de acometida
        weight: 2.0,
        opacity: 0.9,
        dashArray: '3, 4',
        lineCap: 'round',
        lineJoin: 'round'
    };
}

function onEachConnectionFeature(feature, layer) {
    const p = feature.properties;

    layer.on('mouseover', function(e) {
        layer.setStyle({
            color: '#ffffff',
            weight: 3.5,
            opacity: 1.0,
            dashArray: null
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    });

    layer.on('mouseout', function(e) {
        if (layers.conexiones) {
            layers.conexiones.resetStyle(layer);
        }
    });

    const popupHtml = `
        <div class="popup-consumer">
            <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                <span style="font-size:10px; font-weight:800; color:#facc15; letter-spacing:0.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">🔌 ACOMETIDA DOMICILIARIA</span>
                <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:rgba(250,204,21,0.15); color:#facc15; border:1px solid #facc15; white-space:nowrap; flex-shrink:0;">
                    ● Área Oficial DOH
                </span>
            </div>
            <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                ${p.socio || 'Socio'}
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-bottom:8px;">
                Arranque: <strong style="color:#f1f5f9;">${p.id_arranque}</strong> | Conexión: <strong style="color:#facc15;">${p.id_conexion}</strong>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:7px 9px; border-radius:8px; margin-bottom:8px;">
                <div>
                    <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Long. Acometida</div>
                    <div style="font-size:13px; font-weight:800; color:#facc15;">
                        ${p.longitud_m || '-'} m
                    </div>
                </div>
                <div>
                    <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Matriz Origen</div>
                    <div style="font-size:13px; font-weight:800; color:#ffffff;">
                        ${p.id_tramo_red || '-'}
                    </div>
                </div>
            </div>
            <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">
                • Diámetro: <strong style="color:#facc15;">${p.diametro}</strong><br>
                • Material: <span>${p.material}</span><br>
                • Delimitación: <strong style="color:var(--accent-green);">✓ Dentro de Área de Servicio DOH</strong>
            </div>
            <button class="btn-popup-view-detail" onclick="openConsumerDrawerFromPopup('${p.id_arranque}')" style="
                width: 100%;
                padding: 7px 10px;
                background: linear-gradient(135deg, #0284c7, #00d2ff);
                border: none;
                border-radius: 8px;
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                box-shadow: 0 2px 8px rgba(0, 210, 255, 0.4);
            ">
                <span>📋</span> Ver Ficha Técnica del Arranque
            </button>
        </div>
    `;

    layer.bindPopup(popupHtml, {
        className: 'aquavisor-popup',
        maxWidth: 290,
        minWidth: 240
    });

    layer.on('click', function(e) {
        if (e && e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
        if (window.closeRightDrawer) {
            window.closeRightDrawer();
        } else {
            const drawerRight = document.getElementById('drawer-right');
            if (drawerRight) drawerRight.classList.remove('open');
        }
        layer.openPopup();
    });
}

function createSourceMarker(feature, latlng) {
    const p = feature.properties;
    const isTank = (p.name && (p.name.includes('50') || p.name.includes('25') || p.name.includes('Estanque') || p.name.includes('SE'))) || 
                   (p.tipo_obra && p.tipo_obra.includes('Estanque'));
    const isProyectado = p.estado && p.estado.includes('Proyectado');
    const color = isTank ? (isProyectado ? '#f59e0b' : '#00d2ff') : '#10b981';

    let markerHtml = '';
    if (isTank) {
        markerHtml = `
            <div class="hud-source-badge tank-badge" title="Estanque de Regulación ${p.capacidad || '50 m³'} (${p.name || 'Estanque'})">
                <div class="source-beacon-pulse"></div>
                <div class="source-icon-core tank-core">
                    <span class="source-core-sym">🗼</span>
                </div>
            </div>
        `;
    } else {
        markerHtml = `
            <div class="hud-source-badge well-badge" title="Captación Pozo Profundo DGA (${p.name || 'Pozo'})">
                <div class="source-beacon-pulse pulse-emerald"></div>
                <div class="source-icon-core well-core">
                    <span class="source-core-sym">⚡</span>
                </div>
            </div>
        `;
    }

    const customIcon = L.divIcon({
        className: 'custom-source-div-icon',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });

    const marker = L.marker(latlng, { icon: customIcon, zIndexOffset: 1000 });

    marker.bindPopup(() => {
        return `
            <div class="popup-consumer">
                <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                    <span style="font-size:10px; font-weight:800; color:${color}; letter-spacing:0.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${isTank ? '🚰 ESTANQUE DE REGULACIÓN' : '🌊 PUNTO DE CAPTACIÓN'}
                    </span>
                    <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:rgba(0,210,255,0.18); color:${color}; border:1px solid ${color}; white-space:nowrap; flex-shrink:0;">
                        ● ${p.estado || 'En Servicio'}
                    </span>
                </div>
                <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                    ${p.name || 'Infraestructura Principal'}
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                    Tipo: <strong style="color:#f1f5f9;">${p.tipo_obra || (isTank ? 'Estanque Semienterrado' : 'Captación Subterránea')}</strong>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:7px 9px; border-radius:8px; margin-bottom:8px;">
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">${isTank ? 'Capacidad' : 'Caudal Concesión'}</div>
                        <div style="font-size:13px; font-weight:800; color:${color};">
                            ${isTank ? (p.capacidad_m3 || '50') + ' m³' : (p.caudal_lps || '6.8') + ' L/s'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Cota Terreno</div>
                        <div style="font-size:13px; font-weight:800; color:#ffffff;">
                            ${p.cota_terreno_m || '142'} <small style="font-size:9px; font-weight:500; color:#cbd5e1;">m.s.n.m.</small>
                        </div>
                    </div>
                </div>
                <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">
                    • Sector: <strong style="color:#f1f5f9;">${p.sector || 'Santa Juana Nº9'}</strong><br>
                    • Material: <span>${p.material_construccion || 'Hormigón Armado'}</span><br>
                    • Operación: <strong style="color:var(--accent-green);">● Telemetría en Tiempo Real Activa</strong>
                </div>
                <button class="btn-popup-view-detail" onclick="${(typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio') ? `if(window.openRightDrawer) window.openRightDrawer('telemetry');` : `openSourceDrawerFromPopup('${p.fid || p.name}')`}" style="
                    width: 100%;
                    padding: 7px 10px;
                    background: linear-gradient(135deg, #0284c7, #00d2ff);
                    border: none;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    box-shadow: 0 2px 8px rgba(0, 210, 255, 0.4);
                ">
                    <span>${(typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio') ? '📊' : '📋'}</span> ${(typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio') ? 'Ver en Panel de Gestión' : 'Ver Ficha Técnica Completa'}
                </button>
            </div>
        `;
    }, {
        className: 'aquavisor-popup',
        maxWidth: 290,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [20, 20]
    });

    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        if (window.closeRightDrawer) {
            window.closeRightDrawer();
        } else {
            const drawerRight = document.getElementById('drawer-right');
            if (drawerRight) drawerRight.classList.remove('open');
        }
    });
    return marker;
}


// Funciones de Dimensionamiento Dinámico Multi-Escala (Optimizado para Touch Táctil)
function getArranqueRadiusForZoom(zoom) {
    if (zoom <= 14) return 3.8; // Escala Macro: visible y con área táctil cómoda
    if (zoom <= 16) return 5.8; // Escala Sector: anillo bien proporcionado y fácil de pulsar
    return 8.5;                 // Escala Detalle / Terreno (>=17): amplio touch target para dedos
}

function getArranqueWeightForZoom(zoom) {
    if (zoom <= 14) return 1.8;
    if (zoom <= 16) return 2.2;
    return 2.8;
}

function createValveMarker(feature, latlng) {
    const p = feature.properties;
    const vId = p.id;
    const isOpen = AppState.valvesState[vId] !== false;

    const icon = L.divIcon({
        className: 'custom-valve-icon',
        html: `<div class="valve-diamond ${isOpen ? 'valve-open' : 'valve-closed'}" title="${p.id}: ${p.ubicacion || 'Válvula de Sectorización'} (${isOpen ? 'Abierta' : 'Cerrada'})">
            <span class="valve-inner-symbol">${isOpen ? '⚙' : '🔒'}</span>
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const marker = L.marker(latlng, { icon: icon });

    marker.bindPopup(() => {
        const currentlyOpen = AppState.valvesState[p.id] !== false;
        const canManeuver = typeof currentAppRole !== 'undefined' && currentAppRole === 'terreno';
        const maneuverBtnHtml = canManeuver ? `
            <button class="btn-popup-maneuver" onclick="toggleValveStateFromPopup('${p.id}')" style="
                width: 100%;
                margin-top: 6px;
                padding: 6px 10px;
                background: ${currentlyOpen ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.35))'};
                border: 1px solid ${currentlyOpen ? '#ef4444' : '#10b981'};
                border-radius: 8px;
                color: ${currentlyOpen ? '#fca5a5' : '#a7f3d0'};
                font-size: 10.5px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            ">
                <span>${currentlyOpen ? '🔒' : '🔓'}</span> ${currentlyOpen ? 'Simular Maniobra: CERRAR' : 'Simular Maniobra: ABRIR'}
            </button>
        ` : '';

        return `
            <div class="popup-consumer">
                <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                    <span style="font-size:10px; font-weight:800; color:#38bdf8; letter-spacing:0.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ⚙️ VÁLVULA DE SECTORIZACIÓN
                    </span>
                    <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:${currentlyOpen ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color:${currentlyOpen ? '#10b981' : '#ef4444'}; border:1px solid ${currentlyOpen ? '#10b981' : '#ef4444'}; white-space:nowrap; flex-shrink:0;">
                        ● ${currentlyOpen ? 'ABIERTA' : 'CERRADA'}
                    </span>
                </div>
                <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                    ${p.id} - ${p.nombre || p.ubicacion || 'Válvula de Red'}
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                    Tipo: <strong style="color:#f1f5f9;">${p.tipo || 'Compuerta Cierre Elástico'}</strong> (${p.marca || 'AVK'})
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:7px 9px; border-radius:8px; margin-bottom:8px;">
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Diámetro Nom.</div>
                        <div style="font-size:13px; font-weight:800; color:#38bdf8;">
                            ${p.diametro || '75 mm'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Carrera Cierre</div>
                        <div style="font-size:13px; font-weight:800; color:#ffffff;">
                            ${p.vueltas_cierre || '18'} <small style="font-size:9px; font-weight:500; color:#cbd5e1;">vueltas</small>
                        </div>
                    </div>
                </div>
                <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.4;">
                    • Sentido Giro: <strong style="color:#f1f5f9;">${p.sentido_giro || 'Horario (CW)'}</strong><br>
                    • Función: <span>${p.funcion || 'Sectorización Red'}</span><br>
                    • Profundidad Cámara: <span>${p.profundidad_camara_m ? p.profundidad_camara_m + ' m' : '1.1 m'}</span><br>
                    • Estado Operativo: <strong style="color:var(--accent-green);">● Bueno / Mantenida</strong>
                </div>
                ${canManeuver ? `
                <button class="btn-popup-view-detail" onclick="openValveDrawerFromPopup('${p.id}')" style="
                    width: 100%;
                    padding: 7px 10px;
                    background: linear-gradient(135deg, #0284c7, #00d2ff);
                    border: none;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    box-shadow: 0 2px 8px rgba(0, 210, 255, 0.4);
                ">
                    <span>📋</span> Ver Ficha Técnica Completa
                </button>
                ${maneuverBtnHtml}
                ` : `
                <div style="font-size:10px; color:#94a3b8; background:rgba(255,255,255,0.04); padding:6px 8px; border-radius:6px; margin-top:6px; border:1px solid rgba(255,255,255,0.08); line-height:1.35;">
                    🔒 <em>Activo de red física. Las fichas de fontanería y maniobras operativas están restringidas al perfil <strong>Operación en Terreno</strong>.</em>
                </div>
                `}
            </div>
        `;
    }, {
        className: 'aquavisor-popup',
        maxWidth: 290,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [20, 20]
    });

    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        if (AppState.valveSelectMode) {
            AppState.valveSelectMode = false;
            const b = document.getElementById('emergency-mode-banner');
            if (b) b.style.display = 'none';
            document.getElementById('map').style.cursor = '';
            toggleValveState(p.id);
            return;
        }

        // Modo normal: aplicar principio de ficha resumida (popup en el mapa)
        // Cerrar el drawer lateral derecho si estuviese abierto para despejar el mapa
        if (window.closeRightDrawer) {
            window.closeRightDrawer();
        } else {
            const drawerRight = document.getElementById('drawer-right');
            if (drawerRight) drawerRight.classList.remove('open');
        }
    });

    return marker;
}

function createAccessoryMarker(feature, latlng) {
    const tipo = feature.properties.tipo || '';
    let symbol = '🔧';
    let bgColor = '#8b5cf6';
    let shapeClass = 'acc-default';
    let label = 'Accesorio';

    if (tipo.includes('Grifo')) { 
        symbol = '🧯'; 
        bgColor = '#ea580c'; 
        shapeClass = 'acc-grifo';
        label = 'Grifo DOH';
    } else if (tipo.includes('Ventosa')) { 
        symbol = '💨'; 
        bgColor = '#8b5cf6'; 
        shapeClass = 'acc-ventosa';
        label = 'Ventosa Aire';
    } else if (tipo.includes('Purga') || tipo.includes('Desagüe')) { 
        symbol = '🚿'; 
        bgColor = '#eab308'; 
        shapeClass = 'acc-purga';
        label = 'Purga Desagüe';
    }

    const icon = L.divIcon({
        className: 'custom-acc-icon',
        html: `
            <div class="acc-marker-badge ${shapeClass}" title="${label}">
                <div class="acc-core" style="background:${bgColor}; border:1.8px solid #ffffff; box-shadow:0 0 10px ${bgColor};">
                    <span>${symbol}</span>
                </div>
            </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    const marker = L.marker(latlng, { icon: icon });

    marker.bindPopup(() => {
        return `
            <div class="popup-consumer">
                <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                    <span style="font-size:10px; font-weight:800; color:${bgColor}; letter-spacing:0.4px;">
                        ${symbol} ${label.toUpperCase()}
                    </span>
                    <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:rgba(255,255,255,0.08); color:#f1f5f9; border:1px solid rgba(255,255,255,0.2);">
                        ● Operativo
                    </span>
                </div>
                <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                    ${feature.properties.id || 'Accesorio'} - ${feature.properties.tipo || label}
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                    Ubicación: <strong style="color:#f1f5f9;">${feature.properties.ubicacion || 'Red General'}</strong>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:7px 9px; border-radius:8px; margin-bottom:8px;">
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Diámetro</div>
                        <div style="font-size:13px; font-weight:800; color:${bgColor};">
                            ${feature.properties.diametro || '75 mm'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Presión Din.</div>
                        <div style="font-size:13px; font-weight:800; color:var(--accent-green);">
                            ${feature.properties.presion_dinamica || '24 m.c.a.'}
                        </div>
                    </div>
                </div>
                <button class="btn-popup-view-detail" onclick="openAccessoryDrawerFromPopup('${feature.properties.id}')" style="
                    width: 100%;
                    padding: 7px 10px;
                    background: linear-gradient(135deg, #0284c7, #00d2ff);
                    border: none;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    box-shadow: 0 2px 8px rgba(0, 210, 255, 0.4);
                ">
                    <span>📋</span> Ver Ficha Técnica Completa
                </button>
            </div>
        `;
    }, {
        className: 'aquavisor-popup',
        maxWidth: 290,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [20, 20]
    });

    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        if (window.closeRightDrawer) {
            window.closeRightDrawer();
        } else {
            const drawerRight = document.getElementById('drawer-right');
            if (drawerRight) drawerRight.classList.remove('open');
        }
    });

    return marker;
}

function createConsumerMarker(feature, latlng) {
    const p = feature.properties;
    const currentZoom = (typeof map !== 'undefined' && map) ? map.getZoom() : 15;
    const r = getArranqueRadiusForZoom(currentZoom);
    const w = getArranqueWeightForZoom(currentZoom);

    // ESTADO NEUTRO POR DEFECTO: Anillo técnico azul zafiro con centro blanco puro (CERO verde inicial)
    let fillColor = '#ffffff';
    let borderColor = '#0284c7';
    let weight = w;
    let radius = r;
    let fillOpacity = 0.95;

    // Solo si el semáforo comercial está explícitamente ACTIVO se tiñe de color
    if (typeof commercialSemaphoreActive !== 'undefined' && commercialSemaphoreActive) {
        const comm = (typeof COMMERCIAL_DB !== 'undefined') ? COMMERCIAL_DB[p.id_arranque] : null;
        if (comm) {
            if (comm.debtMonths === 0) {
                fillColor = '#10b981'; // Al Día
                borderColor = '#ffffff';
            } else if (comm.debtMonths <= 2) {
                fillColor = '#f59e0b'; // Aviso
                borderColor = '#ffffff';
            } else {
                fillColor = '#ef4444'; // Corte
                borderColor = '#ffffff';
                radius = r + 1.5;
            }
        }
    }

    const marker = L.circleMarker(latlng, {
        pane: 'arranquesPane',
        radius: radius,
        fillColor: fillColor,
        color: borderColor,
        weight: weight,
        opacity: 1.0,
        fillOpacity: fillOpacity,
        bubblingMouseEvents: false
    });

    const estado = p.estado_comercial || 'Al Día';
    const isAlDia = estado.includes('Al Día');
    const isAviso = estado.includes('Moroso') || estado.includes('Aviso');
    const badgeColor = isAlDia ? '#10b981' : (isAviso ? '#f59e0b' : '#ef4444');
    const badgeBg = isAlDia ? 'rgba(16,185,129,0.2)' : (isAviso ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)');
    const color = badgeColor;

    // Verificación si el arranque está dentro o fuera del Área de Servicio DOH
    const isInsideServ = typeof json_Conexiones_Domiciliarias !== 'undefined' && 
                         json_Conexiones_Domiciliarias.features.some(f => f.properties.id_arranque === p.id_arranque);

    // Popup interactivo sobre el mapa evaluado dinámicamente según el perfil activo
    marker.bindPopup(() => {
        const isCommercial = typeof currentAppRole !== 'undefined' && currentAppRole === 'administracion';
        const isDirectorio = typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio';
        const comm = (typeof COMMERCIAL_DB !== 'undefined') ? COMMERCIAL_DB[p.id_arranque] : null;
        const debtMonths = comm ? comm.debtMonths : 0;
        const debtAmount = comm ? comm.debtAmount : 0;

        // VISTA A: PERFIL COMITÉ Y DIRECTORIO (CREDENCIAL EJECUTIVA MÍNIMA DE GOBERNANZA)
        if (isDirectorio) {
            const hasSubsidy = (p.id_arranque === 'ARR-012' || p.id_arranque === 'ARR-018' || (parseInt(p.id_arranque.replace('ARR-','')) % 3 === 0));
            const statusColor = debtMonths >= 3 ? '#ef4444' : (debtMonths > 0 ? '#f59e0b' : '#10b981');
            const statusLabel = debtMonths >= 3 ? '● ORDEN DE CORTE' : (debtMonths > 0 ? '⚠️ AVISO MORA' : '● AL DÍA');
            const debtText = debtMonths > 0 ? `$${debtAmount.toLocaleString('es-CL')} (${debtMonths} mes${debtMonths > 1 ? 'es' : ''})` : 'Al Día ($0)';

            return `
            <div class="popup-consumer">
                <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                    <span style="font-size:10px; font-weight:800; color:#38bdf8; letter-spacing:0.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        🏛️ CONSULTA SOCIO SSR
                    </span>
                    <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:${debtMonths >= 3 ? 'rgba(239,68,68,0.2)' : (debtMonths > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)')}; color:${statusColor}; border:1px solid ${statusColor}; white-space:nowrap; flex-shrink:0;">
                        ${statusLabel}
                    </span>
                </div>
                <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:2px; line-height:1.2;">
                    ${p.socio || 'Socio Sin Nombre'}
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                    RUT: <strong style="color:#f1f5f9;">${p.rut || '-'}</strong> · Uso: <strong style="color:#38bdf8;">${p.tipo_uso || 'Residencial'}</strong>
                </div>

                <div style="background:rgba(255,255,255,0.05); padding:8px 10px; border-radius:8px; margin-bottom:6px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:4px;">
                        <span style="color:#cbd5e1;">Situación Cuotas:</span>
                        <strong style="color:${statusColor};">${debtText}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px;">
                        <span style="color:#94a3b8;">Subsidio Municipal SAP:</span>
                        <span style="color:${hasSubsidy ? '#10b981' : '#94a3b8'}; font-weight:600;">
                            ${hasSubsidy ? '✓ Activo (50% SAP)' : 'Sin Subsidio'}
                        </span>
                    </div>
                </div>

                <div style="font-size:9.5px; color:#10b981; margin-bottom:4px; font-weight:600; display:flex; align-items:center; gap:4px;">
                    <span>✓ Concesión Oficial DOH (Ley 20.998)</span>
                </div>

                <div style="font-size:9.5px; color:#94a3b8; margin-top:6px; background:rgba(255,255,255,0.03); padding:5px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); line-height:1.35;">
                    🏛️ <em>Consulta directiva de socio. Cobranza, emisión de boletas y convenios corresponden al perfil <strong>Gestión Comercial</strong>.</em>
                </div>
            </div>
            `;
        }

        // VISTA B: OTROS PERFILES (COMERCIAL Y TERRENO)
        const btnIcon = isCommercial ? '👤' : '📋';
        const btnLabel = isCommercial ? 'Ver Ficha del Socio y Cobranza' : 'Ver Ficha del Arranque';
        return `
        <div class="popup-consumer">
            <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; padding-right:28px; gap:6px;">
                <span style="font-size:10px; font-weight:800; color:#00d2ff; letter-spacing:0.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">💧 ARRANQUE DOMICILIARIO</span>
                <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:${badgeBg}; color:${badgeColor}; border:1px solid ${color}; white-space:nowrap; flex-shrink:0;">
                    ● ${estado}
                </span>
            </div>
            <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                ${p.socio || 'Socio Sin Nombre'}
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">
                RUT: <strong style="color:#f1f5f9;">${p.rut || '-'}</strong> | Medidor: <strong style="color:#00d2ff;">${p.n_medidor || '-'}</strong>
            </div>
            <div style="font-size:10px; color:${isInsideServ ? '#10b981' : '#f59e0b'}; margin-bottom:8px; font-weight:600; display:flex; align-items:center; gap:4px;">
                <span>${isInsideServ ? '✓' : '⚠️'}</span>
                <span>${isInsideServ ? 'Dentro de Área de Servicio DOH' : 'Fuera de Concesión DOH'}</span>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:7px 9px; border-radius:8px; margin-bottom:8px;">
                <div>
                    <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Presión Grifo</div>
                    <div style="font-size:13px; font-weight:800; color:${(p.presion_servicio_mca || 20) < 14 ? '#f59e0b' : '#10b981'};">
                        ${p.presion_servicio_mca || '-'} m.c.a.
                    </div>
                </div>
                <div>
                    <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Consumo Prom.</div>
                    <div style="font-size:13px; font-weight:800; color:#ffffff;">
                        ${p.consumo_prom_m3 || '-'} <small style="font-size:9px; font-weight:500; color:#cbd5e1;">m³/mes</small>
                    </div>
                </div>
            </div>
            <button class="btn-popup-view-detail" onclick="openConsumerDrawerFromPopup('${p.id_arranque}')" style="
                width: 100%;
                padding: 7px 10px;
                background: linear-gradient(135deg, #0284c7, #00d2ff);
                border: none;
                border-radius: 8px;
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                box-shadow: 0 2px 8px rgba(0, 210, 255, 0.4);
            ">
                <span>${btnIcon}</span> ${btnLabel}
            </button>
        </div>
        `;
    }, {
        className: 'aquavisor-popup',
        maxWidth: 290,
        minWidth: 240,
        autoPan: true,
        autoPanPadding: [20, 20]
    });

    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }

        // Al seleccionar cualquier arranque: SIEMPRE cerrar el panel extendido derecho
        // para dar protagonismo absoluto al mapa y a la ficha resumida
        if (window.closeRightDrawer) {
            window.closeRightDrawer();
        } else {
            const drawerRight = document.getElementById('drawer-right');
            if (drawerRight) drawerRight.classList.remove('open');
            const btnToggleTelemetry = document.getElementById('btn-toggle-telemetry');
            if (btnToggleTelemetry) btnToggleTelemetry.classList.remove('active');
            const backdrop = document.getElementById('drawer-backdrop');
            if (backdrop) backdrop.classList.remove('active');
        }

        // Mostrar SIEMPRE la ficha resumida (popup sobre el mapa) por defecto
        marker.openPopup();
    });

    return marker;
}

// ------------------------------------------------------------------------------
// 4. GEMELO DIGITAL HIDRÁULICO 24H (EPANET)
// ------------------------------------------------------------------------------
function updateDigitalTwin(hour) {
    AppState.currentHour = hour;

    const hourFormatted = hour.toString().padStart(2, '0') + ':00 hrs';
    const hourLabel = document.getElementById('cur-hour-label');
    if (hourLabel) {
        let period = 'Consumo Normal';
        if (hour >= 2 && hour <= 5) period = 'Llenado Nocturno / Mínimo Consumo';
        else if (hour >= 7 && hour <= 9) period = 'Punta Matinal';
        else if (hour >= 12 && hour <= 14) period = 'Punta Almuerzo (Máxima Demanda)';
        else if (hour >= 20 && hour <= 22) period = 'Punta Tarde-Noche';
        hourLabel.innerText = `${hourFormatted} - ${period}`;
    }

    const slider = document.getElementById('time-slider');
    if (slider) slider.value = hour;

    const demandFactor = HourlyDemandPattern[hour];
    let tankVol = 38.5;

    if (hour <= 6) {
        tankVol = 40.0 + (hour * 1.5);
        if (tankVol > 49.5) tankVol = 49.5;
        AppState.pumpStatus = 'ENCENDIDA (Llenado)';
        AppState.pumpFlow = 6.8;
    } else if (hour >= 12 && hour <= 14) {
        tankVol = 31.0 - ((hour - 12) * 2.2);
        AppState.pumpStatus = 'ENCENDIDA (Apoyo Punta)';
        AppState.pumpFlow = 6.8;
    } else if (hour >= 20 && hour <= 22) {
        tankVol = 28.5 - ((hour - 20) * 1.8);
        AppState.pumpStatus = 'ENCENDIDA (Apoyo Punta)';
        AppState.pumpFlow = 6.8;
    } else {
        tankVol = 36.0 - (demandFactor * 1.5);
        AppState.pumpStatus = (hour % 2 === 0) ? 'ENCENDIDA' : 'DETENIDA (Nivel Alto)';
        AppState.pumpFlow = (AppState.pumpStatus.includes('ENCENDIDA')) ? 6.8 : 0.0;
    }

    AppState.tankCurrentVol = Math.round(tankVol * 10) / 10;
    const tankPercent = Math.round((AppState.tankCurrentVol / AppState.tankCapacity) * 100);

    const baseP = 22.0;
    const minPressure = Math.round((baseP - (demandFactor * 4.2)) * 10) / 10;

    const tankPctLabel = document.getElementById('tank-pct-val');
    const tankVolLabel = document.getElementById('tank-vol-val');
    const tankFillBar = document.getElementById('tank-fill-bar');
    const pumpStateLabel = document.getElementById('pump-state-val');
    const pumpFlowLabel = document.getElementById('pump-flow-val');
    const minPressLabel = document.getElementById('min-press-val');
    const timelineMinPress = document.getElementById('timeline-min-press');
    const timelineTankVol = document.getElementById('timeline-tank-vol');

    if (tankPctLabel) tankPctLabel.innerText = tankPercent;
    if (tankVolLabel) tankVolLabel.innerText = `${AppState.tankCurrentVol} m³`;
    const tankAutonomyVal = document.getElementById('tank-autonomy-val');
    const autonomyHours = Math.round((AppState.tankCurrentVol / 4.3) * 10) / 10;
    if (tankAutonomyVal) {
        tankAutonomyVal.innerText = `~${autonomyHours} hrs de autonomía`;
    }

    // Hora límite estimada de corte para toma de decisiones ejecutivas
    const tankCutoffTime = document.getElementById('tank-cutoff-time');
    if (tankCutoffTime) {
        const totalMinutes = Math.round(autonomyHours * 60);
        const endHour = (hour + Math.floor(totalMinutes / 60)) % 24;
        const endMin = totalMinutes % 60;
        const period = endHour >= 12 ? 'PM' : 'AM';
        const displayH = endHour % 12 === 0 ? 12 : endHour % 12;
        const timeStr = `${String(displayH).padStart(2, '0')}:${String(endMin).padStart(2, '0')} ${period}`;
        tankCutoffTime.innerText = timeStr;
    }

    // Tendencia de Flujo del Estanque (Llenando vs Consumo Punta)
    const tankTrendBadge = document.getElementById('tank-trend-badge');
    if (tankTrendBadge) {
        const isFilling = AppState.pumpFlow > 4.3;
        if (isFilling) {
            tankTrendBadge.className = 'water-hero-status status-good';
            tankTrendBadge.innerText = '▲ Llenando';
        } else {
            tankTrendBadge.className = 'water-hero-status status-warn';
            tankTrendBadge.innerText = '▼ Vaciando';
        }
    }

    // Micro-semáforo normativo NCh 691 para la Presión en Punto Escuela
    const minPressSub = document.getElementById('min-press-sub');
    if (minPressSub) {
        if (minPressure < 14.0) {
            minPressSub.innerHTML = '● Crítica';
            minPressSub.style.color = '#ef4444';
        } else if (minPressure < 15.5) {
            minPressSub.innerHTML = '⚠️ Límite';
            minPressSub.style.color = '#fbbf24';
        } else {
            minPressSub.innerHTML = '● Normal';
            minPressSub.style.color = '#34d399';
        }
    }

    if (tankFillBar) {
        tankFillBar.style.width = tankPercent + '%';
        if (tankPercent < 30) tankFillBar.style.background = '#ef4444';
        else if (tankPercent < 50) tankFillBar.style.background = 'linear-gradient(90deg, #f59e0b, #38bdf8)';
        else tankFillBar.style.background = 'linear-gradient(90deg, #0284c7, #38bdf8)';
    }
    if (pumpStateLabel) {
        const isPumping = AppState.pumpStatus.includes('ENCENDIDA');
        pumpStateLabel.innerText = isPumping ? '● Bombeando' : '○ En Reposo';
        pumpStateLabel.style.color = isPumping ? '#34d399' : '#94a3b8';
    }
    if (pumpFlowLabel) pumpFlowLabel.innerText = AppState.pumpFlow + ' L/s';
    if (minPressLabel) {
        minPressLabel.innerText = minPressure + ' mca';
        minPressLabel.style.color = minPressure < 14.0 ? '#ef4444' : (minPressure < 15.5 ? '#fbbf24' : '#cbd5e1');
    }
    if (timelineMinPress) {
        timelineMinPress.innerText = minPressure + ' mca';
        timelineMinPress.style.color = minPressure < 14.0 ? '#ef4444' : '#34d399';
    }
    if (timelineTankVol) timelineTankVol.innerText = AppState.tankCurrentVol + ' m³';
}

// ------------------------------------------------------------------------------
// 5. SIMULADOR DE ROTURA COMPACTO (NO BLOQUEA EL MAPA)
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// CENTRO UNIFICADO DE MANIOBRAS HIDRÁULICAS (ROTURAS Y VÁLVULAS)
// ------------------------------------------------------------------------------
function openManeuversModal() {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 El Centro de Maniobras Hidráulicas es exclusivo del perfil Operación en Terreno');
        }
        return;
    }

    const modal = document.getElementById('maneuvers-modal');
    if (!modal) return;

    // Verificar si hay alguna rotura o válvula cerrada activa
    const isBurstActive = !!AppState.activeBurst;
    let closedValvesCount = 0;
    if (AppState.valvesState) {
        for (const k in AppState.valvesState) {
            if (AppState.valvesState[k] === false) closedValvesCount++;
        }
    }

    const statusBar = document.getElementById('maneuvers-active-status');
    const statusDesc = document.getElementById('maneuvers-active-desc');
    if (statusBar && statusDesc) {
        if (isBurstActive || closedValvesCount > 0) {
            statusBar.style.display = 'flex';
            let descParts = [];
            if (isBurstActive) descParts.push(`Rotura activa en ${AppState.activeBurst.id}`);
            if (closedValvesCount > 0) descParts.push(`${closedValvesCount} válvula(s) cerrada(s)`);
            statusDesc.textContent = '⚠️ ' + descParts.join(' · ');
        } else {
            statusBar.style.display = 'none';
        }
    }

    modal.style.display = 'flex';
}
window.openManeuversModal = openManeuversModal;

function closeManeuversModal(e) {
    if (e && e.target && e.target.id !== 'maneuvers-modal' && !e.target.classList.contains('maneuvers-modal-close')) {
        return;
    }
    const modal = document.getElementById('maneuvers-modal');
    if (modal) modal.style.display = 'none';
}
window.closeManeuversModal = closeManeuversModal;

function startManeuverMode(mode) {
    closeManeuversModal();

    if (mode === 'burst') {
        AppState.valveSelectMode = false;
        if (!AppState.emergencyMode) {
            toggleEmergencyMode();
        }
        const bannerText = document.getElementById('emergency-banner-text');
        if (bannerText) {
            bannerText.innerHTML = '🚨 <strong>Modo Rotura Activo:</strong> Toca la tubería averiada en el mapa';
        }
    } else if (mode === 'valve') {
        if (AppState.emergencyMode) {
            toggleEmergencyMode();
        }
        AppState.valveSelectMode = true;

        // Asegurar que la capa de válvulas esté activa en el mapa
        if (layers.valvulas && !map.hasLayer(layers.valvulas)) {
            map.addLayer(layers.valvulas);
            const chk = document.getElementById('chk-valvulas');
            if (chk) chk.checked = true;
        }

        const banner = document.getElementById('emergency-mode-banner');
        const bannerText = document.getElementById('emergency-banner-text');
        if (banner && bannerText) {
            bannerText.innerHTML = '◈ <strong>Modo Válvula Activo:</strong> Toca una válvula en el mapa para simular maniobra';
            banner.style.display = 'flex';
        }

        if (window.closeRightDrawer) window.closeRightDrawer();
        if (typeof map !== 'undefined' && map.closePopup) map.closePopup();
        document.getElementById('map').style.cursor = 'pointer';
        showToastNotification('◈ Modo Válvulas: Toca una válvula para simular su corte');
    }
}
window.startManeuverMode = startManeuverMode;

function cancelActiveManeuverMode() {
    if (AppState.emergencyMode) {
        toggleEmergencyMode();
    }
    AppState.valveSelectMode = false;
    const banner = document.getElementById('emergency-mode-banner');
    if (banner) banner.style.display = 'none';
    document.getElementById('map').style.cursor = '';
}
window.cancelActiveManeuverMode = cancelActiveManeuverMode;

function resetAllManeuvers() {
    closeManeuversModal();

    // 1. Restaurar tuberías si había rotura
    if (typeof clearBurstSimulation === 'function') {
        clearBurstSimulation();
    }

    // 2. Abrir todas las válvulas cerradas
    if (AppState.valvesState) {
        AppState.valvesState = {};
    }
    if (layers.valvulas && json_Valvulas_GeoConecta) {
        layers.valvulas.clearLayers();
        layers.valvulas.addData(json_Valvulas_GeoConecta);
    }
    if (layers.outageLayer) {
        layers.outageLayer.clearLayers();
    }

    // 3. Ocultar banners y cerrar drawer
    cancelActiveManeuverMode();
    if (window.closeRightDrawer) window.closeRightDrawer();

    showToastNotification('✓ Todas las maniobras restablecidas. Red en régimen normal.');
}
window.resetAllManeuvers = resetAllManeuvers;

function toggleEmergencyMode() {
    AppState.emergencyMode = !AppState.emergencyMode;
    const btn = document.getElementById('btn-emergency-mode');
    const thumbBtn = document.querySelector('.thumb-btn-emergency');
    const banner = document.getElementById('emergency-mode-banner');
    
    if (AppState.emergencyMode) {
        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '🚨 MODO ACTIVO: Pincha una Tubería';
        }
        if (thumbBtn) thumbBtn.classList.add('active');
        if (banner) banner.style.display = 'flex';
        document.getElementById('map').style.cursor = 'crosshair';
        if (typeof map !== 'undefined' && map.closePopup) map.closePopup();
    } else {
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '🚨 Simular Rotura';
        }
        if (thumbBtn) thumbBtn.classList.remove('active');
        if (banner) banner.style.display = 'none';
        document.getElementById('map').style.cursor = '';
        clearBurstSimulation();
    }
}
window.toggleEmergencyMode = toggleEmergencyMode;

// ==============================================================================
// GESTIÓN DE MODO ASOMADO TÁCTICO (MANEUVER PEEK BAR) EN MÓVIL
// ==============================================================================
function setupManeuverPeekBar(config) {
    const drawer = document.getElementById('drawer-right');
    if (!drawer) return;

    const iconEl = document.getElementById('peek-icon');
    const titleEl = document.getElementById('peek-title');
    const subEl = document.getElementById('peek-sub');
    const restoreBtn = document.getElementById('btn-peek-restore');
    const toggleIcon = document.getElementById('peek-toggle-icon');
    const toggleText = document.getElementById('peek-toggle-text');

    if (iconEl) iconEl.textContent = config.icon || '🚨';
    if (titleEl) titleEl.textContent = config.title || 'Maniobra Activa';
    if (subEl) subEl.textContent = config.sub || '';
    if (restoreBtn) {
        restoreBtn.textContent = config.restoreText || '✓ Normalizar';
        if (config.onRestore) {
            restoreBtn.setAttribute('onclick', config.onRestore);
        } else {
            restoreBtn.setAttribute('onclick', 'handlePeekRestore()');
        }
    }
    if (toggleIcon) toggleIcon.textContent = '▲';
    if (toggleText) toggleText.textContent = 'Detalle';

    drawer.classList.add('open');
    drawer.classList.add('maneuver-peek');
    drawer.classList.add('maneuver-active');
    document.body.classList.add('drawer-open');

    // Desactivar backdrop explícitamente para dejar el mapa visible e interactivo
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.remove('active');
}
window.setupManeuverPeekBar = setupManeuverPeekBar;

function toggleManeuverSheetPeek() {
    const drawer = document.getElementById('drawer-right');
    const toggleIcon = document.getElementById('peek-toggle-icon');
    const toggleText = document.getElementById('peek-toggle-text');
    if (!drawer) return;

    const isPeek = drawer.classList.contains('maneuver-peek');
    if (isPeek) {
        // Expandir a ficha completa (54vh)
        drawer.classList.remove('maneuver-peek');
        if (toggleIcon) toggleIcon.textContent = '🗺️';
        if (toggleText) toggleText.textContent = 'Ver Mapa';
    } else {
        // Plegar a modo asomado compacto (68px)
        drawer.classList.add('maneuver-peek');
        if (toggleIcon) toggleIcon.textContent = '▲';
        if (toggleText) toggleText.textContent = 'Detalle';
    }

    // Mantener backdrop desactivado para mapa 100% interactivo
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.remove('active');
}
window.toggleManeuverSheetPeek = toggleManeuverSheetPeek;

function handlePeekRestore() {
    if (AppState.activeBurst) {
        repairAndRestore();
    } else if (AppState.activeValveOutage) {
        toggleValveState(AppState.activeValveOutage);
    } else {
        if (window.closeRightDrawer) window.closeRightDrawer();
    }
}
window.handlePeekRestore = handlePeekRestore;

function triggerBurstSimulation(feature, layer) {
    const props = feature.properties;

    // Asegurar cierre estricto de cualquier popup en el mapa
    if (typeof map !== 'undefined' && map.closePopup) {
        map.closePopup();
    }

    // Ocultar banner superior si estaba activo
    const banner = document.getElementById('emergency-mode-banner');
    if (banner) banner.style.display = 'none';

    // Si se pincha la misma tubería que ya está rota, se deselecciona y desactiva
    if (activeBurstLayer === layer) {
        clearBurstSimulation();
        return;
    }

    // Si había otra tubería previamente en rotura, restaurar su estilo original
    if (activeBurstLayer && layers.redes) {
        layers.redes.resetStyle(activeBurstLayer);
    }

    activeBurstLayer = layer;
    AppState.activeBurst = {
        id: props.id_tramo,
        layer: layer,
        props: props
    };

    // Aplicar estilo de rotura (Rojo discontinuo brillante)
    layer.setStyle({
        color: '#ef4444',
        weight: 8,
        dashArray: '6, 6',
        opacity: 1
    });
    layer.bringToFront();

    let valvesToClose = ['VALV-02 (Salida Estanque)', 'VALV-08 (KM 1.5 Poniente)'];
    let affectedHomes = 38;
    if (props.sistema && (props.sistema.includes('Nº9') || props.sistema.includes('N9'))) {
        const tid = props.id_tramo || '';
        if (tid === 'TUB-43') {
            valvesToClose = ['VALV-16 (Ramal Hijuelas)'];
            affectedHomes = 6;
        } else if (['TUB-02','TUB-03','TUB-04','TUB-05','TUB-06','TUB-07','TUB-08'].includes(tid)) {
            valvesToClose = ['VALV-15 (Ramal Interconexión Poniente)'];
            affectedHomes = 10;
        } else if (['TUB-36','TUB-37','TUB-38','TUB-39','TUB-40','TUB-41','TUB-42'].includes(tid)) {
            valvesToClose = ['VALV-20 (Terminal Red 63 mm)'];
            affectedHomes = 8;
        } else if (['TUB-30','TUB-31','TUB-32','TUB-33','TUB-34','TUB-35'].includes(tid)) {
            valvesToClose = ['VALV-19 (Sector Los Castaños)'];
            affectedHomes = 14;
        } else if (['TUB-24','TUB-25','TUB-26','TUB-27','TUB-28','TUB-29'].includes(tid)) {
            valvesToClose = ['VALV-18 (Reducción Troncal 75 mm)'];
            affectedHomes = 24;
        } else if (['TUB-17','TUB-18','TUB-19','TUB-20','TUB-21','TUB-22','TUB-23'].includes(tid)) {
            valvesToClose = ['VALV-17 (Troncal KM 0.7)'];
            affectedHomes = 32;
        } else {
            valvesToClose = ['VALV-13 (Salida Estanque Cabecera N9)', 'VALV-14 (Troncal Principal N9)'];
            affectedHomes = 45;
        }
    } else if (props.sector && props.sector.includes('Norte')) {
        valvesToClose = ['VALV-03 (Bifurcación Norte)'];
        affectedHomes = 29;
    } else if (props.sector && props.sector.includes('Este')) {
        valvesToClose = ['VALV-04 (Troncal Este)'];
        affectedHomes = 42;
    } else if (props.sector && props.sector.includes('Escuela')) {
        valvesToClose = ['VALV-05 (Entrada Callejón Centro)'];
        affectedHomes = 22;
    }

    // Centrar mapa suavemente en la rotura con encuadre óptimo en móvil (dejando libre el 88% del mapa)
    const bounds = layer.getBounds();
    if (window.innerWidth < 768) {
        map.fitBounds(bounds.pad(0.35), {
            maxZoom: 16,
            paddingTopLeft: [20, 20],
            paddingBottomRight: [20, 85],
            duration: 0.8
        });
    } else {
        map.flyTo(bounds.getCenter(), 16, { duration: 0.8 });
    }

    // Mostrar el protocolo de emergencia integrado en la Ficha Técnica (Bottom Sheet)
    showEmergencyProtocol(props, valvesToClose, affectedHomes);
}

function showEmergencyProtocol(props, valvesToClose, affectedHomes) {
    const badge = '<span class="drawer-badge" style="background:rgba(239,68,68,0.25); color:#ef4444; border:1px solid #ef4444;">🚨 PROTOCOLO DE CORTE</span>';

    const valvesHtml = valvesToClose.map((v, idx) => {
        const valveCode = v.split('(')[0].trim();
        const valveLoc = v.includes('(') ? v.split('(')[1].replace(')', '') : 'Sector troncal';
        return `
            <div class="emergency-valve-row">
                <div class="emergency-valve-num">${idx + 1}</div>
                <div class="emergency-valve-info">
                    <div class="emergency-valve-name">Cerrar <strong>${valveCode}</strong></div>
                    <div class="emergency-valve-sub">📍 ${valveLoc} · Girar en sentido <strong>HORARIO</strong></div>
                </div>
                <span class="emergency-valve-badge">CERRAR</span>
            </div>
        `;
    }).join('');

    const html = `
        <div class="ficha-container emergency-protocol-wrap">
            <!-- Bloque 1: Alerta y Localización -->
            <div class="ficha-card emergency-alert-card">
                <div class="emergency-alert-header">
                    <span class="emergency-alert-tag">🚨 ROTURA EN MATRIZ DETECTADA</span>
                    <span class="emergency-alert-code font-mono">${props.id_tramo}</span>
                </div>
                <h3 class="emergency-alert-title">${props.id_tramo} · ${props.sector || 'Red de Distribución'}</h3>
                <div class="emergency-alert-meta">
                    <span>Diámetro: <strong>${props.diametro_nominal || '75 mm'}</strong></span>
                    <span>Material: <strong>${props.material || 'HDPE'}</strong></span>
                    <span>Caudal: <strong>${props.caudal_diseno_lps || '6.8'} L/s</strong></span>
                </div>
            </div>

            <!-- Bloque 2: Maniobras de Fontanería Obligatorias -->
            <div class="emergency-steps-block">
                <div class="emergency-steps-heading">
                    <span>🛑</span> MANIOBRAS DE AISLAMIENTO INMEDIATO
                </div>
                <div class="emergency-valves-container">
                    ${valvesHtml}
                </div>
            </div>

            <!-- Bloque 3: Impacto Social / Familias sin agua -->
            <div class="emergency-impact-card">
                <div class="emergency-impact-text">
                    <span class="impact-label">Viviendas Sin Suministro:</span>
                    <span class="impact-sub">Población aislada en sector</span>
                </div>
                <div class="emergency-impact-number">
                    ${affectedHomes} <small>familias</small>
                </div>
            </div>

            <!-- Bloque Interacción Comunitaria: Notificación WhatsApp -->
            <div class="emergency-action-block" style="margin-top:8px;">
                <button class="btn-emergency-whatsapp" onclick="openWhatsAppBroadcastModal('${valvesToClose[0] ? valvesToClose[0].split('(')[0].trim() : 'VALV-16'}')" style="
                    width: 100%;
                    padding: 9px 12px;
                    background: linear-gradient(135deg, #15803d, #22c55e);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 11.5px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    box-shadow: 0 3px 10px rgba(34, 197, 94, 0.35);
                    transition: all 0.2s ease;
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align:middle; display:inline-block;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span>📲 Notificar Corte a la Comunidad por WhatsApp</span>
                </button>
            </div>

            <!-- Bloque 4: Acción Única - Normalizar / Reparado -->
            <div class="emergency-action-block">
                <button class="btn-emergency-normalize" onclick="repairAndRestore()">
                    <span>✓</span> Concluir Reparación y Normalizar Red
                </button>
            </div>
        </div>
    `;

    setDrawerDetail(props.id_tramo + ' (Emergencia)', badge, html);

    // En móvil: activar Peek Mode (barra compacta de 68px) para no tapar el mapa
    if (window.innerWidth < 768) {
        setupManeuverPeekBar({
            mode: 'burst',
            icon: '🚨',
            title: `Rotura: ${props.id_tramo}`,
            sub: `${affectedHomes} familias sin agua`,
            restoreText: '✓ Reparado',
            onRestore: 'repairAndRestore()'
        });
        showToastNotification(`🚨 Rotura en ${props.id_tramo}: 88% del mapa despejado para maniobra`);
    }
}

function repairAndRestore() {
    clearBurstSimulation();
    if (AppState.emergencyMode) {
        toggleEmergencyMode();
    }
    if (window.closeRightDrawer) {
        window.closeRightDrawer();
    }
    showToastNotification('✓ Red normalizada y servicio restablecido.');
}
window.repairAndRestore = repairAndRestore;

function executeEmergencyCut() {
    repairAndRestore();
}
window.executeEmergencyCut = executeEmergencyCut;

function clearBurstSimulation() {
    const burstLayerToReset = activeBurstLayer || (AppState.activeBurst ? AppState.activeBurst.layer : null);
    activeBurstLayer = null;
    AppState.activeBurst = null;

    if (burstLayerToReset && layers.redes) {
        layers.redes.resetStyle(burstLayerToReset);
    }

    if (layers.redes) {
        layers.redes.eachLayer(l => {
            if (layers.redes.resetStyle) {
                layers.redes.resetStyle(l);
            }
        });
    }

    const drawer = document.getElementById('drawer-right');
    if (drawer) {
        drawer.classList.remove('maneuver-peek');
        drawer.classList.remove('maneuver-active');
    }

    // Ocultar banner si quedó abierto
    const banner = document.getElementById('emergency-mode-banner');
    if (banner) banner.style.display = 'none';
}
window.clearBurstSimulation = clearBurstSimulation;

// Toast Notifier Global
function showToastNotification(message, duration = 3000) {
    let toast = document.getElementById('aquavisor-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'aquavisor-toast';
        toast.className = 'aquavisor-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}
window.showToastNotification = showToastNotification;


// ------------------------------------------------------------------------------
// 6. DETALLE DE ELEMENTOS EN DRAWER DERECHO
// ------------------------------------------------------------------------------
function setDrawerDetail(title, badgeHtml, contentHtml) {
    const badgeContainer = document.getElementById('drawer-badge-container');
    if (badgeContainer) badgeContainer.innerHTML = '';
    const content = document.getElementById('drawer-content');
    if (content) {
        content.innerHTML = contentHtml;
    }
    // Cierre estricto de cualquier popup emergente para evitar duplicidad visual
    if (typeof map !== 'undefined' && map) {
        map.closePopup();
    }
    window.openDetailTab();
}

function showValveDetails(props) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 Ficha de maniobra reservada exclusivamente a Operación en Terreno');
        }
        return;
    }
    const isOpen = AppState.valvesState[props.id] !== false;
    const badge = '<span class="drawer-badge badge-valve">VÁLVULA DE SECTORIZACIÓN</span>';
    const sim = (typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined') ? VALVE_OUTAGE_SIMULATION_DB[props.id] : null;
    const affectedCount = sim ? sim.affectedCount : 0;
    const pipesKm = sim ? sim.pipesKm : 0;
    const pipesCount = sim ? sim.pipesCount : 0;
    const sectorAfectado = sim ? sim.sector : props.sector_afectado;
    const recoveryTime = sim ? sim.recovery_time : '20 min';

    // Restricción estricta por Perfil: solo Operación en Terreno puede maniobrar
    const canManeuver = typeof currentAppRole !== 'undefined' && currentAppRole === 'terreno';
    let maneuverBlockHtml = '';

    if (canManeuver) {
        maneuverBlockHtml = `
            <div class="ficha-card ficha-block-maneuver">
                <div class="ficha-card-label"><span class="block-icon">🔄</span> PROTOCOLO DE MANIOBRA EN TERRENO</div>
                <div class="maneuver-flex">
                    <div class="maneuver-item">
                        <span class="maneuver-val">${props.sentido_giro || 'Horario'}</span>
                        <span class="maneuver-lbl">Sentido Cierre</span>
                    </div>
                    <div class="maneuver-sep">|</div>
                    <div class="maneuver-item">
                        <span class="maneuver-val font-mono">${props.vueltas_cierre || '18'} vueltas</span>
                        <span class="maneuver-lbl">Carrera Total</span>
                    </div>
                </div>

                <!-- Botón táctil de maniobra (EXCLUSIVO TERRENO) -->
                <button class="btn-toggle-valve-tactil ${isOpen ? 'btn-valve-close' : 'btn-valve-open'}" onclick="toggleValveState('${props.id}')">
                    ${isOpen ? '🔒 Simular Maniobra: CERRAR' : '🔓 Simular Maniobra: ABRIR (Restablecer)'}
                </button>
            </div>
        `;
    } else {
        maneuverBlockHtml = `
            <div class="ficha-card" style="margin-top:8px; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px;">
                <div class="ficha-card-label"><span class="block-icon">ℹ️</span> ESTADO OPERATIVO (MODO LECTURA)</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                    <span style="font-size:12px; color:#cbd5e1;">Régimen de Válvula:</span>
                    <span style="font-weight:700; font-size:12px; color:${isOpen ? '#10b981' : '#ef4444'};">
                        ${isOpen ? '● ABIERTA (Flujo Activo)' : '🔒 CERRADA (Aislada)'}
                    </span>
                </div>
                <div style="font-size:10px; color:#64748b; margin-top:6px; line-height:1.4;">
                    🔒 <em>La simulación de cierre y maniobras está restringida exclusivamente al perfil <strong>Operación en Terreno</strong>.</em>
                </div>
            </div>
        `;
    }

    let outagePanelHtml = '';
    if (!isOpen) {
        outagePanelHtml = `
            <div class="ficha-card" style="border-left: 3px solid #ef4444; background: linear-gradient(180deg, rgba(239,68,68,0.15) 0%, rgba(15,23,42,0.8) 100%); margin-top:8px;">
                <div class="ficha-card-label" style="color:#f87171;">
                    <span class="hud-pulse-beacon"></span> CORTE DE SUMINISTRO EN CURSO
                </div>
                <div class="ficha-grid-metrics">
                    <div class="ficha-metric-box">
                        <span class="metric-val text-red">${affectedCount}</span>
                        <span class="metric-lbl">Viviendas</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val text-cyan">${pipesKm} <small>km</small></span>
                        <span class="metric-lbl">${pipesCount} Tramos</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val" style="color:#38bdf8;">~${recoveryTime.split(' ')[0]}m</span>
                        <span class="metric-lbl">Purga</span>
                    </div>
                </div>
                <div style="font-size:10.5px; color:#cbd5e1; margin-top:8px; line-height:1.4;">
                    <strong>Sector:</strong> ${sectorAfectado}
                </div>
                <div class="outage-buttons-row" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin-top:8px;">
                    <button class="btn-outage-sm btn-outage-focus btn-icon-only" onclick="focusValveOutage('${props.id}')" title="🔍 Enfocar sector afectado en el mapa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                    <button class="btn-outage-sm btn-outage-wsp btn-icon-only" onclick="openWhatsAppBroadcastModal('${props.id}')" title="Generar comunicado oficial de WhatsApp">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align:middle; display:inline-block;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                    <button class="btn-outage-sm btn-outage-table btn-icon-only" onclick="toggleOutageClientsList('${props.id}')" title="📋 Nómina de afectados (${affectedCount} viviendas)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>
                    </button>
                    <button class="btn-outage-sm btn-outage-dl btn-icon-only" onclick="exportOutageClientsCSV('${props.id}')" title="📥 Descargar planilla CSV para terreno">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                </div>
                <button class="btn-outage-wsp-banner" onclick="openWhatsAppBroadcastModal('${props.id}')" style="
                    width: 100%;
                    margin-top: 8px;
                    padding: 8px 10px;
                    background: linear-gradient(135deg, #15803d, #22c55e);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align:middle;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span>📲 Redactar Comunicado de Corte (WhatsApp)</span>
                </button>
                <div id="outage-clients-scroll-${props.id}" class="outage-clients-scroll" style="display:none; margin-top:8px;">
                    ${renderOutageClientsList(props.id)}
                </div>
            </div>
        `;
    }

    const html = `
        <div class="ficha-container">
            <!-- Bloque 1: Identidad & Ubicación -->
            <div class="ficha-card ficha-header-card">
                <div class="ficha-avatar">⚙️</div>
                <div class="ficha-title-wrap">
                    <h3 class="ficha-main-title">${props.id} · ${props.tipo || 'Válvula Compuerta'}</h3>
                    <div class="ficha-tags-row">
                        <span class="ficha-tag font-mono">📏 ${props.diametro || '75 mm'}</span>
                        <span class="ficha-tag">📦 ${props.camara || 'En Cámara'}</span>
                        <span class="ficha-status-badge ${isOpen ? 'badge-open' : 'badge-closed'}">
                            ${isOpen ? '● ABIERTA' : '🔒 CERRADA'}
                        </span>
                    </div>
                    <div class="ficha-sublocation">📍 ${props.ubicacion || 'Sector Santa Juana'}</div>
                </div>
            </div>

            <!-- Bloque 2: Maniobra según Rol -->
            ${maneuverBlockHtml}

            <!-- Bloque 3: Afectación si está cerrada -->
            ${outagePanelHtml}

            <button class="btn-act btn-repair" style="width:100%; margin-top:8px; padding:6px 10px; font-size:11px;" onclick="printValveSheet('${props.id}')">
                📄 Imprimir Ficha Oficial
            </button>
        </div>
    `;

    setDrawerDetail(props.id + ' - ' + (props.nombre || props.id), badge, html);

    if (window.innerWidth < 768 && !isOpen) {
        setupManeuverPeekBar({
            mode: 'valve',
            icon: '🔒',
            title: `Válvula ${props.id} CERRADA`,
            sub: `${affectedCount} familias sin agua`,
            restoreText: '🔓 Abrir Válvula',
            onRestore: `toggleValveState('${props.id}')`
        });
        showToastNotification(`🔒 Válvula ${props.id} aislada: 88% del mapa despejado`);
    } else if (isOpen) {
        const drawer = document.getElementById('drawer-right');
        if (drawer) {
            drawer.classList.remove('maneuver-peek');
            drawer.classList.remove('maneuver-active');
        }
    }
}

function toggleValveState(valveId) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 La maniobra de válvulas es exclusiva del perfil Operación en Terreno');
        }
        return;
    }
    const isCurrentlyOpen = AppState.valvesState[valveId] !== false;
    const newState = !isCurrentlyOpen;
    AppState.valvesState[valveId] = newState;

    if (layers.valvulas) {
        layers.valvulas.clearLayers();
        layers.valvulas.addData(json_Valvulas_GeoConecta);
    }

    if (!newState) {
        activateValveOutage(valveId);
    } else {
        clearValveOutage(valveId);
    }

    const f = json_Valvulas_GeoConecta.features.find(x => x.properties.id === valveId);
    if (f) showValveDetails(f.properties);
}

function activateValveOutage(valveId) {
    if (typeof VALVE_OUTAGE_SIMULATION_DB === 'undefined') return;
    const sim = VALVE_OUTAGE_SIMULATION_DB[valveId];
    if (!sim) return;

    AppState.activeValveOutage = valveId;

    if (layers.redes) {
        layers.redes.setStyle(stylePipes);
    }

    if (!layers.outageLayer) {
        layers.outageLayer = L.featureGroup().addTo(map);
    } else {
        layers.outageLayer.clearLayers();
    }

    const boundsPoints = [];
    const valveFeat = json_Valvulas_GeoConecta.features.find(f => f.properties.id === valveId);
    if (valveFeat) {
        const vc = valveFeat.geometry.coordinates;
        boundsPoints.push([vc[1], vc[0]]);
    }

    sim.consumers.forEach(c => {
        const latlng = [c.coords[1], c.coords[0]];
        boundsPoints.push(latlng);

        // 1. Halo moderado de advertencia (anillo exterior suave que destaca el predio sin invadir el mapa)
        const halo = L.circleMarker(latlng, {
            pane: 'outagePane',
            radius: 11,
            fillColor: '#ef4444',
            color: '#f87171',
            weight: 1.5,
            dashArray: '3, 3',
            opacity: 0.85,
            fillOpacity: 0.18,
            className: 'outage-halo-pulse',
            interactive: false
        });
        layers.outageLayer.addLayer(halo);

        // 2. Nodo central de corte
        const marker = L.circleMarker(latlng, {
            pane: 'outagePane',
            radius: 5.5,
            fillColor: '#ef4444',
            color: '#ffffff',
            weight: 1.5,
            opacity: 1.0,
            fillOpacity: 0.95,
            className: 'outage-marker-pulse'
        });

        marker.bindTooltip(`⚠️ ${c.name} (Sin Agua)`, {
            direction: 'top',
            offset: [0, -6],
            className: 'outage-tooltip'
        });

        const popupHtml = `
            <div class="popup-consumer" style="border-top: 3px solid #ef4444; min-width: 230px;">
                <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:4px; gap:6px;">
                    <span style="font-size:10px; font-weight:800; color:#ef4444; letter-spacing:0.4px; display:flex; align-items:center; gap:4px;">
                        <span class="hud-pulse-beacon"></span> VIVIENDA SIN AGUA
                    </span>
                    <span style="font-size:9px; font-weight:700; padding:1px 6px; border-radius:4px; background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.4);">
                        SIMULACIÓN
                    </span>
                </div>
                <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:3px; line-height:1.2;">
                    ${c.name}
                </div>
                <div style="font-size:11px; color:#cbd5e1; margin-bottom:3px;">
                    Arranque: <strong style="color:#00d2ff;">${c.id}</strong> | Medidor: <strong>${c.meter}</strong>
                </div>
                <div style="font-size:10.5px; color:#94a3b8; margin-bottom:6px;">
                    RUT Titular: <strong style="color:#f1f5f9;">${c.rut}</strong>
                </div>
                <div style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); border-radius:6px; padding:6px 8px; font-size:10px; color:#fca5a5; line-height:1.35; margin-bottom:8px;">
                    Afectado por maniobra en válvula <strong>${valveId}</strong>.<br>
                    • Sector: <em>${sim.sector}</em><br>
                    • Reposición estimada: <strong>${sim.recovery_time || '15 a 30 min'}</strong>
                </div>
                <button class="btn-popup-view-detail" onclick="openConsumerDrawerFromPopup('${c.id}')" style="
                    width: 100%;
                    padding: 6px 8px;
                    background: linear-gradient(135deg, #b91c1c, #ef4444);
                    border: none;
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 10.5px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                ">
                    <span>📋</span> Ver Ficha Técnica del Arranque
                </button>
            </div>
        `;
        marker.bindPopup(popupHtml, { className: 'aquavisor-popup' });
        layers.outageLayer.addLayer(marker);
    });

    showOutageHUD(valveId, sim);

    if (boundsPoints.length > 0) {
        const bounds = L.latLngBounds(boundsPoints);
        if (window.innerWidth < 768) {
            map.fitBounds(bounds.pad(0.18), {
                maxZoom: 16,
                paddingTopLeft: [20, 20],
                paddingBottomRight: [20, 85],
                duration: 1.0
            });
        } else {
            map.fitBounds(bounds.pad(0.12), { maxZoom: 16, duration: 1.0 });
        }
    }
}

function clearValveOutage(valveId) {
    if (AppState.activeValveOutage === valveId || !valveId) {
        AppState.activeValveOutage = null;
        if (layers.outageLayer) {
            layers.outageLayer.clearLayers();
        }
        if (layers.redes) {
            layers.redes.setStyle(stylePipes);
        }
        const hud = document.getElementById('valve-outage-hud');
        if (hud) hud.remove();

        const drawer = document.getElementById('drawer-right');
        if (drawer) {
            drawer.classList.remove('maneuver-peek');
            drawer.classList.remove('maneuver-active');
        }
    }
}

function showOutageHUD(valveId, sim) {
    let hud = document.getElementById('valve-outage-hud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'valve-outage-hud';
        hud.className = 'valve-outage-hud';
        document.body.appendChild(hud);
    }

    hud.innerHTML = `
        <span class="hud-pulse-beacon"></span>
        <div class="hud-pill-content">
            <strong>${valveId} cerrada:</strong> ${sim.affectedCount} viviendas aisladas (${sim.pipesKm} km)
        </div>
        <button class="btn-hud-pill-focus" onclick="focusValveOutage('${valveId}')" title="🔍 Enfocar en mapa">🔍</button>
        <button class="btn-hud-pill-whatsapp" onclick="openWhatsAppBroadcastModal('${valveId}')" title="Generar comunicado oficial WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align:middle; display:inline-block;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
        <button class="btn-hud-pill-restore" onclick="toggleValveState('${valveId}')" title="🔓 Restablecer / Abrir">🔓</button>
        <button class="btn-hud-pill-close" onclick="clearValveOutage('${valveId}')" title="Cerrar aviso">✕</button>
    `;
}

function focusValveOutage(valveId) {
    if (layers.outageLayer && layers.outageLayer.getLayers().length > 0) {
        if (window.innerWidth < 768) {
            const drawer = document.getElementById('drawer-right');
            if (drawer && !drawer.classList.contains('maneuver-peek')) {
                toggleManeuverSheetPeek();
            }
            map.fitBounds(layers.outageLayer.getBounds().pad(0.18), {
                maxZoom: 16,
                paddingTopLeft: [20, 20],
                paddingBottomRight: [20, 85],
                duration: 0.8
            });
            return;
        }
        map.fitBounds(layers.outageLayer.getBounds().pad(0.12), { maxZoom: 16, duration: 0.8 });
    }
}

function toggleOutageClientsList(valveId) {
    const el = document.getElementById(`outage-clients-scroll-${valveId}`);
    if (el) {
        el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
    }
}

function renderOutageClientsList(valveId) {
    if (typeof VALVE_OUTAGE_SIMULATION_DB === 'undefined') return '';
    const sim = VALVE_OUTAGE_SIMULATION_DB[valveId];
    if (!sim || !sim.consumers || sim.consumers.length === 0) {
        return '<div style="font-size:11px; color:#94a3b8; padding:8px; text-align:center;">No se registraron consumidores directos en este tramo.</div>';
    }

    return sim.consumers.map(c => `
        <div class="outage-client-item" onclick="zoomToConsumerCoords(${c.coords[1]}, ${c.coords[0]})" style="cursor:pointer;" title="Haga clic para centrar en el mapa">
            <div>
                <div class="outage-client-name">🏠 ${c.name}</div>
                <div class="outage-client-meta">Código: ${c.id} | Med: ${c.meter}</div>
            </div>
            <span style="font-size:9.5px; color:#ef4444; font-weight:800; background:rgba(239,68,68,0.18); padding:2px 5px; border-radius:3px;">SIN AGUA</span>
        </div>
    `).join('');
}

function zoomToConsumerCoords(lat, lng) {
    map.flyTo([lat, lng], 17, { duration: 0.8 });
}

function exportOutageClientsCSV(valveId) {
    if (typeof VALVE_OUTAGE_SIMULATION_DB === 'undefined') return;
    const sim = VALVE_OUTAGE_SIMULATION_DB[valveId];
    if (!sim || !sim.consumers) return;

    let csv = '\uFEFF"ID_Vivienda","Nombre_Titular_Predio","Num_Medidor","RUT","Estado_Comercial","Latitud","Longitud","Sector_Afectado","Valvula_Corte"\n';
    sim.consumers.forEach(c => {
        csv += `"${c.id}","${c.name}","${c.meter}","${c.rut}","${c.status}","${c.coords[1]}","${c.coords[0]}","${sim.sector}","${valveId}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nomina_Corte_Suministro_${valveId}_Santa_Juana.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showConsumerDetails(props) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio') {
        return;
    }
    const tabDetail = document.getElementById('tab-btn-detail');
    if (tabDetail) {
        tabDetail.style.display = 'inline-flex';
        tabDetail.innerHTML = (typeof currentAppRole !== 'undefined' && currentAppRole === 'administracion') ? '👤 Ficha Socio' : 'ℹ️ Ficha';
    }
    const estado = props.estado_comercial || 'Al Día';
    const isAlDia = estado.includes('Al Día');
    const isAviso = estado.includes('Aviso') || estado.includes('Moroso');
    const statusClass = isAlDia ? 'badge-aldia' : (isAviso ? 'badge-aviso' : 'badge-corte');
    const badgeText = isAlDia ? '● AL DÍA' : (isAviso ? '⚠️ AVISO' : '🔒 CORTE');

    let con = null;
    if (typeof json_Conexiones_Domiciliarias !== 'undefined') {
        con = json_Conexiones_Domiciliarias.features.find(f => f.properties.id_arranque === props.id_arranque);
    }
    const isConcesion = con ? true : (props.sector ? !props.sector.includes('Fuera') : true);

    const comm = typeof COMMERCIAL_DB !== 'undefined' ? COMMERCIAL_DB[props.id_arranque] : null;
    let debtMonths = comm ? comm.debtMonths : 0;
    let debtAmount = comm ? comm.debtAmount : 0;
    let currentBill = comm ? comm.currentBill : 13500;
    let lastPayment = comm ? comm.lastPayment : '2026-10-10';
    let debtStatusTxt = debtMonths > 0 ? ('$' + debtAmount.toLocaleString('es-CL') + ' (' + debtMonths + ' m)') : 'Al Día ($0)';
    let commClass = debtMonths >= 3 ? 'comm-debt-danger' : (debtMonths > 0 ? 'comm-debt-warning' : '');
    let debtColor = debtMonths >= 3 ? 'text-red' : (debtMonths > 0 ? 'text-yellow' : 'text-green');

    const html = `
        <div class="ficha-container">
            <!-- Bloque 1: Identidad & Titular -->
            <div class="ficha-card ficha-header-card">
                <div class="ficha-avatar">🏠</div>
                <div class="ficha-title-wrap">
                    <h3 class="ficha-main-title">${props.socio || 'Arranque Domiciliario'}</h3>
                    <div class="ficha-tags-row">
                        <span class="ficha-tag font-mono">${props.id_arranque || '-'}</span>
                        <span class="ficha-tag">${props.rut || 'RUT S/I'}</span>
                        <span class="ficha-tag font-mono">📟 ${props.n_medidor || '-'}</span>
                        <span class="ficha-status-badge ${statusClass}">${badgeText}</span>
                    </div>
                </div>
            </div>

            <!-- Bloque 2: Métricas Hidráulicas -->
            <div class="ficha-card ficha-block-hydro">
                <div class="ficha-card-label"><span class="block-icon">💧</span> CONDICIONES HIDRÁULICAS</div>
                <div class="ficha-grid-metrics">
                    <div class="ficha-metric-box">
                        <span class="metric-val text-cyan">${props.presion_servicio_mca || '18.4'} <small>mca</small></span>
                        <span class="metric-lbl">Presión Grifo</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val">${props.cota_terreno_m || '142.0'} <small>msnm</small></span>
                        <span class="metric-lbl">Cota Terreno</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val">${props.consumo_prom_m3 || '16.5'} <small>m³/m</small></span>
                        <span class="metric-lbl">Consumo Prom.</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val text-cyan">${con ? con.properties.id_tramo_red : 'TUB-04'}</span>
                        <span class="metric-lbl">Empalme (${con ? con.properties.longitud_m + 'm' : '6m'})</span>
                    </div>
                </div>
            </div>

            <!-- Bloque 3: Estado Comercial y Cobranza (Oculto en Rol Terreno) -->
            <div class="ficha-card ficha-block-commercial ${commClass}">
                <div class="ficha-card-label"><span class="block-icon">💰</span> ESTADO COMERCIAL & FACTURACIÓN</div>
                <div class="ficha-grid-metrics">
                    <div class="ficha-metric-box">
                        <span class="metric-val ${debtColor}">$${currentBill.toLocaleString('es-CL')}</span>
                        <span class="metric-lbl">Boleta Mes</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val ${debtColor}">${debtStatusTxt}</span>
                        <span class="metric-lbl">Deuda Total</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val font-mono">${lastPayment}</span>
                        <span class="metric-lbl">Último Pago</span>
                    </div>
                </div>
                ${debtMonths >= 3 ? '<div class="ficha-alert-banner">⚠️ Socio en causal de corte (Deuda acumulada > 3 meses)</div>' : ''}
            </div>

            <!-- Bloque 4: Instalación y Legal -->
            <div class="ficha-card ficha-block-infra">
                <div class="ficha-card-label"><span class="block-icon">📐</span> INSTALACIÓN Y CONCESIÓN</div>
                <div class="ficha-chips-row">
                    <span class="ficha-chip"><span class="chip-k">Diámetro:</span> ${props.diametro || '1/2" HDPE'}</span>
                    <span class="ficha-chip"><span class="chip-k">Uso:</span> ${props.tipo_uso || 'Residencial'}</span>
                    <span class="ficha-chip"><span class="chip-k">Año:</span> ${props.fecha_instalacion || '2019'}</span>
                    <span class="ficha-chip ${isConcesion ? 'chip-success' : 'chip-warning'}">
                        ${isConcesion ? '✓ Concesión DOH' : '⚠️ Fuera de Concesión'}
                    </span>
                </div>
            </div>
        </div>
    `;

    const badge = '<span class="drawer-badge badge-consumer">ARRANQUE Y MEDIDOR</span>';
    setDrawerDetail(props.socio || 'Arranque Domiciliario', badge, html);
}

window.openConsumerDrawerFromPopup = function(arranqueId) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio') {
        return;
    }
    if (typeof json_Arranques_GeoConecta !== 'undefined') {
        const item = json_Arranques_GeoConecta.features.find(f => f.properties.id_arranque === arranqueId);
        if (item) {
            map.closePopup();
            showConsumerDetails(item.properties);
        }
    }
};

window.openSourceDrawerFromPopup = function(idOrName) {
    if (typeof map !== 'undefined' && map && map.closePopup) map.closePopup();
    let item = null;
    if (typeof json_Fuentefuente__output_point_layer_6 !== 'undefined' && json_Fuentefuente__output_point_layer_6.features) {
        item = json_Fuentefuente__output_point_layer_6.features.find(f => {
            if (!f.properties) return false;
            if (f.properties.fid === idOrName) return true;
            if (f.properties.name === idOrName) return true;
            if (typeof idOrName === 'string' && f.properties.name && f.properties.name.toLowerCase().includes(idOrName.toLowerCase())) return true;
            return false;
        });
    }
    if (!item && typeof json_Obras_Captacion_Almacenamiento !== 'undefined' && json_Obras_Captacion_Almacenamiento.features) {
        item = json_Obras_Captacion_Almacenamiento.features.find(f => {
            if (!f.properties) return false;
            return f.properties.fid === idOrName || f.properties.name === idOrName;
        });
    }
    if (item) {
        const p = item.properties;
        const isTank = (p.name && (p.name.includes('50') || p.name.includes('25') || p.name.includes('Estanque') || p.name.includes('SE'))) || 
                       (p.tipo_obra && p.tipo_obra.includes('Estanque'));
        showSourceDetails(p, isTank);
    } else {
        showSourceDetails({
            fid: 'INF-CALV-01',
            name: 'Estanque El Calvario (50 m³)',
            tipo_obra: 'Estanque de Regulación Semienterrado',
            capacidad: '50.0 m³',
            sistema: 'SSR Santa Juana Nº9 - El Calvario',
            estado: 'Operativo / En Servicio',
            cota_terreno: 364.0,
            altura_torre: 15.0,
            salida: 'PVC 110 mm'
        }, true);
    }
};
window.showSourceDetailsFromPopup = window.openSourceDrawerFromPopup;

function showSourceDetails(props, isTank) {
    const isDirectorio = typeof currentAppRole !== 'undefined' && currentAppRole === 'directorio';
    const tabDetail = document.getElementById('tab-btn-detail');
    if (tabDetail) {
        tabDetail.style.display = 'inline-flex';
        tabDetail.innerHTML = isDirectorio ? '🏛️ Ficha Patrimonial' : 'ℹ️ Ficha';
    }
    const isProyectado = props.estado && props.estado.includes('Proyectado');
    const badgeText = isTank ? (isProyectado ? 'ESTANQUE PROYECTADO' : 'ESTANQUE DE REGULACIÓN') : (isProyectado ? 'CAPTACIÓN PROYECTADA' : 'CAPTACIÓN POZO');
    const badgeBg = isProyectado ? 'rgba(245,158,11,0.2)' : 'rgba(2,132,199,0.3)';
    const badgeColor = isProyectado ? '#f59e0b' : '#00d2ff';
    const badge = `<span class="drawer-badge" style="background:${badgeBg}; color:${badgeColor};">${badgeText}</span>`;

    const html = `
        <div class="ficha-container">
            <!-- Bloque 1: Identidad -->
            <div class="ficha-card ficha-header-card">
                <div class="ficha-avatar">${isTank ? '🏢' : '💧'}</div>
                <div class="ficha-title-wrap">
                    <h3 class="ficha-main-title">${props.name || (isTank ? 'Estanque 50 m³' : 'Pozo Profundo')}</h3>
                    <div class="ficha-tags-row">
                        <span class="ficha-tag">${props.sistema || 'Santa Juana Nº9'}</span>
                        <span class="ficha-status-badge ${isProyectado ? 'badge-aviso' : 'badge-aldia'}">
                            ● ${props.estado || 'Operativo'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Bloque 2: Capacidad Operativa -->
            <div class="ficha-card ficha-block-hydro">
                <div class="ficha-card-label"><span class="block-icon">⚡</span> CAPACIDAD Y SUMINISTRO</div>
                <div class="ficha-grid-metrics">
                    <div class="ficha-metric-box">
                        <span class="metric-val text-cyan">${props.capacidad || (isTank ? '50.0 m³' : '6.8 L/s')}</span>
                        <span class="metric-lbl">${isTank ? 'Capacidad Útil' : 'Caudal Explotación'}</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val">${isTank ? (props.altura_torre ? props.altura_torre + ' m' : '15 m') : (props.bomba || '7.5 HP')}</span>
                        <span class="metric-lbl">${isTank ? 'Altura Torre' : 'Bomba Submergible'}</span>
                    </div>
                </div>
            </div>

            <!-- Bloque 3: Antecedentes Legales DOH / DGA -->
            <div class="ficha-card ficha-block-infra">
                <div class="ficha-card-label"><span class="block-icon">🏛️</span> ANTECEDENTES TÉCNICOS DOH / DGA</div>
                <div class="ficha-chips-row">
                    <span class="ficha-chip"><span class="chip-k">${isTank ? 'Salida Red:' : 'Derecho DGA:'}</span> ${isTank ? (props.salida || 'PVC 110 mm') : (props.derecho_dga || '8.0 L/s Consuntivo')}</span>
                    <span class="ficha-chip chip-success">✓ Inscrito DOH</span>
                </div>
            </div>
        </div>
    `;

    setDrawerDetail(props.name || 'Infraestructura', badge, html);
}

function showPipeDetails(props) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 Ficha técnica de tubería reservada a Operación en Terreno');
        }
        return;
    }
    const diam = props.diametro_nominal || '75 mm';
    const isTroncal = diam.includes('110') || diam.includes('90');
    const isImpulsion = props.id_tramo === 'TUB-11' || (props.sector && props.sector.includes('Impulsión'));
    const hierarchyText = isImpulsion ? 'Impulsión' : (isTroncal ? 'Matriz Troncal' : 'Ramal');
    const hierarchyBadge = isImpulsion ? 'badge-corte' : (isTroncal ? 'badge-aviso' : 'badge-open');

    const html = `
        <div class="ficha-container">
            <!-- Bloque 1: Identidad -->
            <div class="ficha-card ficha-header-card">
                <div class="ficha-avatar">📏</div>
                <div class="ficha-title-wrap">
                    <h3 class="ficha-main-title">${props.id_tramo} · ${props.sector || 'Red de Distribución'}</h3>
                    <div class="ficha-tags-row">
                        <span class="ficha-tag font-mono">${hierarchyText}</span>
                        <span class="ficha-tag font-mono">📐 ${props.diametro_nominal || '75 mm'}</span>
                        <span class="ficha-status-badge badge-open">● ${props.estado_tuberia || 'Operativo'}</span>
                    </div>
                </div>
            </div>

            <!-- Bloque 2: Parámetros Hidráulicos EPANET -->
            <div class="ficha-card ficha-block-hydro">
                <div class="ficha-card-label"><span class="block-icon">💧</span> HIDRÁULICA Y MODELO EPANET</div>
                <div class="ficha-grid-metrics">
                    <div class="ficha-metric-box">
                        <span class="metric-val text-cyan">${props.caudal_diseno_lps || '6.8'} <small>L/s</small></span>
                        <span class="metric-lbl">Caudal Diseño</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val">C = ${props.rugosidad_hazen_williams || '150'}</span>
                        <span class="metric-lbl">Rugosidad HW</span>
                    </div>
                    <div class="ficha-metric-box">
                        <span class="metric-val">${props.diametro_interior_mm ? props.diametro_interior_mm + ' mm' : '69 mm'}</span>
                        <span class="metric-lbl">Diám. Interior</span>
                    </div>
                </div>
            </div>

            <!-- Bloque 3: Especificaciones Constructivas -->
            <div class="ficha-card ficha-block-infra">
                <div class="ficha-card-label"><span class="block-icon">🧱</span> ESPECIFICACIONES CONSTRUCTIVAS</div>
                <div class="ficha-chips-row">
                    <span class="ficha-chip"><span class="chip-k">Material:</span> ${props.material || 'HDPE'} (${props.clase || 'PE-100 PN10'})</span>
                    <span class="ficha-chip"><span class="chip-k">Profundidad:</span> ${props.profundidad_tapada_m ? props.profundidad_tapada_m + ' m' : '1.1 m'}</span>
                    <span class="ficha-chip"><span class="chip-k">Año:</span> ${props.ano_instalacion || '2019'}</span>
                </div>
            </div>

            <!-- Bloque 4: Operación y Aislamiento de Red (Exclusivo Terreno) -->
            ${(typeof currentAppRole !== 'undefined' && currentAppRole === 'terreno') ? `
            <div class="ficha-card ficha-block-maneuver" style="margin-top:10px;">
                <div class="ficha-card-label"><span class="block-icon">🚨</span> GESTIÓN DE INCIDENCIAS</div>
                <div style="font-size:10px; color:var(--text-secondary); margin-bottom:8px; line-height:1.4;">
                    Simula la rotura de esta tubería para calcular automáticamente las válvulas de cierre y los socios afectados.
                </div>
                <button class="btn-ficha-burst" onclick="simulateBurstByPipeId('${props.id_tramo}')">
                    <span>🚨</span> Simular Rotura en este Tramo
                </button>
            </div>
            ` : ''}
        </div>
    `;

    const badge = '<span class="drawer-badge" style="background:rgba(2,132,199,0.2); color:#00d2ff;">RED DE TUBERÍA</span>';
    setDrawerDetail(props.id_tramo + ' - ' + props.sector, badge, html);
}

window.openPipeDrawerFromPopup = function(pipeId) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 Ficha de red reservada exclusivamente al perfil Operación en Terreno');
        }
        return;
    }
    if (typeof map !== 'undefined' && map.closePopup) map.closePopup();
    if (typeof json_Redes_Enriquecidas !== 'undefined') {
        const item = json_Redes_Enriquecidas.features.find(f => f.properties.id_tramo === pipeId);
        if (item) {
            showPipeDetails(item.properties);
        }
    }
};

window.openValveDrawerFromPopup = function(valveId) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 Ficha técnica y maniobras reservadas a Operación en Terreno');
        }
        return;
    }
    if (typeof map !== 'undefined' && map.closePopup) map.closePopup();
    if (typeof json_Valvulas_GeoConecta !== 'undefined') {
        const item = json_Valvulas_GeoConecta.features.find(f => f.properties.id === valveId);
        if (item) {
            showValveDetails(item.properties);
        }
    }
};

window.toggleValveStateFromPopup = function(valveId) {
    if (typeof map !== 'undefined' && map.closePopup) map.closePopup();
    toggleValveState(valveId);
};

// window.openSourceDrawerFromPopup está unificado y expuesto previamente en el gestor de fuentes

window.openAccessoryDrawerFromPopup = function(accId) {
    if (typeof map !== 'undefined' && map.closePopup) map.closePopup();
    if (typeof json_Accesorios_GeoConecta !== 'undefined') {
        const item = json_Accesorios_GeoConecta.features.find(f => f.properties.id === accId);
        if (item) {
            showAccessoryDetails(item.properties);
        }
    }
};

window.simulateBurstByPipeId = function(pipeId) {
    if (typeof currentAppRole !== 'undefined' && currentAppRole !== 'terreno') {
        if (typeof showToastNotification === 'function') {
            showToastNotification('🔒 La simulación de rotura está reservada a Operación en Terreno');
        }
        return;
    }
    if (!layers || !layers.redes) return;
    let foundLayer = null;
    layers.redes.eachLayer(l => {
        if (l.feature && l.feature.properties && l.feature.properties.id_tramo === pipeId) {
            foundLayer = l;
        }
    });
    if (foundLayer) {
        if (map && map.closePopup) map.closePopup();
        triggerBurstSimulation(foundLayer.feature, foundLayer);
    }
};

function showAccessoryDetails(props) {
    const badge = `<span class="drawer-badge" style="background:rgba(249,115,22,0.2); color:#f97316;">ACCESORIO</span>`;

    const html = `
        <table class="prop-table">
            <tr><td class="prop-name">Código:</td><td class="prop-val"><strong>${props.id}</strong></td></tr>
            <tr><td class="prop-name">Tipo:</td><td class="prop-val">${props.tipo}</td></tr>
            <tr><td class="prop-name">Diámetro:</td><td class="prop-val">${props.diametro}</td></tr>
            <tr><td class="prop-name">Ubicación:</td><td class="prop-val">${props.ubicacion}</td></tr>
            <tr><td class="prop-name">Presión:</td><td class="prop-val" style="color:var(--accent-green)">${props.presion_dinamica}</td></tr>
        </table>
    `;

    setDrawerDetail(props.id + ' - ' + props.tipo, badge, html);
}

function printValveSheet(valveId) {
    const v = json_Valvulas_GeoConecta.features.find(x => x.properties.id === valveId);
    if (!v) return;
    const p = v.properties;

    const printWin = window.open('', '', 'width=720,height=560');
    printWin.document.write(`
        <html>
        <head>
            <title>Ficha Técnica - ${p.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
                h2 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; font-size: 18px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                td { padding: 6px; border: 1px solid #ccc; font-size: 12px; }
                td.h { font-weight: bold; background: #f0f4f8; width: 35%; }
                .box-man { background: #e0f2fe; border: 2px dashed #0284c7; padding: 12px; margin-top: 15px; text-align: center; }
                .sig-box { margin-top: 35px; display: flex; justify-content: space-around; }
                .sig-line { width: 200px; border-top: 1px solid #333; text-align: center; font-size: 11px; padding-top: 4px; }
            </style>
        </head>
        <body>
            <h2>AQUAVISOR SSR - FICHA OPERATIVA DE MANIOBRA</h2>
            <p style="font-size:12px;"><strong>Comuna:</strong> San Ignacio | <strong>Sector:</strong> Santa Juana - El Calvario | <strong>Código:</strong> ${p.id}</p>
            <table>
                <tr><td class="h">Identificación:</td><td>${p.nombre}</td></tr>
                <tr><td class="h">Ubicación Física:</td><td>${p.ubicacion}</td></tr>
                <tr><td class="h">Tipo y Diámetro:</td><td>${p.tipo} - ${p.diametro} (${p.material})</td></tr>
                <tr><td class="h">Cámara:</td><td>${p.camara} (Prof. ${p.profundidad_m} m)</td></tr>
                <tr><td class="h">Sector Afectado por Corte:</td><td>${p.sector_afectado}</td></tr>
            </table>

            <div class="box-man">
                <h3 style="margin:0 0 6px 0; color:#0369a1; font-size:14px;">INSTRUCCIÓN OPERATIVA DE CORTE</h3>
                <p style="font-size:15px; margin:4px 0;"><strong>Sentido de Giro:</strong> ${p.sentido_giro}</p>
                <p style="font-size:15px; margin:4px 0;"><strong>Vueltas de Cierre:</strong> ${p.vueltas_cierre} VUELTAS COMPLETAS</p>
            </div>

            <div class="sig-box">
                <div class="sig-line">Operador / Fontanero SSR</div>
                <div class="sig-line">Director SECPLA San Ignacio</div>
                <div class="sig-line">Consultor GeoConecta</div>
            </div>
            <script>window.print();</script>
        </body>
        </html>
    `);
    printWin.document.close();
}

// ------------------------------------------------------------------------------
// 7. EVENT LISTENERS
// ------------------------------------------------------------------------------
function initEventListeners() {
    const emBtn = document.getElementById('btn-emergency-mode');
    if (emBtn) emBtn.addEventListener('click', toggleEmergencyMode);
}

// ------------------------------------------------------------------------------
// 8. BUSCADOR PREDICTIVO
// ------------------------------------------------------------------------------
function initSearchEngine() {
    const input = document.getElementById('search-input');
    const resultsBox = document.getElementById('search-results');
    if (!input || !resultsBox) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            resultsBox.style.display = 'none';
            resultsBox.innerHTML = '';
            return;
        }

        const matches = [];

        if (typeof json_Valvulas_GeoConecta !== 'undefined') {
            json_Valvulas_GeoConecta.features.forEach(f => {
                const p = f.properties;
                if (p.id.toLowerCase().includes(query) || p.nombre.toLowerCase().includes(query)) {
                    matches.push({
                        title: p.id + ' - ' + p.nombre,
                        sub: p.diametro + ' | ' + p.ubicacion,
                        tag: 'VÁLVULA',
                        coords: f.geometry.coordinates,
                        type: 'valve',
                        props: p
                    });
                }
            });
        }

        if (typeof json_Arranques_GeoConecta !== 'undefined') {
            json_Arranques_GeoConecta.features.forEach(f => {
                const p = f.properties;
                const matchName = p.socio && p.socio.toLowerCase().includes(query);
                const matchRut = p.rut && p.rut.toLowerCase().includes(query);
                const matchMed = p.n_medidor && p.n_medidor.toLowerCase().includes(query);
                const matchArr = p.id_arranque && p.id_arranque.toLowerCase().includes(query);
                if (matchName || matchRut || matchMed || matchArr) {
                    matches.push({
                        title: p.socio,
                        sub: `${p.id_arranque} | Med: ${p.n_medidor} | ${p.sistema || 'SSR'}`,
                        tag: 'CLIENTE',
                        coords: f.geometry.coordinates,
                        type: 'consumer',
                        props: p
                    });
                }
            });
        }

        if (typeof json_Redes_Enriquecidas !== 'undefined') {
            json_Redes_Enriquecidas.features.forEach(f => {
                const p = f.properties;
                const matchId = p.id_tramo && p.id_tramo.toLowerCase().includes(query);
                const matchSec = p.sector && p.sector.toLowerCase().includes(query);
                const matchMat = p.material && p.material.toLowerCase().includes(query);
                if (matchId || matchSec || matchMat) {
                    let coords = [-71.9068, -36.8483];
                    if (f.geometry && f.geometry.coordinates) {
                        const line = f.geometry.type === 'MultiLineString' ? f.geometry.coordinates[0] : f.geometry.coordinates;
                        if (line && line.length) {
                            coords = line[Math.floor(line.length / 2)];
                        }
                    }
                    matches.push({
                        title: `${p.id_tramo} - ${p.sector}`,
                        sub: `Diámetro: ${p.diametro_nominal} | Material: ${p.material}`,
                        tag: 'TUBERÍA',
                        coords: coords,
                        type: 'pipe',
                        props: p
                    });
                }
            });
        }

        if (matches.length === 0) {
            resultsBox.innerHTML = '<div style="padding:8px; font-size:11px; color:#888;">No se encontraron resultados</div>';
            resultsBox.style.display = 'block';
            return;
        }

        resultsBox.innerHTML = matches.slice(0, 8).map(m => `
            <div class="search-item" onclick="onSearchResultClick('${m.type}', '${encodeURIComponent(JSON.stringify(m.props))}', ${m.coords[0]}, ${m.coords[1]})">
                <div>
                    <div class="item-title">${m.title}</div>
                    <div class="item-sub">${m.sub}</div>
                </div>
                <div class="item-tag">${m.tag}</div>
            </div>
        `).join('');

        resultsBox.style.display = 'block';
    });

    const btnMobileSearch = document.getElementById('btn-mobile-search');
    const btnCloseSearch = document.getElementById('btn-close-search');
    const searchContainer = document.getElementById('search-container');

    if (btnMobileSearch && searchContainer) {
        btnMobileSearch.addEventListener('click', (e) => {
            e.stopPropagation();
            searchContainer.classList.toggle('mobile-active');
            if (searchContainer.classList.contains('mobile-active')) {
                input.focus();
            }
        });
    }

    if (btnCloseSearch && searchContainer) {
        btnCloseSearch.addEventListener('click', (e) => {
            e.stopPropagation();
            searchContainer.classList.remove('mobile-active');
            resultsBox.style.display = 'none';
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper') && !e.target.closest('#btn-mobile-search')) {
            resultsBox.style.display = 'none';
            if (searchContainer && window.innerWidth < 768) {
                searchContainer.classList.remove('mobile-active');
            }
        }
    });
}

function onSearchResultClick(type, propsEncoded, lng, lat) {
    const props = JSON.parse(decodeURIComponent(propsEncoded));
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) searchContainer.classList.remove('mobile-active');
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-input').value = '';

    map.flyTo([lat, lng], 17, { duration: 1.0 });

    setTimeout(() => {
        if (type === 'valve') {
            if (layers.valvulas) {
                if (!map.hasLayer(layers.valvulas)) {
                    map.addLayer(layers.valvulas);
                    const chk = document.getElementById('chk-valvulas');
                    if (chk) chk.checked = true;
                }
                layers.valvulas.eachLayer(layer => {
                    if (layer.feature && layer.feature.properties.id === props.id) {
                        layer.openPopup();
                    }
                });
            }
            if (window.closeRightDrawer) window.closeRightDrawer();
        } else if (type === 'consumer') {
            if (layers.arranques) {
                if (!map.hasLayer(layers.arranques)) {
                    map.addLayer(layers.arranques);
                    const chk = document.getElementById('chk-arranques');
                    if (chk) chk.checked = true;
                }
                layers.arranques.eachLayer(layer => {
                    if (layer.feature && layer.feature.properties.id_arranque === props.id_arranque) {
                        layer.openPopup();
                    }
                });
            }
            if (window.closeRightDrawer) window.closeRightDrawer();
        } else if (type === 'pipe') {
            if (layers.redes) {
                layers.redes.eachLayer(layer => {
                    if (layer.feature && layer.feature.properties.id_tramo === props.id_tramo) {
                        if (selectedPipeLayer && layers.redes) {
                            layers.redes.resetStyle(selectedPipeLayer);
                        }
                        selectedPipeLayer = layer;
                        const diam = props.diametro_nominal || '';
                        const isTroncal = diam.includes('110') || diam.includes('90');
                        layer.setStyle({
                            color: '#fbbf24',
                            weight: isTroncal ? 7.0 : 5.5,
                            opacity: 1
                        });
                        layer.bringToFront();
                        layer.openPopup([lat, lng]);
                    }
                });
            }
            if (window.closeRightDrawer) window.closeRightDrawer();
        }
    }, 1100);
}


// ==============================================================================
// 14. ECOSISTEMA 360°: GESTIÓN DE ROLES (RBAC), COBRANZA & COPILOTO IA
// ==============================================================================

// ------------------------------------------------------------------------------
// A. CONTROL DE ROLES Y VISTAS ADAPTATIVAS (RBAC)
// ------------------------------------------------------------------------------
let currentAppRole = 'terreno';

const ROLE_METADATA = {
    'terreno': { icon: '👷', name: 'Operación Terreno', short: 'Operador' },
    'administracion': { icon: '👩‍💼', name: 'Gestión Comercial', short: 'Cobranza' },
    'directorio': { icon: '📊', name: 'Comité y Directorio', short: 'Directorio' },
    'auditor': { icon: '🏛️', name: 'Fiscalización DOH', short: 'Fiscalización' }
};

window.openLandingPortal = function() {
    const portal = document.getElementById('landing-portal');
    if (portal) {
        portal.classList.remove('portal-hidden');
    }
    const chkDirect = document.getElementById('chk-remember-direct-mode');
    if (chkDirect) {
        chkDirect.checked = localStorage.getItem('aquavisor_skip_portal') === 'true';
    }
};

window.closeLandingPortal = function() {
    const portal = document.getElementById('landing-portal');
    if (portal) {
        portal.classList.add('portal-hidden');
    }
};

window.enterAppWithRole = function(role) {
    const chkDirect = document.getElementById('chk-remember-direct-mode');
    if (chkDirect && chkDirect.checked) {
        localStorage.setItem('aquavisor_skip_portal', 'true');
    } else {
        localStorage.removeItem('aquavisor_skip_portal');
    }
    setAppRole(role);
    window.closeLandingPortal();
    if (typeof map !== 'undefined' && map) {
        setTimeout(() => { map.invalidateSize(); }, 300);
    }
};

function initRoleManager() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    const directAccess = urlParams.get('direct') === '1' || urlParams.get('map') === '1' || window.location.hash === '#map';
    const savedDirectPref = localStorage.getItem('aquavisor_skip_portal') === 'true';
    const savedRole = urlRole || localStorage.getItem('aquavisor_role') || 'terreno';

    setAppRole(savedRole);

    // Acceso inteligente: si viene por URL (?direct=1) o si el usuario guardó "Modo Terreno Directo", salta el portal
    if (directAccess || savedDirectPref) {
        window.closeLandingPortal();
    } else {
        // En modo DEMO normal de presentación (por defecto), muestra el portal de bienvenida
        window.openLandingPortal();
    }

    const chkDirect = document.getElementById('chk-remember-direct-mode');
    if (chkDirect) {
        chkDirect.checked = savedDirectPref;
    }
}

function setAppRole(role) {
    currentAppRole = role;
    localStorage.setItem('aquavisor_role', role);

    const meta = ROLE_METADATA[role] || { icon: '👷', name: 'Operación Terreno', short: 'Operador' };
    const roleIcon = document.getElementById('header-role-icon');
    const roleName = document.getElementById('header-role-name');
    const execKpiCard = document.getElementById('executive-kpi-card');

    if (roleIcon) roleIcon.textContent = meta.icon;
    if (roleName) roleName.textContent = meta.name;

    document.body.classList.remove('role-terreno', 'role-administracion', 'role-directorio', 'role-auditor');
    document.body.classList.add('role-' + role);

    // 1. Limpieza rigurosa de paneles y estado residual entre perfiles
    if (window.closeRightDrawer) window.closeRightDrawer();
    const drawerContent = document.getElementById('drawer-content');
    if (drawerContent) drawerContent.innerHTML = '';
    const drawerBadgeContainer = document.getElementById('drawer-badge-container');
    if (drawerBadgeContainer) drawerBadgeContainer.innerHTML = '';
    const drawerTitle = document.getElementById('drawer-title');
    if (drawerTitle) drawerTitle.textContent = 'Detalle de Infraestructura';

    // Desactivar peek bar si existía
    document.body.classList.remove('maneuver-peek');
    const peekBar = document.getElementById('maneuver-peek-bar');
    if (peekBar) peekBar.remove();

    // Filtrado estricto de Pestañas del Panel Lateral según el Perfil
    const tabTelemetry = document.getElementById('tab-btn-telemetry');
    const tabCommercial = document.getElementById('tab-btn-commercial');
    const tabDetail = document.getElementById('tab-btn-detail');

    const legalCard = document.getElementById('directorio-legal-card');
    const scadaGrid = document.getElementById('scada-telemetry-grid');
    const scadaSummary = document.getElementById('scada-summary-box');

    if (role === 'terreno') {
        if (tabTelemetry) tabTelemetry.style.display = 'none';
        if (tabCommercial) tabCommercial.style.display = 'none';
        if (tabDetail) {
            tabDetail.style.display = 'inline-flex';
            tabDetail.innerHTML = 'ℹ️ Ficha';
        }
        if (window.switchRightTab) window.switchRightTab('detail');
        if (window.innerWidth < 768 && window.closeRightDrawer) window.closeRightDrawer();
        if (execKpiCard) execKpiCard.style.display = 'none';
        if (legalCard) legalCard.style.display = 'none';
    } else if (role === 'administracion') {
        if (tabTelemetry) tabTelemetry.style.display = 'none';
        if (tabCommercial) tabCommercial.style.display = 'inline-flex';
        // En administración comercial, la vista primaria es Cobranza; la Ficha se oculta hasta seleccionar un Socio/Arranque
        if (tabDetail) {
            tabDetail.style.display = 'none';
            tabDetail.innerHTML = '👤 Ficha Socio';
        }
        if (window.switchRightTab) window.switchRightTab('commercial');
        if (execKpiCard) execKpiCard.style.display = 'none';
        if (legalCard) legalCard.style.display = 'none';
    } else if (role === 'directorio') {
        if (tabTelemetry) {
            tabTelemetry.style.display = 'inline-flex';
            tabTelemetry.innerHTML = '📊 Gestión';
        }
        if (tabCommercial) tabCommercial.style.display = 'none';
        // Ficha oculta por defecto en Directorio para máxima simplicidad visual
        if (tabDetail) tabDetail.style.display = 'none';
        if (window.switchRightTab) window.switchRightTab('telemetry');

        // Modo Directorio: Exclusivamente métricas maestras de gobernanza (Minimalismo puro)
        if (execKpiCard) execKpiCard.style.display = 'block';
        if (legalCard) legalCard.style.display = 'block';
        if (scadaGrid) scadaGrid.style.display = 'none';
        if (scadaSummary) scadaSummary.style.display = 'none';
    } else if (role === 'auditor') {
        if (tabTelemetry) {
            tabTelemetry.style.display = 'inline-flex';
            tabTelemetry.innerHTML = '🚰 Estanque';
        }
        if (tabCommercial) tabCommercial.style.display = 'none';
        if (tabDetail) tabDetail.style.display = 'none';
        if (window.switchRightTab) window.switchRightTab('telemetry');

        // Modo Auditor (DOH / Fiscalización): Monitoreo de estanque y red
        if (execKpiCard) execKpiCard.style.display = 'none';
        if (legalCard) legalCard.style.display = 'none';
        if (scadaGrid) scadaGrid.style.display = 'flex';
        if (scadaSummary) scadaSummary.style.display = 'block';
    }

    // Cancelar simulaciones operativas si se cambia a un rol no operativo
    if (role !== 'terreno') {
        if (AppState.emergencyMode && typeof toggleEmergencyMode === 'function') {
            toggleEmergencyMode();
        }
        if (AppState.activeBurst && typeof clearBurstSimulation === 'function') {
            clearBurstSimulation();
        }
        if (typeof AppState !== 'undefined' && AppState.valvesState) {
            const hasOverriddenValves = Object.keys(AppState.valvesState).some(k => AppState.valvesState[k] === false);
            if (hasOverriddenValves) {
                AppState.valvesState = {};
                if (layers && layers.valvulas && typeof json_Valvulas_GeoConecta !== 'undefined') {
                    layers.valvulas.clearLayers();
                    layers.valvulas.addData(json_Valvulas_GeoConecta);
                }
                if (layers && layers.redes && typeof stylePipes === 'function') {
                    layers.redes.setStyle(stylePipes);
                }
                if (layers && layers.outageLayer) {
                    layers.outageLayer.clearLayers();
                }
            }
        }
        const emCard = document.getElementById('emergency-card');
        if (emCard) emCard.style.display = 'none';
        const outageHud = document.getElementById('valve-outage-hud');
        if (outageHud) outageHud.remove();
    }

    // 2. Modo Auditor (DOH / Ley 20.998) -> Garantiza capa oficial activa
    if (role === 'auditor') {
        if (layers && layers.concesion && !map.hasLayer(layers.concesion)) {
            map.addLayer(layers.concesion);
            const chk = document.getElementById('chk-concesion');
            if (chk) chk.checked = true;
        }
    }

    // Actualizar la botonera inferior móvil según el perfil activo
    
    const desktopManeuversBtn = document.getElementById('btn-desktop-maneuvers');
    if (desktopManeuversBtn) {
        desktopManeuversBtn.style.display = (role === 'terreno') ? 'inline-flex' : 'none';
    }

    updateThumbBarRole(role);
}
window.onRoleSelectChange = setAppRole;

// ------------------------------------------------------------------------------
// ICONOGRAFÍA VECTORIAL SOBRIA Y PROFESIONAL PARA BARRA TÁCTIL MÓVIL (THUMB ZONE)
// ------------------------------------------------------------------------------
const THUMB_SVGS = {
    search: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    measure: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"></rect><line x1="6" y1="7" x2="6" y2="12"></line><line x1="10" y1="7" x2="10" y2="10"></line><line x1="14" y1="7" x2="14" y2="12"></line><line x1="18" y1="7" x2="18" y2="10"></line></svg>`,
    // Botón 3: Panel adaptativo según perfil (Términos comprensibles en SSR)
    ficha: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    cobranza: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="6" y1="15" x2="10" y2="15"></line><line x1="14" y1="15" x2="18" y2="15"></line></svg>`,
    gestion: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    estanque: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="9" rx="2"></rect><line x1="4" y1="7.5" x2="20" y2="7.5"></line><line x1="6" y1="12" x2="4" y2="21"></line><line x1="18" y1="12" x2="20" y2="21"></line><line x1="12" y1="12" x2="12" y2="21"></line><line x1="5" y1="17" x2="19" y2="17"></line></svg>`,
    // Botón 4: Acción operativa según perfil
    maneuvers: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    semaphore: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="5"></rect><circle cx="12" cy="6.5" r="1.5" fill="currentColor"></circle><circle cx="12" cy="12" r="1.5" fill="currentColor"></circle><circle cx="12" cy="17.5" r="1.5" fill="currentColor"></circle></svg>`,
    minuta: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    concesion: `<svg class="thumb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"></polygon><circle cx="12" cy="12" r="2.5" fill="currentColor"></circle></svg>`
};

function updateThumbBarRole(role) {
    const btnHero = document.getElementById('thumb-btn-hero');
    const iconHero = document.getElementById('thumb-hero-icon');
    const labelHero = document.getElementById('thumb-hero-label');

    const btnSub = document.getElementById('thumb-btn-subaction');
    const iconSub = document.getElementById('thumb-subaction-icon');
    const labelSub = document.getElementById('thumb-subaction-label');

    const beaconCopilotDesc = document.getElementById('beacon-copilot-role-text');
    const copilotStatus = document.getElementById('copilot-status-indicator');

    if (btnHero && iconHero && labelHero) {
        btnHero.classList.remove('hero-terreno', 'hero-admin', 'hero-directorio', 'hero-auditor');

        // 1. Jerarquía Principal según rol en el Centro Elevado
        if (role === 'terreno') {
            btnHero.classList.add('hero-terreno');
            iconHero.innerHTML = THUMB_SVGS.maneuvers;
            labelHero.textContent = 'Maniobras';
            btnHero.title = 'Centro de Maniobras de Red (Roturas y Válvulas)';

            if (btnSub && iconSub && labelSub) {
                iconSub.innerHTML = THUMB_SVGS.estanque;
                labelSub.textContent = 'Estanque';
                btnSub.title = 'Nivel del Estanque de Regulación y Reserva';
            }
            if (beaconCopilotDesc) beaconCopilotDesc.textContent = 'Asistencia Terreno';
            if (copilotStatus) copilotStatus.textContent = 'Terreno';
        } else if (role === 'administracion') {
            btnHero.classList.add('hero-admin');
            iconHero.innerHTML = THUMB_SVGS.cobranza;
            labelHero.textContent = 'Cobranza';
            btnHero.title = 'Panel Comercial y Gestión de Cobranza';

            if (btnSub && iconSub && labelSub) {
                iconSub.innerHTML = THUMB_SVGS.semaphore;
                labelSub.textContent = 'Semáforo';
                btnSub.title = 'Activar / Desactivar Semáforo de Cobranza en Mapa';
            }
            if (beaconCopilotDesc) beaconCopilotDesc.textContent = 'Asistencia Cobranza';
            if (copilotStatus) copilotStatus.textContent = 'Cobranza';
        } else if (role === 'directorio') {
            btnHero.classList.add('hero-directorio');
            iconHero.innerHTML = THUMB_SVGS.gestion;
            labelHero.textContent = 'Gestión';
            btnHero.title = 'Panel Ejecutivo de Gestión, Continuidad y Pérdidas';

            if (btnSub && iconSub && labelSub) {
                iconSub.innerHTML = THUMB_SVGS.minuta;
                labelSub.textContent = 'Minuta';
                btnSub.title = 'Descargar Minuta Oficial de Asamblea';
            }
            if (beaconCopilotDesc) beaconCopilotDesc.textContent = 'Asistencia Ejecutiva';
            if (copilotStatus) copilotStatus.textContent = 'Directorio';
        } else if (role === 'auditor') {
            btnHero.classList.add('hero-auditor');
            iconHero.innerHTML = THUMB_SVGS.estanque;
            labelHero.textContent = 'Estanque';
            btnHero.title = 'Monitoreo de Estanque, Reserva y Cumplimiento Normativo';

            if (btnSub && iconSub && labelSub) {
                iconSub.innerHTML = THUMB_SVGS.concesion;
                labelSub.textContent = 'Concesión';
                btnSub.title = 'Enfocar Área de Servicio Oficial (Ley 20.998)';
            }
            if (beaconCopilotDesc) beaconCopilotDesc.textContent = 'Asistencia Normativa';
            if (copilotStatus) copilotStatus.textContent = 'Fiscalización';
        }
    }
}

// ------------------------------------------------------------------------------
// HERRAMIENTAS MÓVILES NO DUPLICADAS (BÚSQUEDA RÁPIDA Y MEDICIÓN DE DISTANCIAS)
// ------------------------------------------------------------------------------
window.toggleMobileSearch = function() {
    const searchContainer = document.getElementById('search-container');
    const input = document.getElementById('search-input');
    if (searchContainer && input) {
        searchContainer.classList.toggle('mobile-active');
        if (searchContainer.classList.contains('mobile-active')) {
            input.focus();
        }
    }
};

let isMeasuring = false;
let measurePoints = [];
let measureMarkers = [];
let measurePolyline = null;

window.toggleMeasurementTool = function() {
    isMeasuring = !isMeasuring;
    const measureBtn = document.getElementById('thumb-btn-measure');

    if (isMeasuring) {
        if (measureBtn) measureBtn.classList.add('active');
        measurePoints = [];
        measureMarkers = [];
        if (measurePolyline && typeof map !== 'undefined') { map.removeLayer(measurePolyline); measurePolyline = null; }

        if (typeof map !== 'undefined' && map) {
            map.getContainer().style.cursor = 'crosshair';
            map.on('click', handleMeasureClick);
        }

        showMeasurementHud('📏 <strong>Modo Medición:</strong> Toca 2 o más puntos en el mapa para calcular distancias.');
    } else {
        resetMeasurementTool();
    }
};

function handleMeasureClick(e) {
    if (!isMeasuring || !e || !e.latlng) return;
    const latlng = e.latlng;
    measurePoints.push(latlng);

    const marker = L.circleMarker(latlng, {
        radius: 5,
        fillColor: '#38bdf8',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
    }).addTo(map);
    measureMarkers.push(marker);

    if (measurePoints.length > 1) {
        if (measurePolyline) map.removeLayer(measurePolyline);
        measurePolyline = L.polyline(measurePoints, {
            color: '#38bdf8',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.95
        }).addTo(map);

        let totalMeters = 0;
        for (let i = 0; i < measurePoints.length - 1; i++) {
            totalMeters += measurePoints[i].distanceTo(measurePoints[i + 1]);
        }
        const distText = totalMeters >= 1000 
            ? `${(totalMeters / 1000).toFixed(2)} km` 
            : `${Math.round(totalMeters * 10) / 10} m`;

        showMeasurementHud(`📏 Distancia: <strong>${distText}</strong> (${measurePoints.length} puntos) · <span onclick="resetMeasurementTool()" style="text-decoration:underline; cursor:pointer;">Finalizar</span>`);
    } else {
        showMeasurementHud('📏 Primer punto fijado. Toca el siguiente punto en el mapa para medir.');
    }
}

function showMeasurementHud(html) {
    let hud = document.getElementById('measurement-hud-bar');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'measurement-hud-bar';
        hud.className = 'measurement-hud-bar';
        document.body.appendChild(hud);
    }
    hud.innerHTML = `
        <div class="measure-hud-content">
            <span>${html}</span>
            <button class="measure-hud-close" onclick="resetMeasurementTool()">✕</button>
        </div>
    `;
    hud.style.display = 'block';
}

function resetMeasurementTool() {
    isMeasuring = false;
    const measureBtn = document.getElementById('thumb-btn-measure');
    if (measureBtn) measureBtn.classList.remove('active');

    if (typeof map !== 'undefined' && map) {
        map.getContainer().style.cursor = '';
        map.off('click', handleMeasureClick);
        if (measurePolyline) { map.removeLayer(measurePolyline); measurePolyline = null; }
        if (measureMarkers) {
            measureMarkers.forEach(m => map.removeLayer(m));
            measureMarkers = [];
        }
    }
    measurePoints = [];
    const hud = document.getElementById('measurement-hud-bar');
    if (hud) hud.style.display = 'none';
}
window.resetMeasurementTool = resetMeasurementTool;

// ------------------------------------------------------------------------------
// MANEJADORES DE ACCIÓN TÁCTIL MÓVIL (JERARQUÍA ELEVADA: BOTÓN CENTRAL HERO)
// ------------------------------------------------------------------------------
window.handleThumbHeroClick = function() {
    const role = typeof currentAppRole !== 'undefined' ? currentAppRole : 'terreno';
    if (role === 'terreno') {
        if (window.openManeuversModal) window.openManeuversModal();
    } else if (role === 'administracion') {
        if (window.openRightDrawer) window.openRightDrawer('commercial');
    } else if (role === 'directorio') {
        if (window.openRightDrawer) window.openRightDrawer('telemetry');
    } else if (role === 'auditor') {
        if (window.openRightDrawer) window.openRightDrawer('telemetry');
    }
};

window.handleThumbSubActionClick = function() {
    const role = typeof currentAppRole !== 'undefined' ? currentAppRole : 'terreno';
    if (role === 'terreno') {
        // En Terreno: acción complementaria es supervisar el nivel del Estanque de reserva
        if (window.openRightDrawer) window.openRightDrawer('telemetry');
    } else if (role === 'administracion') {
        // En Administración: acción complementaria es activar/desactivar el Semáforo de morosidad
        const chkSem = document.getElementById('chk-commercial-semaphore');
        if (chkSem) {
            chkSem.checked = !chkSem.checked;
            toggleCommercialSemaphore(chkSem.checked);
        } else {
            toggleCommercialSemaphore(true);
        }
    } else if (role === 'directorio') {
        // En Directorio: acción complementaria es la descarga de la Minuta de asamblea
        if (window.exportAssemblyReport) window.exportAssemblyReport();
    } else if (role === 'auditor') {
        // En Auditoría: acción complementaria es enfocar el polígono oficial de concesión
        if (layers && layers.concesion) {
            if (!map.hasLayer(layers.concesion)) map.addLayer(layers.concesion);
            const boundaryTarget = layers.concesionBoundary || (layers.redes ? layers.redes : null);
            if (boundaryTarget && boundaryTarget.getBounds) {
                map.fitBounds(boundaryTarget.getBounds(), { padding: [40, 40] });
            }
        }
    }
};

window.handleThumbDetailClick = function() {
    if (window.openDetailTab) {
        window.openDetailTab();
    } else if (window.openRightDrawer) {
        window.openRightDrawer('detail');
    }
};

// Compatibilidad con invocaciones previas
window.handleThumbActionClick = window.handleThumbHeroClick;
window.toggleRightDrawer = window.handleThumbHeroClick;

// ------------------------------------------------------------------------------
// B. GEOGESTIÓN COMERCIAL Y BALANCE DE PÉRDIDAS (ANF)
// ------------------------------------------------------------------------------
let commercialDataLoaded = false;
let commercialSemaphoreActive = false;
const COMMERCIAL_DB = {};

function initCommercialEngine() {
    if (typeof json_Arranques_GeoConecta !== 'undefined') {
        json_Arranques_GeoConecta.features.forEach((f, idx) => {
            const p = f.properties;
            const id = p.id_arranque;
            let status = 'Al Día';
            let debtMonths = 0;
            let debtAmount = 0;
            let lastPayment = '2026-10-14';

            if (p.estado_comercial && p.estado_comercial.includes('Moroso')) {
                if (idx % 3 === 0) {
                    status = 'Suspendido / Corte';
                    debtMonths = 3;
                    debtAmount = 45200;
                    lastPayment = '2026-07-12';
                } else if (idx % 2 === 0) {
                    status = 'Aviso Previo (2 meses)';
                    debtMonths = 2;
                    debtAmount = 28900;
                    lastPayment = '2026-08-18';
                } else {
                    status = 'Aviso 1 Mes';
                    debtMonths = 1;
                    debtAmount = 14200;
                    lastPayment = '2026-09-15';
                }
            } else {
                status = 'Al Día';
                debtMonths = 0;
                debtAmount = 0;
                lastPayment = '2026-10-10';
            }

            COMMERCIAL_DB[id] = {
                id_arranque: id,
                socio: p.socio,
                rut: p.rut,
                medidor: p.n_medidor,
                status: status,
                debtMonths: debtMonths,
                debtAmount: debtAmount,
                lastPayment: lastPayment,
                currentBill: 12500 + (idx % 7) * 950,
                coords: f.geometry.coordinates
            };
        });
        commercialDataLoaded = true;
    }
}

function toggleCommercialSemaphore(active) {
    commercialSemaphoreActive = active;
    if (!layers.arranques) return;
    const currentZoom = (typeof map !== 'undefined' && map) ? map.getZoom() : 15;
    const r = getArranqueRadiusForZoom(currentZoom);
    const w = getArranqueWeightForZoom(currentZoom);

    layers.arranques.eachLayer(layer => {
        if (!layer.feature || !layer.feature.properties) return;
        const p = layer.feature.properties;

        if (active) {
            // MODO ANÁLISIS COMERCIAL ACTIVO (Semáforo Encendido)
            const comm = (typeof COMMERCIAL_DB !== 'undefined') ? COMMERCIAL_DB[p.id_arranque] : null;
            let fillColor = '#10b981'; // Al Día
            let extraR = 0;

            if (comm) {
                if (comm.debtMonths === 1 || comm.debtMonths === 2) {
                    fillColor = '#f59e0b'; // Aviso
                } else if (comm.debtMonths >= 3) {
                    fillColor = '#ef4444'; // Corte
                    extraR = 1.5;
                }
            } else {
                const estado = p.estado_comercial || 'Al Día';
                if (estado.includes('Moroso')) fillColor = '#f59e0b';
                else if (estado.includes('Suspendido') || estado.includes('Corte')) {
                    fillColor = '#ef4444';
                    extraR = 1.5;
                }
            }

            layer.setStyle({
                fillColor: fillColor,
                color: '#ffffff',
                weight: w + 0.5,
                fillOpacity: 0.95
            });
            if (layer.setRadius) layer.setRadius(r + extraR);
        } else {
            // MODO TÉCNICO NORMAL (Semáforo Apagado: Anillo blanco/azul neutro)
            layer.setStyle({
                fillColor: '#ffffff',
                color: '#0284c7',
                weight: w,
                fillOpacity: 0.95
            });
            if (layer.setRadius) layer.setRadius(r);
        }
    });
}
window.toggleCommercialSemaphore = toggleCommercialSemaphore;

function loadDemoCommercialData() {
    initCommercialEngine();
    toggleCommercialSemaphore(true);
    const chk = document.getElementById('chk-commercial-semaphore');
    if (chk) chk.checked = true;
    alert('✔ Datos de cobranza actualizados para los 292 socios. Semáforo comercial activado en el mapa.');
}
window.loadDemoCommercialData = loadDemoCommercialData;

function exportMorososListCSV() {
    let csv = '\uFEFF"ID_Arranque","Socio","RUT","Num_Medidor","Meses_Deuda","Monto_Adeudado_CLP","Ultimo_Pago","Estado_Cobranza"\n';
    let count = 0;
    Object.values(COMMERCIAL_DB).forEach(c => {
        if (c.debtMonths > 0) {
            csv += `"${c.id_arranque}","${c.socio}","${c.rut}","${c.medidor}",${c.debtMonths},${c.debtAmount},"${c.lastPayment}","${c.status}"\n`;
            count++;
        }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nomina_Morosos_SSR_San_Ignacio_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
window.exportMorososListCSV = exportMorososListCSV;

function handleCommercialFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        alert(`✔ Planilla "${file.name}" leída exitosamente. Se sincronizaron 292 registros de cobranza.`);
        toggleCommercialSemaphore(true);
        const chk = document.getElementById('chk-commercial-semaphore');
        if (chk) chk.checked = true;
    };
    reader.readAsText(file);
}
window.handleCommercialFileSelect = handleCommercialFileSelect;

// ------------------------------------------------------------------------------
// C. COPILOTO INTELIGENTE SSR (IA GENERATIVA OPERATIVA - ASISTENTE FLOTANTE DEDICADO)
// ------------------------------------------------------------------------------
function initCopilotEngine() {
    // Escuchar Escape para cerrar el asistente flotante
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const sheet = document.getElementById('copilot-assistant-sheet');
            if (sheet && sheet.style.display !== 'none') {
                closeCopilotAssistant();
            }
        }
    });
}
window.initCopilotEngine = initCopilotEngine;

function openCopilotAssistant() {
    const sheet = document.getElementById('copilot-assistant-sheet');
    const backdrop = document.getElementById('copilot-sheet-backdrop');
    const beacon = document.getElementById('copilot-floating-beacon');
    if (!sheet) return;

    sheet.style.display = 'flex';
    if (backdrop && window.innerWidth <= 768) {
        backdrop.style.display = 'block';
    }
    if (beacon) beacon.classList.add('active');

    // Desplazar chat al último mensaje
    const container = document.getElementById('copilot-chat-messages');
    if (container) {
        setTimeout(() => { container.scrollTop = container.scrollHeight; }, 60);
    }

    // Foco en input en pantallas no móviles
    setTimeout(() => {
        const input = document.getElementById('copilot-input-text');
        if (input && window.innerWidth > 768) input.focus();
    }, 150);
}
window.openCopilotAssistant = openCopilotAssistant;

function closeCopilotAssistant() {
    const sheet = document.getElementById('copilot-assistant-sheet');
    const backdrop = document.getElementById('copilot-sheet-backdrop');
    const beacon = document.getElementById('copilot-floating-beacon');

    if (sheet) sheet.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    if (beacon) beacon.classList.remove('active');
}
window.closeCopilotAssistant = closeCopilotAssistant;

function toggleCopilotAssistant() {
    const sheet = document.getElementById('copilot-assistant-sheet');
    if (sheet && sheet.style.display !== 'none' && sheet.style.display !== '') {
        closeCopilotAssistant();
    } else {
        openCopilotAssistant();
    }
}
window.toggleCopilotAssistant = toggleCopilotAssistant;

const COPILOT_KNOWLEDGE = [
    {
        keywords: ['hijuelas', 'callejon hijuelas', 'valv-16', 'valvula 16'],
        response: 'Para una rotura en el <strong>Callejón Hijuelas</strong>, debes cerrar la válvula <strong>VALV-16</strong> (diámetro 63 mm). Esto aislará de forma quirúrgica a <strong>25 viviendas</strong> (ARR-N9-063 a ARR-N9-122) y 0.35 km de red sin cortar la matriz troncal de Santa Juana Nº9. Tiempo estimado de purga tras la reparación: 15 minutos.'
    },
    {
        keywords: ['presion', 'presiones', 'n9', 'santa juana n9', 'cota'],
        response: 'En el sector <strong>Santa Juana Nº9</strong>, las cotas varían entre 285 y 310 m.s.n.m. Con el estanque de regulación a cota 340 m, las presiones dinámicas de grifo se encuentran entre <strong>20.5 y 34.8 m.c.a.</strong>, cumpliendo holgadamente la norma chilena NCh 691 (mínimo exigido 14.0 m.c.a.).'
    },
    {
        keywords: ['comunicado', 'whatsapp', 'redactar aviso', 'aviso de corte', 'comunidad', 'notificar'],
        response: 'He preparado el generador de comunicados para vecinos.<br><br><button class="btn-copilot-action" onclick="openWhatsAppBroadcastModal()">💬 Abrir Generador WhatsApp</button>'
    },
    {
        keywords: ['anf', 'perdida', 'perdidas', 'agua no facturada', 'fuga'],
        response: 'El balance actual registra un <strong>27.4% de Agua No Facturada</strong> (142.8 m³/día producidos en estanque vs. 103.6 m³/día medidos en nichos). Esto representa <strong>39.2 m³/día de pérdida</strong>. Se recomienda revisar el ramal poniente (TUB-12 / TUB-14) con geófono por sospecha de rotura no aflorante.'
    },
    {
        keywords: ['morosos', 'deuda', 'corte por deuda', 'suspension'],
        response: 'Actualmente hay <strong>38 socios morosos</strong>: 26 con aviso de 1 mes ($14.200 prom.), 6 con aviso previo de 2 meses, y <strong>6 socios en causal formal de corte</strong> (>3 meses). Puedes activar el <strong>Semáforo Comercial</strong> en la pestaña "Cobranza" para ver sus casas resaltadas en rojo.'
    }
];

function sendCopilotQuery(customText) {
    const input = document.getElementById('copilot-input-text');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;
    if (input) input.value = '';

    appendCopilotMessage('user', text);

    setTimeout(() => {
        let answer = 'Entendido. Consultando el Gemelo Digital de Santa Juana y El Calvario... ';
        const lower = text.toLowerCase();
        let matched = false;

        for (const k of COPILOT_KNOWLEDGE) {
            if (k.keywords.some(w => lower.includes(w))) {
                answer = k.response;
                matched = true;
                break;
            }
        }

        if (!matched) {
            answer = `He analizado tu consulta sobre "<em>${text}</em>" con la topología de la red. Actualmente el sistema opera con <strong>57 tramos</strong>, <strong>20 válvulas de corte</strong> y <strong>292 socios</strong>. Si necesitas asistencia en una emergencia, puedes cerrar cualquier válvula en el mapa para simular la maniobra o preguntarme por un sector específico (ej: Hijuelas, Calvario, Estanque).`;
        }

        appendCopilotMessage('bot', answer);
    }, 450);
}
window.sendCopilotQuery = sendCopilotQuery;

function sendQuickCopilotQuery(text) {
    sendCopilotQuery(text);
}
window.sendQuickCopilotQuery = sendQuickCopilotQuery;

function appendCopilotMessage(sender, htmlText) {
    const container = document.getElementById('copilot-chat-messages');
    if (!container) return;

    // Ocultar bienvenida inicial al comenzar la conversación para no saturar la pantalla
    const welcome = document.getElementById('copilot-welcome-box');
    if (welcome) welcome.style.display = 'none';

    const div = document.createElement('div');
    div.className = `copilot-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    div.innerHTML = `<div class="msg-bubble">${htmlText}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function clearCopilotChat() {
    const container = document.getElementById('copilot-chat-messages');
    if (container) {
        container.innerHTML = `
            <div id="copilot-welcome-box" class="copilot-welcome-box">
                <div class="welcome-sparkle">✦</div>
                <h4 class="welcome-title">¿En qué puedo ayudarte?</h4>
                <p class="welcome-sub">Consulta maniobras, fugas, presiones o cobranza de la red.</p>
            </div>
        `;
    }
}
window.clearCopilotChat = clearCopilotChat;

function toggleCopilotVoiceSim() {
    const input = document.getElementById('copilot-input-text');
    if (input) {
        input.value = '¿Qué válvula debo cerrar si hay fuga en Callejón Hijuelas?';
        sendCopilotQuery();
    }
}
window.toggleCopilotVoiceSim = toggleCopilotVoiceSim;

// ------------------------------------------------------------------------------
// D. COMUNICADOS OFICIALES WHATSAPP (ASISTENCIA IA)
// ------------------------------------------------------------------------------
let currentOutageValveForWhatsApp = null;

function openWhatsAppBroadcastModal(valveId) {
    if (!valveId) {
        if (AppState.activeBurst && AppState.activeBurst.isolationValves && AppState.activeBurst.isolationValves.length > 0) {
            valveId = AppState.activeBurst.isolationValves[0].split('(')[0].trim();
        } else if (AppState.valvesState) {
            valveId = Object.keys(AppState.valvesState).find(k => AppState.valvesState[k] === false) || 'VALV-16';
        } else {
            valveId = 'VALV-16';
        }
    }
    currentOutageValveForWhatsApp = valveId;
    const modal = document.getElementById('whatsapp-broadcast-modal');
    if (!modal) return;

    const textarea = document.getElementById('whatsapp-message-text');
    const sim = typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined' ? VALVE_OUTAGE_SIMULATION_DB[valveId] : null;

    const sectorName = sim ? sim.sector : 'Sector Santa Juana Nº9 - El Calvario';
    const affectedCount = sim ? sim.affectedCount : 25;
    const recoveryTime = sim ? (sim.recovery_time || '15 a 30 minutos') : '20 minutos';

    const msg = `💧 *COMUNICADO OFICIAL • SSR SANTA JUANA - EL CALVARIO* 💧\n\n` +
                `Estimados vecinos y socias de *${sectorName}*:\n\n` +
                `Informamos que debido a maniobras de reparación de emergencia en la red matriz (Válvula *${valveId}*), el suministro de agua potable se encuentra temporalmente suspendido.\n\n` +
                `• *Sector Afectado:* ${sectorName}\n` +
                `• *Viviendas en Aislamiento:* ${affectedCount} arranques domiciliarios\n` +
                `• *Tiempo Estimado de Reposición:* ${recoveryTime}\n\n` +
                `Les rogamos hacer un uso moderado del agua almacenada. El equipo técnico ya se encuentra en terreno trabajando para normalizar el servicio a la brevedad.\n\n` +
                `_Directiva y Operación Técnica SSR_`;

    if (textarea) textarea.value = msg;
    modal.style.display = 'flex';
}
window.openWhatsAppBroadcastModal = openWhatsAppBroadcastModal;

function closeWhatsAppModal() {
    const modal = document.getElementById('whatsapp-broadcast-modal');
    if (modal) modal.style.display = 'none';
}
window.closeWhatsAppModal = closeWhatsAppModal;

function adjustWhatsAppTone(tone) {
    const textarea = document.getElementById('whatsapp-message-text');
    if (!textarea) return;
    if (!currentOutageValveForWhatsApp) {
        if (AppState.activeBurst && AppState.activeBurst.isolationValves && AppState.activeBurst.isolationValves.length > 0) {
            currentOutageValveForWhatsApp = AppState.activeBurst.isolationValves[0].split('(')[0].trim();
        } else {
            currentOutageValveForWhatsApp = 'VALV-16';
        }
    }

    const sim = typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined' ? VALVE_OUTAGE_SIMULATION_DB[currentOutageValveForWhatsApp] : null;
    const sector = sim ? sim.sector : 'Sector Santa Juana Nº9';
    const count = sim ? sim.affectedCount : 25;

    if (tone === 'breve') {
        textarea.value = `⚠️ *CORTE DE AGUA PREVENTIVO • SSR SANTA JUANA*\nSector: ${sector} (${count} viviendas).\nMotivo: Reparación válvula ${currentOutageValveForWhatsApp}.\nReposición estimada: 20-30 min.\nDisculpen las molestias.`;
    } else if (tone === 'urgencia') {
        textarea.value = `🚨 *ALERTA ROTURA MATRIZ • CORTE INMEDIATO*\nVecinos de ${sector}: Se debió cortar de urgencia el suministro por rotura en válvula ${currentOutageValveForWhatsApp}. Personal técnico ya está reparando. Agradecemos su comprensión.`;
    } else {
        openWhatsAppBroadcastModal(currentOutageValveForWhatsApp);
    }
}
window.adjustWhatsAppTone = adjustWhatsAppTone;

function copyWhatsAppToClipboard() {
    const textarea = document.getElementById('whatsapp-message-text');
    const feedback = document.getElementById('wsp-copy-feedback');
    if (!textarea) return;

    navigator.clipboard.writeText(textarea.value).then(() => {
        if (feedback) {
            feedback.style.display = 'block';
            setTimeout(() => { feedback.style.display = 'none'; }, 3500);
        }
    });
}
window.copyWhatsAppToClipboard = copyWhatsAppToClipboard;

// ------------------------------------------------------------------------------
// E. GEOLOCALIZACIÓN GPS (MODO OPERADOR TERRENO)
// ------------------------------------------------------------------------------
let gpsMarker = null;

function locateUserGPS() {
    const gpsBtn = document.querySelector('.leaflet-control-gps-btn');
    const thumbGps = document.querySelector('.thumb-btn-gps');
    if (gpsBtn) gpsBtn.classList.add('locating');
    if (thumbGps) thumbGps.classList.add('locating');

    if (!navigator.geolocation) {
        if (gpsBtn) gpsBtn.classList.remove('locating');
        if (thumbGps) thumbGps.classList.remove('locating');
        alert('La geolocalización no está soportada en este navegador.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            if (gpsBtn) gpsBtn.classList.remove('locating');
            if (thumbGps) thumbGps.classList.remove('locating');
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            if (gpsMarker) {
                map.removeLayer(gpsMarker);
            }

            gpsMarker = L.circleMarker([lat, lng], {
                radius: 9,
                fillColor: '#00d2ff',
                color: '#ffffff',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.9,
                className: 'hud-pulse-beacon'
            }).addTo(map);

            gpsMarker.bindPopup('<strong>📍 Tu Ubicación Actual en Terreno</strong>').openPopup();
            map.flyTo([lat, lng], 17, { duration: 1.0 });
        },
        (err) => {
            if (gpsBtn) gpsBtn.classList.remove('locating');
            if (thumbGps) thumbGps.classList.remove('locating');
            map.flyTo([-36.8480, -71.9380], 15, { duration: 1.0 });
            alert('Modo Terreno: Centrado en la red central de Santa Juana - El Calvario.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
    );
}
window.locateUserGPS = locateUserGPS;

// ------------------------------------------------------------------------------
// F. MINUTA EJECUTIVA PARA ASAMBLEA (DIRECTORIO / COMITÉ)
// ------------------------------------------------------------------------------
function exportAssemblyReport() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CL');
    
    let report = `========================================================================\n` +
                 `   MINUTA EJECUTIVA PARA ASAMBLEA GENERAL DE SOCIOS • SSR SAN IGNACIO\n` +
                 `   Sistemas: Santa Juana Nº9 y El Calvario | Fecha: ${dateStr}\n` +
                 `========================================================================\n\n` +
                 `1. INFRAESTRUCTURA Y COBERTURA:\n` +
                 `   • Socios y Medidores Catastrados: 292 familias con ficha técnica completa.\n` +
                 `   • Longitud Total de Redes Matrices: 18.6 kilómetros (57 tramos modelados).\n` +
                 `   • Válvulas de Sectorización Operativas: 20 unidades.\n` +
                 `   • Fuentes: Pozo Profundo e Impulsión + Estanque de Regulación 50 m³.\n\n` +
                 `2. GESTIÓN COMERCIAL Y RECAUDACIÓN DEL MES:\n` +
                 `   • Tasa de Cumplimiento Comercial: 84.9% al día.\n` +
                 `   • Total Recaudado a la fecha: $3.480.000 / $4.098.000 facturados.\n` +
                 `   • Socios con aviso preventivo (1 mes): 26 socios.\n` +
                 `   • Socios notificados (2 meses): 6 socios.\n` +
                 `   • Casos con orden de suspensión de servicio: 6 socios.\n\n` +
                 `3. BALANCE DE AGUA Y PÉRDIDAS (ANF):\n` +
                 `   • Producción Promedio Medida en Estanque: 142.8 m³/día.\n` +
                 `   • Consumo Facturado en Nichos de Socios: 103.6 m³/día.\n` +
                 `   • Pérdida Estimada (Agua No Facturada): 39.2 m³/día (27.4%).\n` +
                 `   • Diagnóstico: Se requiere plan de búsqueda de fugas en sector poniente.\n\n` +
                 `4. CUMPLIMIENTO LEY 20.998 Y REGULACIÓN DOH:\n` +
                 `   • Continuidad de Servicio Promedio: 99.4% (Cumple estándar NCh 691).\n` +
                 `   • Presión mínima de servicio garantizada en cota crítica: 18.4 m.c.a.\n\n` +
                 `Firma Directorio SSR: ___________________________\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Minuta_Asamblea_SSR_San_Ignacio_${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
window.exportAssemblyReport = exportAssemblyReport;


window.toggleRightDrawer = function() {
    const drawer = document.getElementById('drawer-right');
    if (!drawer) return;

    // Si hay una maniobra activa en móvil, alternar entre modo asomado y expandido
    if (drawer.classList.contains('maneuver-active') && window.innerWidth < 768) {
        if (typeof toggleManeuverSheetPeek === 'function') {
            toggleManeuverSheetPeek();
            return;
        }
    }

    if (drawer.classList.contains('open')) {
        if (window.closeRightDrawer) {
            window.closeRightDrawer();
        } else {
            drawer.classList.remove('open');
            const dockBtn = document.getElementById('btn-panel-dock');
            if (dockBtn) dockBtn.style.display = 'flex';
        }
    } else {
        drawer.classList.add('open');
        const dockBtn = document.getElementById('btn-panel-dock');
        if (dockBtn) dockBtn.style.display = 'none';
        if (typeof currentAppRole !== 'undefined') {
            if (currentAppRole === 'terreno') {
                if (window.openDetailTab) window.openDetailTab();
            } else if (currentAppRole === 'administracion') {
                if (window.openRightDrawer) window.openRightDrawer('commercial');
            } else if (currentAppRole === 'directorio' || currentAppRole === 'auditor') {
                if (window.openRightDrawer) window.openRightDrawer('telemetry');
            }
        }
    }
};