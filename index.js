const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// PRIVACY POLICY - KWA META APP REVIEW
app.get('/', (req, res) => {
  res.type('text/plain');
  res.send(`Kapela Bot - Privacy Policy

Wilondja Kapela Kapela respects your privacy.

1. DATA TUNAKUSANYA
Tunakusanya namba yako ya WhatsApp na ujumbe unaotuma kwa Kapela Bot.

2. KWA NINI TUNAKUSANYA
Tunatumia data yako kujibu maswali yako tu. Hatutumi kwa marketing au matangazo.

3. TUNAWEKA WAPI
Data inahifadhiwa salama kwenye server za Render.com. Hatushare na kampuni nyingine yoyote.

4. HAKI YAKO
Unaweza kuomba data yako ifutwe wakati wowote:
   a) Tuma "DELETE MY DATA" kwa WhatsApp number yetu
   b) Au email: wilondja@example.com na subject "DELETE MY DATA"
   Tutafuta data yako yote ndani ya masaa 24.

5. MAWASILIANO
Business: Wilondja Kapela Kapela
Address: Dar es Salaam, Tanzania 
Email: wilondja@example.com
Last Updated: May 9, 2026`);
});

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'kapela2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// WEBHOOK VERIFICATION
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

// RECEIVE MESSAGES
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const msg_body = message.text.body;
      console.log(`Message kutoka ${from}: ${msg_body}`);
      
      let reply_text = "MAMBO MKUU 🔥 Karibu sana Kapela Bot. Nisa
