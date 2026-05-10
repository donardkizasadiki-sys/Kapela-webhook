const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

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
   a) Tuma "DELETE MY DATA" kwa WhatsApp number yetu +255762237432
   b) Au email: Kapelawilondja@gmail.com na subject "DELETE MY DATA"
   Tutafuta data yako yote ndani ya masaa 24.

5. MAWASILIANO
Business: Wilondja Kapela Kapela
Address: Kigoma, Tanzania
Phone: +255762237432
Email: Kapelawilondja@gmail.com
Last Updated: May 9, 2026`);
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    if (req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = req.body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const msg_body = message.text?.body?.toLowerCase() || '';
      console.log(`Message kutoka ${from}: ${msg_body}`);

      let reply_text = "MAMBO MKUU 🔥 Karibu sana Kapela Bot. Nisaidie nini leo?";

      if (msg_body.includes('delete my data') || msg_body.includes('futa data')) {
        reply_text = `Kufuta data yako:\n\n1. Email: Kapelawilondja@gmail.com\n2. WhatsApp: +255762237432\n3. Link: https://kapela-bot-live.onrender.com/delete-data\n\nTutafuta ndani ya masaa 24 ✅`;
      } else if (msg_body.includes('bei') || msg_body.includes('price') || msg_body.includes('gharama')) {
        reply_text = `BEI ZA KAPELA BOT 🔥\n\n1. Package Ndogo: TZS 50,000/mwezi\n2. Package Kati: TZS 100,000/mwezi\n3. Package Kubwa: TZS 200,000/mwezi\n\nPiga +255762237432 kupata ofa 🔥`;
      } else if (msg_body.includes('mambo') || msg_body.includes('habari') || msg_body.includes('vipi')) {
        reply_text = "POA MKUU 🔥 Niko poa. Nikusaidie nini leo?";
      }

      await axios.post(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply_text }
      }, {
        headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}` }
      });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.sendStatus(200);
  }
});

app.get('/delete-data', (req, res) => {
  res.send(`<html>
