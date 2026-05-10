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
   a) Tuma "DELETE MY DATA" kwa WhatsApp number yetu
   b) Au email: wilondja@example.com na subject "DELETE MY DATA"
   Tutafuta data yako yote ndani ya masaa 24.

5. MAWASILIANO
Business: Wilondja Kapela Kapela
Address: Dar es Salaam, Tanzania
Email: wilondja@example.com
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
        reply_text = `Kufuta data yako:\n\n1. Email: wilondja@example.com\n2. Link: https://kapela-bot-live.onrender.com/delete-data\n\nTutafuta ndani ya masaa 24 ✅`;
      } else if (msg_body.includes('bei') || msg_body.includes('price') || msg_body.includes('gharama')) {
        reply_text = `BEI ZA KAPELA BOT 🔥\n\n1. Package Ndogo: TZS 50,000/mwezi\n2. Package Kati: TZS 100,000/mwezi\n3. Package Kubwa: TZS 200,000/mwezi\n\nPiga 0762 237 432 kupata ofa 🔥`;
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
<head><title>Delete Data - Kapela Bot</title></head>
<body style="font-family:Arial;padding:40px;max-width:600px;margin:auto;">
  <h1>Data Deletion Request - Kapela Bot</h1>
  <p>Wilondja Kapela Kapela respects your privacy.</p>
  <h2>Jinsi ya Kufuta Data Yako:</h2>
  <p>1. Tuma "DELETE MY DATA" kwa WhatsApp number yetu</p>
  <p>2. Au email: <strong>kapelawilondja.com</strong> na subject "DELETE MY DATA"</p>
  <p>Tutafuta data yako yote ndani ya masaa 24.</p>
  <hr>
  <p><strong>Business:</strong> Wilondja Kapela Kapela<br>
  <strong>Location:</strong> Dar es Salaam, Tanzania<br>
  <strong>Email:</strong> kapelawilondja@gmail.com</p>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Live'));
