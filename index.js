const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'kapela2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// 1. HII NDIO META ANAITAJI KWA VERIFY WEBHOOK
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

// 2. HII NI YA KUPOKEA MESSAGES NA KURUDISHA JIBU AUTOMATIC
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
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// 3. DATA DELETION PAGE - KWA APP REVIEW
app.get('/delete-data', (req, res) => {
  res.send(`
    <html>
      <head><title>Delete Data - Kapela Bot</title></head>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Kapela Bot - Data Deletion Request</h1>
        <p>Wilondja Kapela Kapela respects your privacy.</p>
        <h3>How to delete your data:</h3>
        <p>1. Send "DELETE MY DATA" to our WhatsApp number</p>
        <p>2. Or email: wilondja@example.com with subject "DELETE MY DATA"</p>
        <p>3. We will delete all your data within 24 hours</p>
        <p>Business: Wilondja Kapela Kapela, Dar es Salaam, Tanzania</p>
      </body>
    </html>
  `);
});

// 4. HOME PAGE
app.get('/', (req, res) => {
  res.send('KAPELA BOT LIVE - WhatsApp Business API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
