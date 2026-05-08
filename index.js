const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'kapela2026';

// 1. HII NDIO META ANAITAJI KWA VERIFY
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. HII NI YA KUPOKEA MESSAGES BAADAE
app.post('/webhook', (req, res) => {
  console.log('Message received:', req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('KAPELA');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
