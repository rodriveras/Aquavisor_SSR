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
let lastDrawerActionTime = 0;
let layers = {
    redes: null,
    conexiones: null,
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

    // Pane dedicado para Arranques y Medidores (siempre prioritario al tacto sobre tuberías y polígonos)
    map.createPane('arranquesPane');
    map.getPane('arranquesPane').style.zIndex = '620';

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
    const tabBtnDetail = document.getElementById('tab-btn-detail');
    const tabContentTelemetry = document.getElementById('tab-content-telemetry');
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
        btnToggleTelemetry.classList.add('active');
        switchRightTab(tabName);
        syncBackdrop();
    }

    function closeRightDrawer() {
        drawerRight.classList.remove('open');
        btnToggleTelemetry.classList.remove('active');
        if (selectedPipeLayer && layers.redes) {
            layers.redes.resetStyle(selectedPipeLayer);
            selectedPipeLayer = null;
        }
        syncBackdrop();
    }

    // Exponer globalmente para cerrar panel derecho
    window.closeRightDrawer = closeRightDrawer;

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
    // A. Área de Concesión Oficial (DOH / Ley 20.998)
    if (typeof json_Area_Servicio_4 !== 'undefined') {
        layers.concesion = L.geoJSON(json_Area_Servicio_4, {
            style: {
                color: '#f97316', // Naranja / Ámbar institucional DOH (Completamente diferenciado de tuberías)
                weight: 2.8,
                dashArray: '12, 5, 3, 5', // Raya-punto oficial de deslinde territorial
                fillColor: '#f97316',
                fillOpacity: 0.05
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

    // G. Conexiones Domiciliarias (Simulación de Acometidas a la Red)
    if (typeof json_Conexiones_Domiciliarias !== 'undefined') {
        layers.conexiones = L.geoJSON(json_Conexiones_Domiciliarias, {
            style: styleConnection,
            onEachFeature: onEachConnectionFeature
        }).addTo(map);
    }

    // H. Arranques y Medidores
    if (typeof json_Arranques_GeoConecta !== 'undefined') {
        layers.arranques = L.geoJSON(json_Arranques_GeoConecta, {
            pointToLayer: createConsumerMarker
        }).addTo(map);
    }

    // Checkboxes
    bindLayerCheckbox('chk-redes', layers.redes);
    bindLayerCheckbox('chk-conexiones', layers.conexiones);
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
    const tipoColor = isImpulsion ? '#818cf8' : (isTroncal ? '#60a5fa' : '#22d3ee');

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
                selectedPipeLayer = null;
                const drawerRight = document.getElementById('drawer-right');
                if (drawerRight) drawerRight.classList.remove('open');
                return;
            }

            selectedPipeLayer = layer;
            layer.setStyle({
                color: '#fbbf24', // Dorado/amarillo brillante de selección técnica
                weight: 6.5,
                opacity: 1
            });
            layer.bringToFront();
            showPipeDetails(feature.properties);
        }
    });

    layer.bindTooltip(`
        <strong style="color:${tipoColor}; font-size:10px;">${tipoRed.toUpperCase()}</strong><br>
        <strong>${p.id_tramo || 'Tubería'}</strong> - ${p.sector}<br>
        Diámetro: <strong>${p.diametro_nominal}</strong> (${p.material})
    `, { sticky: true });
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
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px;">
                <span style="font-size:10px; font-weight:800; color:#facc15; letter-spacing:0.4px;">🔌 ACOMETIDA DOMICILIARIA</span>
                <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:rgba(250,204,21,0.15); color:#facc15; border:1px solid #facc15;">
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
    marker.on('click', (e) => {
        if (e) {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.stopPropagation(e);
        }
        showSourceDetails(feature.properties, isTank);
    });
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
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            border: 1.5px solid #ffffff;
            box-shadow: 0 0 8px ${isOpen ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.9)'};
            cursor: pointer;
        ">${isOpen ? 'V' : 'X'}</div>`,
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
    const estado = p.estado_comercial || 'Al Día';
    let color = '#10b981';
    let badgeBg = 'rgba(16,185,129,0.2)';
    let badgeColor = '#10b981';

    if (estado.includes('Moroso')) {
        color = '#f59e0b';
        badgeBg = 'rgba(245,158,11,0.2)';
        badgeColor = '#f59e0b';
    } else if (estado.includes('Suspendido')) {
        color = '#ef4444';
        badgeBg = 'rgba(239,68,68,0.2)';
        badgeColor = '#ef4444';
    }

    const isMobile = window.innerWidth < 768;
    const marker = L.circleMarker(latlng, {
        pane: 'arranquesPane',
        radius: isMobile ? 7.5 : 5.5,
        fillColor: color,
        color: '#ffffff',
        weight: isMobile ? 2 : 1.5,
        opacity: 1.0,
        fillOpacity: 0.9,
        bubblingMouseEvents: false
    });

    // Verificación si el arranque está dentro o fuera del Área de Servicio DOH
    const isInsideServ = typeof json_Conexiones_Domiciliarias !== 'undefined' && 
                         json_Conexiones_Domiciliarias.features.some(f => f.properties.id_arranque === p.id_arranque);

    // Popup interactivo sobre el mapa (Ficha Resumida por defecto para vista móvil y escritorio)
    const popupHtml = `
        <div class="popup-consumer">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:5px;">
                <span style="font-size:10px; font-weight:800; color:#00d2ff; letter-spacing:0.4px;">💧 ARRANQUE DOMICILIARIO</span>
                <span style="font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px; background:${badgeBg}; color:${badgeColor}; border:1px solid ${color};">
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
    const estado = props.estado_comercial || 'Al Día';
    const isAlDia = estado.includes('Al Día');
    const estadoColor = isAlDia ? 'var(--accent-green)' : (estado.includes('Moroso') ? 'var(--accent-yellow)' : 'var(--accent-red)');

    let conexionHtml = '';
    if (typeof json_Conexiones_Domiciliarias !== 'undefined') {
        const con = json_Conexiones_Domiciliarias.features.find(f => f.properties.id_arranque === props.id_arranque);
        if (con) {
            conexionHtml = `
                <tr><td class="prop-name">Empalme Red:</td><td class="prop-val"><strong style="color:var(--accent-cyan)">${con.properties.id_tramo_red}</strong> (${con.properties.longitud_m} m)</td></tr>
                <tr><td class="prop-name">Acometida:</td><td class="prop-val">${con.properties.diametro}</td></tr>
                <tr><td class="prop-name">Área Servicio:</td><td class="prop-val" style="color:var(--accent-green); font-weight:700;">✓ Dentro de Área Oficial DOH</td></tr>
            `;
        } else {
            conexionHtml = `
                <tr><td class="prop-name">Área Servicio:</td><td class="prop-val" style="color:var(--accent-yellow); font-weight:700;">⚠️ Fuera de Concesión DOH</td></tr>
            `;
        }
    }

    const html = `
        <table class="prop-table">
            <tr><td class="prop-name">Arranque:</td><td class="prop-val"><strong>${props.id_arranque || '-'}</strong></td></tr>
            <tr><td class="prop-name">Socio:</td><td class="prop-val" style="color:var(--accent-cyan)"><strong>${props.socio || '-'}</strong></td></tr>
            <tr><td class="prop-name">RUT:</td><td class="prop-val">${props.rut || '-'}</td></tr>
            <tr><td class="prop-name">Medidor:</td><td class="prop-val"><code>${props.n_medidor || '-'}</code></td></tr>
            <tr><td class="prop-name">Estado:</td><td class="prop-val"><span style="color:${estadoColor}">● ${estado}</span></td></tr>
            <tr><td class="prop-name">Consumo Prom:</td><td class="prop-val">${props.consumo_prom_m3 || '0'} m³/mes</td></tr>
            <tr><td class="prop-name">Presión Grifo:</td><td class="prop-val" style="color:var(--accent-green)"><strong>${props.presion_servicio_mca || '-'} m.c.a.</strong></td></tr>
            <tr><td class="prop-name">Cota Terreno:</td><td class="prop-val">${props.cota_terreno_m || '-'} m.s.n.m.</td></tr>
            ${conexionHtml}
            <tr><td class="prop-name">Tipo de Uso:</td><td class="prop-val">${props.tipo_uso || 'Residencial Rural'}</td></tr>
            <tr><td class="prop-name">Diámetro:</td><td class="prop-val">${props.diametro || '1/2 pulgada'}</td></tr>
            <tr><td class="prop-name">Instalación:</td><td class="prop-val">${props.fecha_instalacion || '-'}</td></tr>
        </table>
    `;

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
    const diam = props.diametro_nominal || '75 mm';
    const isTroncal = diam.includes('110') || diam.includes('90');
    const isImpulsion = props.id_tramo === 'TUB-11' || (props.sector && props.sector.includes('Impulsión'));
    
    let badgeText = isImpulsion ? 'IMPULSIÓN' : (isTroncal ? 'MATRIZ TRONCAL' : 'RED RAMAL');
    let badgeColor = isImpulsion ? '#818cf8' : (isTroncal ? '#38bdf8' : '#00e5ff');
    let badgeBg = isImpulsion ? 'rgba(99,102,241,0.2)' : (isTroncal ? 'rgba(2,132,199,0.2)' : 'rgba(0,229,255,0.2)');
    const badge = `<span class="drawer-badge" style="background:${badgeBg}; color:${badgeColor};">${badgeText}</span>`;

    const html = `
        <table class="prop-table">
            <tr><td class="prop-name">ID Tramo:</td><td class="prop-val"><strong>${props.id_tramo}</strong></td></tr>
            <tr><td class="prop-name">Jerarquía:</td><td class="prop-val"><strong style="color:${badgeColor}">${isImpulsion ? 'Línea de Impulsión' : (isTroncal ? 'Matriz Principal Troncal' : 'Red Ramal Secundaria')}</strong></td></tr>
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
                layers.arranques.eachLayer(layer => {
                    if (layer.feature && layer.feature.properties.id_arranque === props.id_arranque) {
                        layer.openPopup();
                    }
                });
            }
            if (window.closeRightDrawer) window.closeRightDrawer();
        }
    }, 1100);
}
