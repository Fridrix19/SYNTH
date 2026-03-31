/**
 * Один процесс для Railway (и локально): статика из public/ + маршруты /api/* (как на Vercel).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

const componentsHandler = require('./api/components');
const buildsHandler = require('./api/builds');
const contactHandler = require('./api/contact');

app.get('/api/components', (req, res) => componentsHandler(req, res));
app.get('/api/builds', (req, res) => buildsHandler(req, res));
app.post('/api/contact', (req, res) => contactHandler(req, res));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SYNTH http://0.0.0.0:${PORT}`);
});
