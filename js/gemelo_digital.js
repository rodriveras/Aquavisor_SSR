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
    valvesState: {} // { 'VALV-01': true, ... }
};

// Referencias a Capas Leaflet y Estado de Selección
let map;
let selectedPipeLayer = null;
let activeBurstLayer = null;
let layers = {
    redes: null,
    valvulas: null,
    arranques: null,
    accesorios: null,
    fuentes: null,
    concesion: null,
    censo: null
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
});

// ------------------------------------------------------------------------------
// 1. INICIALIZACIÓN DEL MAPA LEAFLET
// ------------------------------------------------------------------------------
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([-36.8480, -71.9180], 14);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

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
    const drawerRight = document.getElementById('drawer-right');
    const btnToggleLayers = document.getElementById('btn-toggle-layers');
    const btnFloatingLayers = document.getElementById('btn-floating-layers');
    const btnCloseLeft = document.getElementById('btn-close-drawer-left');
    
    const btnToggleTelemetry = document.getElementById('btn-toggle-telemetry');
    const btnCloseRight = document.getElementById('btn-close-drawer-right');
    const tabBtnTelemetry = document.getElementById('tab-btn-telemetry');
    const tabBtnDetail = document.getElementById('tab-btn-detail');
    const tabContentTelemetry = document.getElementById('tab-content-telemetry');
    const tabContentDetail = document.getElementById('tab-content-detail');

    // Panel Izquierdo (Capas)
    function toggleLeftDrawer() {
        drawerLeft.classList.toggle('open');
        btnToggleLayers.classList.toggle('active', drawerLeft.classList.contains('open'));
        btnFloatingLayers.style.display = drawerLeft.classList.contains('open') ? 'none' : 'flex';
    }

    if (btnToggleLayers) btnToggleLayers.addEventListener('click', toggleLeftDrawer);
    if (btnFloatingLayers) btnFloatingLayers.addEventListener('click', toggleLeftDrawer);
    if (btnCloseLeft) btnCloseLeft.addEventListener('click', toggleLeftDrawer);

    // Panel Derecho (Telemetría / Ficha)
    function openRightDrawer(tabName = 'telemetry') {
        drawerRight.classList.add('open');
        btnToggleTelemetry.classList.add('active');
        switchRightTab(tabName);
    }

    function closeRightDrawer() {
        drawerRight.classList.remove('open');
        btnToggleTelemetry.classList.remove('active');
        if (selectedPipeLayer && layers.redes) {
            layers.redes.resetStyle(selectedPipeLayer);
            selectedPipeLayer = null;
        }
    }

    function switchRightTab(tabName) {
        if (tabName === 'telemetry') {
            tabBtnTelemetry.classList.add('active');
            tabBtnDetail.classList.remove('active');
            tabContentTelemetry.style.display = 'block';
            tabContentDetail.style.display = 'none';
        } else {
            tabBtnTelemetry.classList.remove('active');
            tabBtnDetail.classList.add('active');
            tabContentTelemetry.style.display = 'none';
            tabContentDetail.style.display = 'block';
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
    if (tabBtnDetail) tabBtnDetail.addEventListener('click', () => switchRightTab('detail'));

    // Exponer globalmente para abrir detalles
    window.openDetailTab = function() {
        openRightDrawer('detail');
    };

    // Timeline Toggle (Colapsar / Expandir)
    const btnToggleTimeline = document.getElementById('btn-toggle-timeline');
    const dockTimeline = document.getElementById('dock-timeline');
    if (btnToggleTimeline && dockTimeline) {
        btnToggleTimeline.addEventListener('click', () => {
            dockTimeline.classList.toggle('minimized');
            if (dockTimeline.classList.contains('minimized')) {
                btnToggleTimeline.innerHTML = '⏱ Gemelo 24h (EPANET) ▼';
            } else {
                btnToggleTimeline.innerHTML = '⏱ Gemelo 24h (EPANET) ▲';
            }
        });
    }

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
    // A. Área de Concesión Oficial
    if (typeof json_Area_Servicio_4 !== 'undefined') {
        layers.concesion = L.geoJSON(json_Area_Servicio_4, {
            style: {
                color: '#00d2ff',
                weight: 2,
                dashArray: '5, 5',
                fillColor: '#0077ff',
                fillOpacity: 0.08
            }
        }).addTo(map);
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

    // G. Arranques y Medidores
    if (typeof json_Arranques_GeoConecta !== 'undefined') {
        layers.arranques = L.geoJSON(json_Arranques_GeoConecta, {
            pointToLayer: createConsumerMarker
        }).addTo(map);
    }

    // Checkboxes
    bindLayerCheckbox('chk-redes', layers.redes);
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
    const diam = feature.properties.diametro_nominal || '75 mm';
    let color = '#0284c7';
    let weight = 3;

    if (diam.includes('110')) {
        color = '#00d2ff';
        weight = 4.2;
    } else if (diam.includes('90')) {
        color = '#38bdf8';
        weight = 3.6;
    } else if (diam.includes('75')) {
        color = '#0284c7';
        weight = 2.8;
    } else {
        color = '#2dd4bf';
        weight = 2.2;
    }

    return {
        color: color,
        weight: weight,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
    };
}

function onEachPipeFeature(feature, layer) {
    layer.on('click', (e) => {
        if (e && e.originalEvent) {
            L.DomEvent.stopPropagation(e);
        }

        if (AppState.emergencyMode) {
            triggerBurstSimulation(feature, layer);
        } else {
            // Modo normal: inspección y selección interactiva
            if (selectedPipeLayer && layers.redes) {
                layers.redes.resetStyle(selectedPipeLayer);
            }

            if (selectedPipeLayer === layer) {
                // Si se hace clic en la misma tubería seleccionada, se deselecciona
                selectedPipeLayer = null;
                const drawerRight = document.getElementById('drawer-right');
                if (drawerRight) drawerRight.classList.remove('open');
                return;
            }

            selectedPipeLayer = layer;
            layer.setStyle({
                color: '#fbbf24', // Dorado/amarillo brillante de selección técnica
                weight: 6,
                opacity: 1
            });
            layer.bringToFront();
            showPipeDetails(feature.properties);
        }
    });

    layer.bindTooltip(`
        <strong>${feature.properties.id_tramo || 'Tubería'}</strong><br>
        Sector: ${feature.properties.sector}<br>
        Diámetro: ${feature.properties.diametro_nominal} (${feature.properties.material})
    `, { sticky: true });
}

function createSourceMarker(feature, latlng) {
    const isTank = feature.properties.name.includes('50') || feature.properties.name.includes('SE');
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background: ${isTank ? '#0284c7' : '#00d2ff'};
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            border: 2px solid #fff;
            box-shadow: 0 0 14px ${isTank ? 'rgba(2,132,199,0.8)' : 'rgba(0,210,255,0.8)'};
        ">${isTank ? '🚰' : '⚡'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker(latlng, { icon: customIcon });
    marker.on('click', () => showSourceDetails(feature.properties, isTank));
    return marker;
}

function createValveMarker(feature, latlng) {
    const vId = feature.properties.id;
    const isOpen = AppState.valvesState[vId] !== false;

    const icon = L.divIcon({
        className: 'custom-valve-icon',
        html: `<div style="
            background: ${isOpen ? '#10b981' : '#ef4444'};
            color: #ffffff;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9.5px;
            font-weight: 800;
            border: 1.5px solid #ffffff;
            box-shadow: 0 0 8px ${isOpen ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.9)'};
            cursor: pointer;
        ">${isOpen ? 'V' : 'X'}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const marker = L.marker(latlng, { icon: icon });
    marker.on('click', () => showValveDetails(feature.properties));
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
            width: 18px;
            height: 18px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            border: 1px solid #fff;
            box-shadow: 0 0 6px ${bgColor};
        ">${symbol}</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });

    const marker = L.marker(latlng, { icon: icon });
    marker.on('click', () => showAccessoryDetails(feature.properties));
    return marker;
}

function createConsumerMarker(feature, latlng) {
    const estado = feature.properties.estado_comercial || 'Al Día';
    let color = '#10b981';
    if (estado.includes('Moroso')) color = '#f59e0b';
    if (estado.includes('Suspendido')) color = '#ef4444';

    const marker = L.circleMarker(latlng, {
        radius: 4.0,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.85
    });

    marker.on('click', () => showConsumerDetails(feature.properties));
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
        else if (hour >= 7 && hour <= 9) period = 'Pico Matinal';
        else if (hour >= 12 && hour <= 14) period = 'Pico Almuerzo (Máxima Demanda)';
        else if (hour >= 20 && hour <= 22) period = 'Pico Nocturno';
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
        AppState.pumpStatus = 'ENCENDIDA (Apoyo Pico)';
        AppState.pumpFlow = 6.8;
    } else if (hour >= 20 && hour <= 22) {
        tankVol = 28.5 - ((hour - 20) * 1.8);
        AppState.pumpStatus = 'ENCENDIDA (Apoyo Pico)';
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
    if (timelineMinPress) timelineMinPress.innerText = minPressure + ' m.c.a.';
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
    if (props.sector && props.sector.includes('Norte')) {
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
    document.getElementById('drawer-badge-container').innerHTML = badgeHtml;
    document.getElementById('drawer-content').innerHTML = `
        <h4 style="font-size:13px; font-weight:700; color:#fff; margin-bottom:8px;">${title}</h4>
        ${contentHtml}
    `;
    window.openDetailTab();
}

function showValveDetails(props) {
    const isOpen = AppState.valvesState[props.id] !== false;
    const badge = `<span class="drawer-badge badge-valve">VÁLVULA DE SECTORIZACIÓN</span>`;

    const html = `
        <table class="prop-table">
            <tr><td class="prop-name">Código:</td><td class="prop-val"><strong>${props.id}</strong></td></tr>
            <tr><td class="prop-name">Tipo:</td><td class="prop-val">${props.tipo}</td></tr>
            <tr><td class="prop-name">Diámetro:</td><td class="prop-val">${props.diametro}</td></tr>
            <tr><td class="prop-name">Ubicación:</td><td class="prop-val">${props.ubicacion}</td></tr>
            <tr><td class="prop-name">Cámara:</td><td class="prop-val">${props.camara}</td></tr>
            <tr><td class="prop-name">Afectación:</td><td class="prop-val" style="color:var(--accent-yellow)">${props.sector_afectado}</td></tr>
        </table>

        <div class="valve-action-box">
            <div style="font-size:10.5px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Instrucción de Terreno</div>
            <div class="maneuver-direction">🔄 ${props.sentido_giro}</div>
            <div class="maneuver-turns">Vueltas de Cierre: <strong>${props.vueltas_cierre} vueltas</strong></div>
            <button class="btn-toggle-valve ${isOpen ? '' : 'closed'}" onclick="toggleValveState('${props.id}')">
                ${isOpen ? '🔒 Simular Maniobra: CERRAR' : '🔓 Simular Maniobra: ABRIR'}
            </button>
        </div>

        <button class="btn-act btn-repair" style="width:100%; margin-top:10px;" onclick="printValveSheet('${props.id}')">
            📄 Imprimir Ficha Oficial (Fontanero / DOH)
        </button>
    `;

    setDrawerDetail(props.id + ' - ' + props.nombre, badge, html);
}

function toggleValveState(valveId) {
    AppState.valvesState[valveId] = !AppState.valvesState[valveId];
    layers.valvulas.clearLayers();
    layers.valvulas.addData(json_Valvulas_GeoConecta);
    
    const f = json_Valvulas_GeoConecta.features.find(x => x.properties.id === valveId);
    if (f) showValveDetails(f.properties);
}

function showConsumerDetails(props) {
    const badge = `<span class="drawer-badge badge-consumer">ARRANQUE Y MEDIDOR</span>`;

    const html = `
        <table class="prop-table">
            <tr><td class="prop-name">Arranque:</td><td class="prop-val"><strong>${props.id_arranque}</strong></td></tr>
            <tr><td class="prop-name">Socio:</td><td class="prop-val" style="color:var(--accent-cyan)"><strong>${props.socio}</strong></td></tr>
            <tr><td class="prop-name">RUT:</td><td class="prop-val">${props.rut}</td></tr>
            <tr><td class="prop-name">Medidor:</td><td class="prop-val"><code>${props.n_medidor}</code></td></tr>
            <tr><td class="prop-name">Estado:</td><td class="prop-val"><span style="color:${props.estado_comercial.includes('Al Día') ? 'var(--accent-green)' : 'var(--accent-red)'}">● ${props.estado_comercial}</span></td></tr>
            <tr><td class="prop-name">Consumo Prom:</td><td class="prop-val">${props.consumo_prom_m3} m³/mes</td></tr>
            <tr><td class="prop-name">Presión Grifo:</td><td class="prop-val" style="color:var(--accent-green)"><strong>${props.presion_servicio_mca} m.c.a.</strong></td></tr>
            <tr><td class="prop-name">Cota Terreno:</td><td class="prop-val">${props.cota_terreno_m} m.s.n.m.</td></tr>
        </table>
    `;

    setDrawerDetail(props.socio, badge, html);
}

function showSourceDetails(props, isTank) {
    const badge = `<span class="drawer-badge" style="background:rgba(2,132,199,0.3); color:#00d2ff;">${isTank ? 'ESTANQUE DE REGULACIÓN' : 'CAPTACIÓN POZO'}</span>`;

    let html = isTank ? `
        <table class="prop-table">
            <tr><td class="prop-name">Capacidad:</td><td class="prop-val">50.0 m³</td></tr>
            <tr><td class="prop-name">Volumen Actual:</td><td class="prop-val" style="color:var(--accent-cyan)"><strong>${AppState.tankCurrentVol} m³</strong></td></tr>
            <tr><td class="prop-name">Altura Torre:</td><td class="prop-val">15.0 m</td></tr>
            <tr><td class="prop-name">Cota Solera:</td><td class="prop-val">142.5 m.s.n.m.</td></tr>
            <tr><td class="prop-name">Salida:</td><td class="prop-val">PVC 110 mm</td></tr>
        </table>
    ` : `
        <table class="prop-table">
            <tr><td class="prop-name">Profundidad:</td><td class="prop-val">48.0 m</td></tr>
            <tr><td class="prop-name">Bomba:</td><td class="prop-val">7.5 HP Trifásica</td></tr>
            <tr><td class="prop-name">Caudal:</td><td class="prop-val"><strong>6.8 L/s</strong></td></tr>
            <tr><td class="prop-name">Derecho DGA:</td><td class="prop-val">8.0 L/s Consuntivo</td></tr>
        </table>
    `;

    setDrawerDetail(props.name, badge, html);
}

function showPipeDetails(props) {
    const badge = `<span class="drawer-badge" style="background:rgba(56,189,248,0.2); color:#38bdf8;">TUBERÍA</span>`;

    const html = `
        <table class="prop-table">
            <tr><td class="prop-name">ID Tramo:</td><td class="prop-val"><strong>${props.id_tramo}</strong></td></tr>
            <tr><td class="prop-name">Sector:</td><td class="prop-val">${props.sector}</td></tr>
            <tr><td class="prop-name">Diámetro:</td><td class="prop-val"><strong>${props.diametro_nominal}</strong></td></tr>
            <tr><td class="prop-name">Material:</td><td class="prop-val">${props.material} (${props.clase})</td></tr>
            <tr><td class="prop-name">Rugosidad:</td><td class="prop-val">C = ${props.rugosidad_hazen_williams}</td></tr>
            <tr><td class="prop-name">Caudal Diseño:</td><td class="prop-val">${props.caudal_diseno_lps} L/s</td></tr>
        </table>
    `;

    setDrawerDetail(props.id_tramo + ' - ' + props.sector, badge, html);
}

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
    const slider = document.getElementById('time-slider');
    if (slider) slider.addEventListener('input', (e) => updateDigitalTwin(parseInt(e.target.value)));

    const playBtn = document.getElementById('btn-play-pause');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            AppState.isPlaying = !AppState.isPlaying;
            if (AppState.isPlaying) {
                playBtn.innerHTML = '⏸';
                AppState.playInterval = setInterval(() => {
                    let nextHour = (AppState.currentHour + 1) % 24;
                    updateDigitalTwin(nextHour);
                }, 1200);
            } else {
                playBtn.innerHTML = '▶';
                clearInterval(AppState.playInterval);
            }
        });
    }

    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.profile = btn.getAttribute('data-profile');
            applyProfileMode(AppState.profile);
        });
    });

    const emBtn = document.getElementById('btn-emergency-mode');
    if (emBtn) emBtn.addEventListener('click', toggleEmergencyMode);
}

function applyProfileMode(mode) {
    if (mode === 'operativo') {
        map.setView([-36.8464, -71.9017], 15);
    } else {
        map.setView([-36.8480, -71.9180], 14);
    }
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
                if (p.socio.toLowerCase().includes(query) || p.rut.toLowerCase().includes(query) || p.n_medidor.toLowerCase().includes(query)) {
                    matches.push({
                        title: p.socio,
                        sub: `RUT: ${p.rut} | Medidor: ${p.n_medidor}`,
                        tag: 'CLIENTE',
                        coords: f.geometry.coordinates,
                        type: 'consumer',
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

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            resultsBox.style.display = 'none';
        }
    });
}

function onSearchResultClick(type, propsEncoded, lng, lat) {
    const props = JSON.parse(decodeURIComponent(propsEncoded));
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-input').value = '';

    map.flyTo([lat, lng], 17, { duration: 1.0 });

    setTimeout(() => {
        if (type === 'valve') showValveDetails(props);
        else if (type === 'consumer') showConsumerDetails(props);
    }, 1100);
}
