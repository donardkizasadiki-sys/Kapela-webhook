const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// KAPELA BOT V500
const KapelaV500 = {
  version: "5.0.0",
  botName: "Kapela Bot",
  author: "Kapela Wilondja",

  intents: {
    rasmi_chatbot: {
      keywords: ["habari yako","unaendeleaje","niko poa","asante sana","karibu sana","wewe pia","baadaye"],
      responses: { greeting: "Habari yako! Mimi ni Kapela Bot. Niko hapa kukusaidia. Unaendeleaje leo?" }
    },
    kifamilia: {
      keywords: ["hodi nyumbani","karibu mama","umechelewa","usiku mwema","lala salama"],
      responses: { greeting: "Hodi nyumbani! Nimerudi. Karibu Kapela Bot." }
    },
    kimtaani: {
      keywords: ["mambo vipi","uko poa","poa sana","mkuu","demu","mkwanja","bize","msoto","bata"],
      responses: { greeting: "Mambo vipi, mkuu? Uko poa? Mimi Kapela Bot nipo hapa." }
    }
  },

  detectIntent: function(message) {
    if (!message) return "default";
    const msg = message.toLowerCase();
    if (this.intents.kimtaani.keywords.some(kw => msg.includes(kw))) return "kimtaani";
    if (this.intents.kifamilia.keywords.some(kw => msg.includes(kw))) return "kifamilia";
    if (this.intents.rasmi_chatbot.keywords.some(kw => msg.includes(kw))) return "rasmi_chatbot";
    return "rasmi_chatbot";
  },

  handleMessage: function(userMessage) {
    const intent = this.detectIntent(userMessage);
    const responses = this.intents[intent]?.responses || this.intents.rasmi_chatbot.responses;
    return responses.greeting || "Sawa mkuu, nimekupata. Niko tayari kukusaidia.";
  }
};

// TOKENS - WEKA ZAKO HAPA
const VERIFY_TOKEN = "kapela_v500_secret";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // Weka Render Env
const MESSENGER_TOKEN = process.env.MESSENGER_TOKEN; // Weka Render Env

// 1. VERIFY WEBHOOK - WHATSAPP & MESSENGER
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

// 2. RECEIVE MESSAGES - WHATSAPP & MESSENGER
app.post('/webhook', (req, res) => {
  const body = req.body;

  // WHATSAPP
  if (body.object === 'whatsapp_business_account') {
    body.entry.forEach(entry => {
      const changes = entry.changes[0];
      const value = changes.value;
      const messages = value.messages;

      if (messages) {
        messages.forEach(async (message) => {
          const from = message.from;
          const msgBody = message.text.body;
          const reply = KapelaV500.handleMessage(msgBody);

          // Tuma jibu WhatsApp
          await sendWhatsAppMessage(from, reply);
        });
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  }

  // MESSENGER
  else if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        const msgBody = webhook_event.message.text;
        const reply = KapelaV500.handleMessage(msgBody);

        // Tuma jibu Messenger
        sendMessengerMessage(sender_psid, reply);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  }

  else {
    res.sendStatus(404);
  }
});

// TUMA WHATSAPP
async function sendWhatsAppMessage(to, text) {
  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: "whatsapp",
        to: to,
        text: { body: text }
      }
    });
    console.log('WhatsApp message sent');
  } catch (error) {
    console.log('WhatsApp Error:', error.response?.data);
  }
}

// TUMA MESSENGER
function sendMessengerMessage(sender_psid, text) {
  const request_body = {
    recipient: { id: sender_psid },
    message: { text: text }
  };

  axios({
    method: 'POST',
    url: `https://graph.facebook.com/v18.0/me/messages?access_token=${MESSENGER_TOKEN}`,
    data: request_body
  }).then(() => {
    console.log('Messenger message sent');
  }).catch((error) => {
    console.log('Messenger Error:', error.response?.data);
  });
}

app.get('/', (req, res) => {
  res.json({ status: "Kapela Bot V500 Online", author: "Kapela Wilondja" });
});

app.listen(PORT, () => {
  console.log(`Kapela Bot V500 running on port ${PORT}`);
});
