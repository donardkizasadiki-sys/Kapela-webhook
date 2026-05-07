const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// VERIFY WEBHOOK
app.get('/webhook', (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (token === verify_token) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// POKEA MESSAGE NA JIBU
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach(async (entry) => {
      const changes = entry.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (message && message.text) {
        const from = message.from; // Namba ya aliyetuma
        const msg_body = message.text.body.toLowerCase();

        let reply_text = "MAMBO MKUU ⚔️\nKAPELA V500 IKO LIVE 💰\n\nNitumie: \n1. Mambo\n2. Help\n3. V500";

        if (msg_body.includes('mambo') || msg_body.includes('hello')) {
          reply_text = "MAMBO MKUU 🔥\nMimi ni Kapela Bot V500\nNiko tayari kwa kazi\nTuma HELP kuona menu";
        }

        if (msg_body.includes('help')) {
          reply_text = "MENU YA KAPELA V500 ⚔️\n\n1. Mambo - Salamu\n2. V500 - Status ya Bot\n3. Author - Nani kaniunda\n\nTuma neno lolote";
        }

        if (msg_body.includes('v500') || msg_body.includes('status')) {
          reply_text = "STATUS: ONLINE ✅\nVERSION: V500\nSERVER: Render\nAUTHOR: Kapela Wilondja 💰";
        }

        if (msg_body.includes('author')) {
          reply_text = "Nimeundwa na Kapela Wilondja ⚔️\nWhatsApp Bot V500\nDeploy: Render.com\nDate: 7 May 2026";
        }

        // TUMA JIBU WHATSAPP
        await axios({
          method: 'POST',
          url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          },
          data: {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: reply_text }
          }
        });
      }
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get('/', (req, res) => {
  res.json({status: "Kapela Bot V500 Online", author: "Kapela Wilondja"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));
