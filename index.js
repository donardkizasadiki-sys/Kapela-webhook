const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// 1. PRIVACY POLICY - HII NDIO META ANAANGALIA KWANZA
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

// 2. WEBHOOK VERIFICATION - KWA META
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

// 3. KUPOKEA MESSAGES NA KUJIBU AUTOMATIC
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]) {

      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const msg_body = message.text.body;

      console.log(`Message kutoka ${from}: ${msg_body}`);

      // AMUA JIBU LA KURUDISHA
      let reply_text = "MAMBO MKUU 🔥 Karibu sana Kapela Bot. Nisaidie nini leo?";

      if (msg_body.toLowerCase().includes('habari') || msg_body.toLowerCase().includes('mambo')) {
        reply_text = "MAMBO MKUU 🔥 Karibu sana. Nisaidie nini leo?";
      }
      if (msg_body.toLowerCase().includes('bei')) {
        reply_text = "Bei za bidhaa zetu:\n1. Bidhaa A - Tsh 10,000\n2. Bidhaa B - Tsh 20,000\n3. Bidhaa C - Tsh 30,000\n\nTuma 'Agiza' kuanza ku-order";
      }
      if (msg_body.toLowerCase().includes('delete my data')) {
        reply_text = "Kufuta data yako:\n1. Fungua: https://kapela-bot-live.onrender.com/delete-data\n2. Fuata maelekezo\n\nData yako itafutwa ndani ya masaa 24";
      }
      if (msg_body.toLowerCase().includes('saa') || msg_body.toLowerCase().includes('fungua')) {
        reply_text = "Tunafungua Jumatatu - Jumamosi\nSaa 2 Asubuhi - 12 Jioni\nJumapili: Tupo likizo";
      }

      // TUMA JIBU KWA WHATSAPP API
      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply_text }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Jibu limetumwa kwa:', from);
