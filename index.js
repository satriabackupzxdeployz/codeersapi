const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

require('./function.js');

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1450847301558866052/-FdjYvaEwcAqVH7tO-r1MKkUiR0Hx7VjBkWwlayXbRN7bxvPIGGAfdFmH04r4NdfzU7o';

let logBuffer = [];

setInterval(() => {
    if (logBuffer.length === 0) return;
    const combinedLogs = logBuffer.join('\n');
    logBuffer = [];
    const payload = ` \`\`\`ansi\n${combinedLogs}\n\`\`\`\n`;
    axios.post(WEBHOOK_URL, { content: payload }).catch(() => {});
}, 2000);

function queueLog({ method, status, url, duration, error = null }) {
    let colorCode;
    if (status >= 500) colorCode = '\x1b[2;31m';
    else if (status >= 400) colorCode = '\x1b[2;31m';
    else if (status === 304) colorCode = '\x1b[2;34m';
    else colorCode = '\x1b[2;32m';
    let line = `${colorCode}[${method}] ${status} ${url} - ${duration}ms\x1b[0m`;
    if (error) line += `\n\x1b[2;31m[ERROR] ${error.message || error}\x1b[0m`;
    logBuffer.push(line);
}

let requestCount = 0;
let isCooldown = false;

setInterval(() => { requestCount = 0; }, 1000);

app.use((req, res, next) => {
    if (isCooldown) {
        queueLog({ method: req.method, status: 503, url: req.originalUrl, duration: 0, error: 'Server is in cooldown' });
        return res.status(503).json({ error: 'Server is in cooldown, try again later.' });
    }
    requestCount++;
    if (requestCount > 10) {
        isCooldown = true;
        const cooldownTime = (Math.random() * (120000 - 60000) + 60000).toFixed(3);
        console.log(`⚠️ SPAM DETECT: Cooldown ${cooldownTime / 1000} detik`);
        const userTag = '<@1162931657276395600>';
        const spamMsg = `${userTag}\n\`\`\`ansi\n⚠️ [ SPAM DETECT ] ⚠️\n\n[ ! ] Too many requests, server cooldown for ${cooldownTime / 1000} sec!\n\x1b[2;31m[${req.method}] 503 ${req.originalUrl} - 0ms\x1b[0m\n\`\`\`\n`;
        axios.post(WEBHOOK_URL, { content: spamMsg }).catch(() => {});
        setTimeout(() => {
            isCooldown = false;
            console.log('✅ Cooldown selesai, server aktif lagi');
        }, cooldownTime);
        return res.status(503).json({ error: 'Too many requests, server cooldown!' });
    }
    next();
});

app.enable('trust proxy');
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const settingsPath = path.join(__dirname, './assets/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
global.apikey = settings.apiSettings.apikey;

app.use((req, res, next) => {
    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
    global.totalreq += 1;

    const start = Date.now();
    const originalJson = res.json;

    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || 'Coders',
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };

    res.on('finish', () => {
        const duration = Date.now() - start;
        queueLog({ method: req.method, status: res.statusCode, url: req.originalUrl, duration });
    });

    next();
});

app.use('/src', (req, res) => {
    res.status(403).json({ error: 'Forbidden access' });
});

let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                try {
                    require(filePath)(app);
                    totalRoutes++;
                    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
                } catch (e) {
                    console.log(chalk.bgHex('#FFB6C1').hex('#333').bold(` Failed Route: ${path.basename(file)} — ${e.message} `));
                }
            }
        });
    }
});

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/style.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

app.get('/app.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'app.js'));
});

app.get('/assets/settings.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'settings.json'));
});

app.get('/notifications.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notifications.json'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use((req, res, next) => {
    queueLog({ method: req.method, status: 404, url: req.originalUrl, duration: 0, error: 'Not Found' });
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    queueLog({ method: req.method, status: 500, url: req.originalUrl, duration: 0, error: err });
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
