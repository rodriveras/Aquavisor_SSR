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

    // Pane dedicado para Arranques y Medidores (siempre prioritario al tacto sobre tuberías y polígonos)
    map.createPane('concesionPane');
    map.getPane('concesionPane').style.zIndex = '420';

    map.createPane('arranquesPane');
    map.getPane('arranquesPane').style.zIndex = '620';

    // Pane dedicado para Simulación de Corte (destaque moderado y prioritario de viviendas afectadas)
    map.createPane('outagePane');
    map.getPane('outagePane').style.zIndex = '650';

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
    const tabBtnCopilot = document.getElementById('tab-btn-copilot');
    const tabBtnDetail = document.getElementById('tab-btn-detail');
    const tabContentTelemetry = document.getElementById('tab-content-telemetry');
    const tabContentCommercial = document.getElementById('tab-content-commercial');
    const tabContentCopilot = document.getElementById('tab-content-copilot');
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
        if (window.innerWidth < 1024 && drawerRight && drawerRight.classList.contains('open')) {
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
        if (btnToggleTelemetry) btnToggleTelemetry.classList.add('active');
        switchRightTab(tabName);
        syncBackdrop();
    }

    function closeRightDrawer() {
        drawerRight.classList.remove('open');
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
        const allBtns = [tabBtnTelemetry, tabBtnCommercial, tabBtnCopilot, tabBtnDetail];
        const allContents = [tabContentTelemetry, tabContentCommercial, tabContentCopilot, tabContentDetail];

        allBtns.forEach(btn => { if (btn) btn.classList.remove('active'); });
        allContents.forEach(cnt => { if (cnt) cnt.style.display = 'none'; });

        if (tabName === 'telemetry') {
            if (tabBtnTelemetry) tabBtnTelemetry.classList.add('active');
            if (tabContentTelemetry) tabContentTelemetry.style.display = 'block';
        } else if (tabName === 'commercial') {
            if (tabBtnCommercial) tabBtnCommercial.classList.add('active');
            if (tabContentCommercial) tabContentCommercial.style.display = 'block';
        } else if (tabName === 'copilot') {
            if (tabBtnCopilot) tabBtnCopilot.classList.add('active');
            if (tabContentCopilot) tabContentCopilot.style.display = 'flex';
        } else {
            if (tabBtnDetail) tabBtnDetail.classList.add('active');
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
    if (tabBtnCopilot) tabBtnCopilot.addEventListener('click', () => switchRightTab('copilot'));
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

        // 2. Capa Interior de Precisión Catastral (Trazo nítido de deslinde con patrón oficial)
        const boundaryLayer = L.geoJSON(json_Area_Servicio_4, {
            pane: 'concesionPane',
            style: {
                color: '#ea580c',
                weight: 2.4,
                opacity: 1.0,
                dashArray: '10, 4, 2, 4',
                fillColor: 'transparent',
                fillOpacity: 0.0
            },
            onEachFeature: function(feature, layer) {
                const p = feature.properties;

                // Microinteracción Hover
                layer.on('mouseover', function() {
                    this.setStyle({
                        weight: 3.4,
                        color: '#f97316'
                    });
                    haloLayer.setStyle({
                        opacity: 0.75,
                        weight: 11
                    });
                });

                layer.on('mouseout', function() {
                    this.setStyle({
                        weight: 2.4,
                        color: '#ea580c'
                    });
                    haloLayer.setStyle({
                        opacity: 0.40,
                        weight: 8
                    });
                });

                layer.bindPopup(`
                    <div class="popup-consumer">
                        <div class="popup-header-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px; gap:6px;">
                            <span style="font-size:10px; font-weight:800; color:#f59e0b; letter-spacing:0.4px;">🏝️ ISLA OPERACIONAL DOH</span>
                            <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid #f59e0b; white-space:nowrap;">
                                ● Ley Nº 20.998
                            </span>
                        </div>
                        <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:4px; line-height:1.2;">
                            ${p.nombre || 'Área de Servicio Santa Juana Nº9'}
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:rgba(255,255,255,0.06); padding:6px 8px; border-radius:8px; margin-bottom:8px;">
                            <div>
                                <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Superficie</div>
                                <div style="font-size:12.5px; font-weight:800; color:#f59e0b;">
                                    345 ha
                                </div>
                            </div>
                            <div>
                                <div style="font-size:8.5px; color:#94a3b8; text-transform:uppercase; font-weight:600;">Comuna</div>
                                <div style="font-size:12.5px; font-weight:800; color:#ffffff;">
                                    ${p.comuna || 'San Ignacio'}
                                </div>
                            </div>
                        </div>
                        <div style="font-size:10px; color:#94a3b8; line-height:1.35;">
                            Territorio oficial de concesión sanitaria rural. Imagen satelital en alta fidelidad y foco operativo.
                        </div>
                    </div>
                `, { className: 'aquavisor-popup', maxWidth: 280 });
            }
        });

        // Agrupación unificada: Máscara Spotlight + Halo + Límite de Precisión
        layers.concesion = L.featureGroup([spotlightMaskLayer, haloLayer, boundaryLayer]).addTo(map);
    }

    // B. Localidad Censal Santa Juana
    if (typeof json_Santa_Juanacartografia_censo2024_pais__localidades_cpv24_3 !== 'undefined') {
        layers.censo = L.geoJSON(json_Santa_Juanacartografia_censo2024_pais__localidades_cpv24_3, {
            style: {
                color: '#8b5cf6',
                weight: 1.5,
                fillColor: '#8b5cf6',
                fillOpacity: 0.03
            }
        });
    }

    // C. Redes de Tuberías
    if (typeof json_Redes_Enriquecidas !== 'undefined') {
        layers.redes = L.geoJSON(json_Redes_Enriquecidas, {
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
                weight: 5.5,
                opacity: 0.95,
                dashArray: '6, 6',
                lineCap: 'round',
                lineJoin: 'round'
            };
        }
    }

    // 1. Línea de Impulsión Pozo - Estanque
    if (p.id_tramo === 'TUB-11' || sector.includes('Impulsión')) {
        return {
            color: '#4f46e5', // Azul Índigo / Impulsión
            weight: 4.5,
            opacity: 0.95,
            dashArray: '8, 4'
        };
    }

    // 2. Matriz Troncal Principal (110 mm y 90 mm)
    if (diam.includes('110') || diam.includes('90')) {
        return {
            color: '#1d4ed8', // Azul Rey Intenso para Matriz Troncal
            weight: 5.5,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round'
        };
    }

    // 3. Redes Ramales Secundarias (75 mm y 63 mm - Pasajes y Centro Cívico)
    return {
        color: '#00e5ff', // Cian Neón / Turquesa Eléctrico para Redes Ramales
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
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

    // Ficha resumida interactiva sobre el mapa (mismo principio que arranques para móviles y escritorio)
    const popupHtml = `
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
        </div>
    `;

    layer.bindPopup(popupHtml, {
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
            triggerBurstSimulation(feature, layer);
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
    const color = isTank ? (isProyectado ? '#f59e0b' : '#0284c7') : '#00d2ff';

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background: ${color};
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            border: 2px solid #fff;
            box-shadow: 0 0 14px ${color};
        ">${isTank ? '🚰' : '⚡'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker(latlng, { icon: customIcon });

    marker.bindPopup(`
        <div class="popup-consumer">
            <div style="font-size:10px; font-weight:800; color:${color}; margin-bottom:4px; text-transform:uppercase;">
                ${isTank ? '🚰 Estanque de Regulación' : '⚡ Captación / Pozo'}
            </div>
            <div style="font-size:13px; font-weight:800; color:#ffffff; margin-bottom:4px; line-height:1.2;">
                ${p.name || 'Infraestructura'}
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">
                Sistema: <strong style="color:#f1f5f9;">${p.sistema || 'SSR San Ignacio'}</strong>
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:6px;">
                Capacidad: <strong style="color:#00d2ff;">${p.capacidad || '-'}</strong>
            </div>
            <div style="font-size:10.5px; font-weight:600; color:${isProyectado ? '#f59e0b' : '#10b981'}; margin-bottom:8px;">
                ● ${p.estado || 'Operativo / En Servicio'}
            </div>
            <button class="btn-popup-view-detail" onclick="showSourceDetailsFromPopup('${p.fid || ''}')" style="
                width: 100%;
                padding: 6px 10px;
                background: linear-gradient(135deg, #0284c7, #00d2ff);
                border: none;
                border-radius: 6px;
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
            ">
                📋 Ver Ficha Técnica
            </button>
        </div>
    `, { className: 'aquavisor-popup', maxWidth: 280 });

    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        marker.openPopup();
        showSourceDetails(feature.properties, isTank);
    });
    return marker;
}


// Funciones de Dimensionamiento Dinámico Multi-Escala (Opción 1)
function getArranqueRadiusForZoom(zoom) {
    if (zoom <= 14) return 2.6; // Escala Macro: micro-punto constelación (no tapa tuberías)
    if (zoom <= 16) return 4.6; // Escala Sector: anillo bien proporcionado
    return 6.8;                 // Escala Detalle / Terreno (>=17): amplio, táctil y legible
}

function getArranqueWeightForZoom(zoom) {
    if (zoom <= 14) return 1.0;
    if (zoom <= 16) return 1.5;
    return 2.0;
}

function createValveMarker(feature, latlng) {
    const vId = feature.properties.id;
    const isOpen = AppState.valvesState[vId] !== false;

    const icon = L.divIcon({
        className: 'custom-valve-icon',
        html: `<div class="valve-diamond ${isOpen ? 'valve-open' : 'valve-closed'}" title="${feature.properties.id}: ${feature.properties.ubicacion || 'Válvula de Sectorización'} (${isOpen ? 'Abierta' : 'Cerrada'})">
            <span class="valve-inner-symbol">${isOpen ? '⚙' : '🔒'}</span>
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const marker = L.marker(latlng, { icon: icon });
    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        showValveDetails(feature.properties);
    });
    return marker;
}

function createAccessoryMarker(feature, latlng) {
    const tipo = feature.properties.tipo || '';
    let symbol = '🔧';
    let bgColor = '#8b5cf6';

    if (tipo.includes('Grifo')) { symbol = '🚒'; bgColor = '#f97316'; }
    else if (tipo.includes('Ventosa')) { symbol = '💨'; bgColor = '#a855f7'; }
    else if (tipo.includes('Purga')) { symbol = '🌊'; bgColor = '#eab308'; }

    const icon = L.divIcon({
        className: 'custom-acc-icon',
        html: `<div style="
            background: ${bgColor};
            color: #fff;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10.5px;
            border: 1.5px solid #fff;
            box-shadow: 0 0 6px ${bgColor};
            cursor: pointer;
        ">${symbol}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const marker = L.marker(latlng, { icon: icon });
    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        showAccessoryDetails(feature.properties);
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

    // Popup interactivo sobre el mapa (Ficha Resumida por defecto para vista móvil y escritorio)
    const popupHtml = `
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
                <span>📋</span> Ver Ficha Técnica Completa
            </button>
        </div>
    `;

    marker.bindPopup(popupHtml, {
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

    if (tankPctLabel) tankPctLabel.innerText = tankPercent + '%';
    if (tankVolLabel) tankVolLabel.innerText = `${AppState.tankCurrentVol} m³ / 50 m³`;
    if (tankFillBar) {
        tankFillBar.style.width = tankPercent + '%';
        if (tankPercent < 40) tankFillBar.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
        else tankFillBar.style.background = 'linear-gradient(90deg, #0284c7, #00d2ff)';
    }
    if (pumpStateLabel) {
        pumpStateLabel.innerText = AppState.pumpStatus;
        pumpStateLabel.style.color = AppState.pumpStatus.includes('ENCENDIDA') ? 'var(--accent-green)' : 'var(--text-muted)';
    }
    if (pumpFlowLabel) pumpFlowLabel.innerText = AppState.pumpFlow + ' L/s';
    if (minPressLabel) {
        minPressLabel.innerText = minPressure + ' m.c.a.';
        minPressLabel.style.color = minPressure < 14.0 ? 'var(--accent-yellow)' : 'var(--accent-green)';
    }
    if (timelineMinPress) {
        timelineMinPress.innerText = minPressure + ' m.c.a.';
        timelineMinPress.style.color = minPressure < 14.0 ? 'var(--accent-yellow)' : 'var(--accent-green)';
    }
    if (timelineTankVol) timelineTankVol.innerText = AppState.tankCurrentVol + ' m³';
}

// ------------------------------------------------------------------------------
// 5. SIMULADOR DE ROTURA COMPACTO (NO BLOQUEA EL MAPA)
// ------------------------------------------------------------------------------
function toggleEmergencyMode() {
    AppState.emergencyMode = !AppState.emergencyMode;
    const btn = document.getElementById('btn-emergency-mode');
    
    if (AppState.emergencyMode) {
        btn.classList.add('active');
        btn.innerHTML = '🚨 MODO ACTIVO: Pincha una Tubería';
        document.getElementById('map').style.cursor = 'crosshair';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '🚨 Simular Rotura';
        document.getElementById('map').style.cursor = '';
        clearBurstSimulation();
    }
}

function triggerBurstSimulation(feature, layer) {
    const props = feature.properties;

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

    // Centrar mapa suavemente en la rotura sin tapar la vista
    map.flyTo(layer.getBounds().getCenter(), 15, { duration: 0.8 });

    // Mostrar Tarjeta Compacta en la esquina inferior izquierda
    const card = document.getElementById('emergency-card');
    document.getElementById('burst-pipe-id').innerText = `${props.id_tramo} (${props.sector || 'Red'})`;
    document.getElementById('burst-valves-rec').innerHTML = valvesToClose.map(v => `<li>Cerrar <strong>${v}</strong> en sentido HORARIO.</li>`).join('');
    document.getElementById('burst-affected-count').innerText = `${affectedHomes} familias`;
    
    card.style.display = 'block';
}

function executeEmergencyCut() {
    alert('PROTOCOLO EJECUTADO:\nSe instruyó al fontanero el cierre de válvulas recomendadas.\nSector aislado correctamente.');
    clearBurstSimulation();
    if (AppState.emergencyMode) {
        toggleEmergencyMode();
    }
}

function repairAndRestore() {
    alert('REPARACIÓN CONCLUIDA:\nAbrazadera instalada y válvulas normalizadas.\nPresión en red restablecida.');
    clearBurstSimulation();
    if (AppState.emergencyMode) {
        toggleEmergencyMode();
    }
}

function clearBurstSimulation() {
    const burstLayerToReset = activeBurstLayer || (AppState.activeBurst ? AppState.activeBurst.layer : null);
    activeBurstLayer = null;
    AppState.activeBurst = null;

    if (burstLayerToReset && layers.redes) {
        layers.redes.resetStyle(burstLayerToReset);
    }

    // Resetear todas las tuberías de la red para asegurar que ninguna quede roja pegada
    if (layers.redes) {
        layers.redes.eachLayer(l => {
            if (layers.redes.resetStyle) {
                layers.redes.resetStyle(l);
            }
        });
    }

    const card = document.getElementById('emergency-card');
    if (card) card.style.display = 'none';
}

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
    window.openDetailTab();
}

function showValveDetails(props) {
    const isOpen = AppState.valvesState[props.id] !== false;
    const badge = '<span class="drawer-badge badge-valve">VÁLVULA DE SECTORIZACIÓN</span>';
    const sim = (typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined') ? VALVE_OUTAGE_SIMULATION_DB[props.id] : null;
    const affectedCount = sim ? sim.affectedCount : 0;
    const pipesKm = sim ? sim.pipesKm : 0;
    const pipesCount = sim ? sim.pipesCount : 0;
    const sectorAfectado = sim ? sim.sector : props.sector_afectado;
    const recoveryTime = sim ? sim.recovery_time : '20 min';

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

            <!-- Bloque 2: Maniobra de Terreno -->
            <div class="ficha-card ficha-block-maneuver">
                <div class="ficha-card-label"><span class="block-icon">🔄</span> PROTOCOLO DE MANIOBRA</div>
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

                <!-- Botón táctil grande de maniobra -->
                <button class="btn-toggle-valve-tactil ${isOpen ? 'btn-valve-close' : 'btn-valve-open'}" onclick="toggleValveState('${props.id}')">
                    ${isOpen ? '🔒 Simular Maniobra: CERRAR' : '🔓 Simular Maniobra: ABRIR (Restablecer)'}
                </button>
            </div>

            <!-- Bloque 3: Afectación si está cerrada -->
            ${outagePanelHtml}

            <button class="btn-act btn-repair" style="width:100%; margin-top:8px; padding:6px 10px; font-size:11px;" onclick="printValveSheet('${props.id}')">
                📄 Imprimir Ficha Oficial
            </button>
        </div>
    `;

    setDrawerDetail(props.id + ' - ' + (props.nombre || props.id), badge, html);
}

function toggleValveState(valveId) {
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
        map.fitBounds(bounds.pad(0.12), { maxZoom: 16, duration: 1.0 });
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
        if (window.innerWidth < 768 && typeof closeRightDrawer === 'function') {
            closeRightDrawer();
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
    if (typeof json_Arranques_GeoConecta !== 'undefined') {
        const item = json_Arranques_GeoConecta.features.find(f => f.properties.id_arranque === arranqueId);
        if (item) {
            map.closePopup();
            showConsumerDetails(item.properties);
        }
    }
};

window.showSourceDetailsFromPopup = function(fid) {
    if (typeof json_Fuentefuente__output_point_layer_6 !== 'undefined') {
        const item = json_Fuentefuente__output_point_layer_6.features.find(f => f.properties.fid === fid);
        if (item) {
            const p = item.properties;
            const isTank = (p.name && (p.name.includes('50') || p.name.includes('25') || p.name.includes('Estanque') || p.name.includes('SE'))) || 
                           (p.tipo_obra && p.tipo_obra.includes('Estanque'));
            showSourceDetails(p, isTank);
        }
    }
};

function showSourceDetails(props, isTank) {
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
        </div>
    `;

    const badge = '<span class="drawer-badge" style="background:rgba(2,132,199,0.2); color:#00d2ff;">RED DE TUBERÍA</span>';
    setDrawerDetail(props.id_tramo + ' - ' + props.sector, badge, html);
}

window.openPipeDrawerFromPopup = function(pipeId) {
    if (typeof json_Redes_Enriquecidas !== 'undefined') {
        const item = json_Redes_Enriquecidas.features.find(f => f.properties.id_tramo === pipeId);
        if (item) {
            map.closePopup();
            showPipeDetails(item.properties);
        }
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
            showValveDetails(props);
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

function initRoleManager() {
    const roleSelect = document.getElementById('select-user-role');
    const savedRole = localStorage.getItem('aquavisor_role') || 'terreno';
    
    if (roleSelect) {
        roleSelect.value = savedRole;
        roleSelect.addEventListener('change', (e) => {
            setAppRole(e.target.value);
        });
    }
    setAppRole(savedRole, false);
}

function setAppRole(role) {
    currentAppRole = role;
    localStorage.setItem('aquavisor_role', role);
    const roleSelect = document.getElementById('select-user-role');
    const roleIcon = document.getElementById('current-role-icon');
    const ribbon = document.getElementById('executive-kpi-ribbon');

    const icons = {
        'terreno': '👷',
        'administracion': '👩‍💼',
        'directorio': '📊',
        'auditor': '🏛️'
    };

    if (roleSelect) roleSelect.value = role;
    if (roleIcon) roleIcon.textContent = icons[role] || '🚰';

    document.body.classList.remove('role-terreno', 'role-administracion', 'role-directorio', 'role-auditor');
    document.body.classList.add('role-' + role);

    // 1. Modo Directorio (Comité) -> Muestra Ribbon Superior de KPIs y pestaña SCADA
    if (role === 'directorio') {
        if (ribbon) ribbon.style.display = 'flex';
        if (window.openRightDrawer) window.openRightDrawer('telemetry');
    } else {
        if (ribbon) ribbon.style.display = 'none';
    }

    // 2. Modo Administración (Secretaria / Cobranza) -> Solo Cobranza y Ficha
    if (role === 'administracion') {
        if (window.openRightDrawer) window.openRightDrawer('commercial');
    }

    // 3. Modo Terreno (Operador) -> Pantalla limpia, Ficha y Copiloto
    if (role === 'terreno') {
        if (window.openRightDrawer) {
            window.openRightDrawer('detail');
        }
        if (window.innerWidth < 768 && window.closeRightDrawer) {
            window.closeRightDrawer();
        }
    }

    // 4. Modo Auditor (DOH / Ley 20.998) -> Garantiza capa oficial activa y telemetría
    if (role === 'auditor') {
        if (layers && layers.concesion && !map.hasLayer(layers.concesion)) {
            map.addLayer(layers.concesion);
            const chk = document.getElementById('chk-concesion');
            if (chk) chk.checked = true;
        }
        if (window.openRightDrawer) window.openRightDrawer('telemetry');
    }
}
window.onRoleSelectChange = setAppRole;

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
// C. COPILOTO INTELIGENTE SSR (IA GENERATIVA OPERATIVA)
// ------------------------------------------------------------------------------
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
        keywords: ['comunicado', 'whatsapp', 'redactar aviso', 'aviso de corte'],
        response: 'Para redactar un comunicado a los vecinos, simula el corte de la válvula correspondiente en el mapa y presiona el botón <strong>"📲 WhatsApp"</strong>. El sistema redactará automáticamente el texto con los pasajes y viviendas afectadas listo para copiar.'
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

    const div = document.createElement('div');
    div.className = `copilot-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    div.innerHTML = `
        <div class="msg-sender">${sender === 'user' ? '👤 Operador / Usuario' : '🤖 Copiloto SSR'}</div>
        <div class="msg-bubble">${htmlText}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function clearCopilotChat() {
    const container = document.getElementById('copilot-chat-messages');
    if (container) {
        container.innerHTML = `
            <div class="copilot-msg bot-msg">
                <div class="msg-sender">🤖 Copiloto SSR</div>
                <div class="msg-bubble">
                    Conversación reiniciada. ¿En qué te puedo asesorar respecto a la red de agua o la cobranza?
                </div>
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
    currentOutageValveForWhatsApp = valveId;
    const modal = document.getElementById('whatsapp-broadcast-modal');
    if (!modal) return;

    const textarea = document.getElementById('whatsapp-message-text');
    const sim = typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined' ? VALVE_OUTAGE_SIMULATION_DB[valveId] : null;

    const sectorName = sim ? sim.sector : 'Sector Red Matriz';
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
    if (!textarea || !currentOutageValveForWhatsApp) return;

    const sim = typeof VALVE_OUTAGE_SIMULATION_DB !== 'undefined' ? VALVE_OUTAGE_SIMULATION_DB[currentOutageValveForWhatsApp] : null;
    const sector = sim ? sim.sector : 'Sector Red';
    const count = sim ? sim.affectedCount : 20;

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
    if (!navigator.geolocation) {
        alert('La geolocalización no está soportada en este navegador.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
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
    if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
    } else {
        drawer.classList.add('open');
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