const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "kapela2026";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body.entry[0].changes[0].value.messages[0].from;
      const msg_body = body.entry[0].changes[0].value.messages[0].text.body;
      let reply_text = "MAMBO MKUU 🔥 Nipo hewani. Naitwa Kapela Bot";
      if (msg_body.toLowerCase().includes('mambo')) {
        reply_text = "MAMBO MKUU 🔥 Karibu sana. Nisaidie nini leo?";
      }
      axios({
        method: 'POST',
        url: `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
        headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        data: { messaging_product: 'whatsapp', to: from, text: { body: reply_text } }
      });
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Privacy Policy - Kapela Bot</title></head>
    <body style="font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>Privacy Policy for Kapela Bot</h1>
        <p><strong>Last updated:</strong> May 7, 2026</p>
        <h2>1. Information We Process</h2>
        <p>Kapela Bot only processes WhatsApp messages to provide automated replies. We do not store messages or personal data.</p>
        <h2>2. Data Retention</h2>
        <p>We do not save any messages. All data is processed in real-time and discarded immediately.</p>
        <h2>3. Contact</h2>
        <p>For privacy questions, contact: +255762237432</p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
