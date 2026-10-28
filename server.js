const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

let PORT = 5500;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.geojson': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.pdf': 'application/pdf'
};

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIp = getLocalIpAddress();

const server = http.createServer((req, res) => {
    // Manejo de endpoint para consultar la IP en tiempo real
    if (req.url === '/api/server-info') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ip: localIp, port: PORT, mobileUrl: `http://${localIp}:${PORT}` }));
        return;
    }

    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
        reqPath = '/emulador.html'; // Abre el emulador móvil por defecto
    }

    const filePath = path.join(ROOT_DIR, reqPath);

    // Evitar salir del directorio raíz
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Acceso denegado');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h3>404 No Encontrado</h3><p>El archivo <code>${reqPath}</code> no existe.</p>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

function startServer(portToTry) {
    PORT = portToTry;
    server.listen(PORT, '0.0.0.0', () => {
        console.log('\n=============================================================');
        console.log('   🚀 SERVIDOR LOCAL & EMULADOR MÓVIL GEOVISOR AQUAVISOR');
        console.log('=============================================================');
        console.log(`\n💻 En tu Computador (Emulador Interactivo):`);
        console.log(`   👉 http://localhost:${PORT}/emulador.html`);
        console.log(`   👉 http://localhost:${PORT}/index.html (directo)`);
        console.log(`\n📱 En tu Celular (Conectado a la misma red Wi-Fi):`);
        console.log(`   👉 http://${localIp}:${PORT}/index.html`);
        console.log(`\n💡 Tip: Abre la cámara de tu celular y apunta al código QR`);
        console.log(`   que aparece en la pantalla del emulador en tu PC.`);
        console.log('=============================================================\n');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
            console.log(`Puerto ${PORT} no disponible, probando puerto ${PORT + 1}...`);
            startServer(PORT + 1);
        } else {
            console.error('Error al iniciar el servidor:', err);
        }
    });
}

startServer(PORT);
