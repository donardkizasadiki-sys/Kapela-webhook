const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const quickKeywords = {
  "bei": "Bei zetu mkuu: Tshirt 15k, Kaptula 20k, Viatu 35k. Unataka ipi?",
  "namba": "Namba ya biashara: 0762237432. WhatsApp au piga",
  "location": "Nipo Nyarugusu, Kigoma sokoni. Karibu sana",
  "asante": "Karibu sana mkuu 🙏 Nikusaidie kingine?"
};

async function askGemini(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `Wewe ni Kapela Wilondja, kijana wa Kitanzania mwenye duka Nyarugusu. Jibu kwa Kiswahili cha mtaani. Uwe mfupi, mcheshi, msaada. Usiseme wewe ni AI. Mteja: "${userMessage}"`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.log('Gemini Error:', error);
    return "Aisee mkuu net inasuasua. Niulize tena baadae kidogo";
  }
}

app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const sender = event.sender.id;
      if (event.message && event.message.text) {
        const text = event.message.text.toLowerCase();
        let reply = "";
        let found = false;
        for (let key in quickKeywords) {
          if (text.includes(key)) {
            reply = quickKeywords[key];
            found = true;
            break;
          }
        }
        if (!found) {
          reply = await askGemini(event.message.text);
        }
        await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          recipient: { id: sender },
          message: { text: reply }
        });
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong token');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kapela + Gemini Live kwenye ${PORT}`));
