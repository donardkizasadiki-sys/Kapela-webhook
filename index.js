const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "kapela2026";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// 1. WEBHOOK VERIFICATION - USIGUSE ❌
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

// 2. KUPOKEA MESSAGE + KUJIBU - USIGUSE ❌
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

      console.log(`Message from ${from}: ${msg_body}`);

      // JIBU LA BOT
      let reply_text = "MAMBO MKUU 🔥 Nipo hewani. Naitwa Kapela Bot";

      if (msg_body.toLowerCase().includes('mambo')) {
        reply_text = "MAMBO MKUU 🔥 Karibu sana. Nisaidie nini leo?";
      } else if (msg_body.toLowerCase().includes('bei')) {
        reply_text = "BEI ZETU MK
