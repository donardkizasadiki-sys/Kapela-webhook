const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// KAPELA BOT V500 - DIALOGUE MASTER
const KapelaV500 = {
  version: "5.0.0",
  botName: "Kapela Bot",
  author: "Kapela Wilondja",

  patterns: {
    // 1. RASMI - CHATBOT YA KIRAIFIKI
    rasmi: {
      keywords: ["habari", "unaendeleaje", "niko poa", "asante", "karibu", "baadaye", "swali", "salama", "wewe je"],
      flows: [
        {
          triggers: ["habari", "unaendeleaje", "mambo", "vipi"],
          replies: [
            "Habari yako! Niko hapa kukusaidia. Unaendeleaje leo?",
            "Salama mkuu! Nipo tayari kukusaidia. Vipi wewe?"
          ]
        },
        {
          triggers: ["salama", "poa", "sijambo", "wewe je", "asante"],
          replies: [
            "Mimi niko poa tu, niko tayari kukusaidia. Una swali lolote au kuna kitu ningekufanyia?",
            "Nipo salama kabisa. Naweza kukusaidia nini leo mkuu?"
          ]
        },
        {
          triggers: ["swali", "nina swali", "naomba", "saidie", "mada"],
          replies: [
            "Sawa, nimekupata. Niambie swali lako kuhusu nini?",
            "Poa, niko hapa. Tupe mada unayotaka kujua zaidi."
          ]
        },
        {
          triggers: ["asante sana", "umenisaidia", "shukran"],
          replies: [
            "Karibu sana! Ni furaha yangu kukusaidia. Kama utahitaji msaada mwingine, usisite kuniuliza. Kuwa na siku njema!",
            "Shukran pia mkuu. Niko hapa wakati wowote. Baadaye! Wewe pia!"
          ]
        }
      ]
    },

    // 2. KIFAMILIA - HESHIMA NA UPENDO
    kifamilia: {
      keywords: ["hodi", "karibu mama", "umechelewa", "usiku mwema", "lala salama", "baba", "mama", "kazini", "shule"],
      flows: [
        {
          triggers: ["hodi", "nimerudi"],
          replies: [
            "Hodi nyumbani! Nimerudi. Karibu Mama! Umechelewa leo kidogo. Habari za kazini?",
            "Karibu nyumbani. Leo umechelewa sana. Kila la heri?"
          ]
        },
        {
          triggers: ["salama mwanangu", "kazini", "foleni", "asante mungu"],
          replies: [
            "Salama mwanangu, asante Mungu. Leo kulikuwa na foleni kubwa. Umejifunzaje?",
            "Nipo salama. Wewe umemaliza kazi za shule?"
          ]
        },
        {
          triggers: ["nimejifunza", "kazi za shule", "nimemaliza", "vizuri"],
          replies: [
            "Nzuri sana! Ndiyo hivyo, uwe unajitahidi kila wakati. Baba amerudi?",
            "Hongera sana mwanangu. Baba yuko wapi?"
          ]
        },
        {
          triggers: ["baba amerudi", "sebuleni", "habari"],
          replies: [
            "Sawa. Nitaenda kubadilisha nguo halafu nikaongee naye. Na wewe usisahau kunywa maziwa kabla ya kulala, sawa?",
            "Poa. Nitampitia huko. Wewe maliza homework zako."
          ]
        },
        {
          triggers: ["usiku mwema", "lala salama", "kulala"],
          replies: [
            "Usiku mwema mwanangu, lala salama. Usisahau kunywa maziwa kabla ya kulala, sawa?",
            "Lala unono. Tutaonana kesho asubuhi."
          ]
        }
      ]
    },

    // 3. KIMTAANI - LUGHA YA WATU
    kimtaani: {
      keywords: ["mambo vipi", "uko poa", "msoto", "mkwanja", "bize", "demu", "kariakoo", "buguruni", "bata", "chidi", "juma", "mzee"],
      flows: [
        {
          triggers: ["mambo vipi", "uko poa", "vipi mkuu", "poa sana"],
          replies: [
            "Mambo vipi, Chidi? Uko poa? Nipo hapa nashangaa tu maisha. Wewe je?",
            "Poa sana, Juma! Nipo tu na msoto wangu, kama kawaida! Hujapotea sana siku hizi?"
          ]
        },
        {
          triggers: ["nasaka mkwanja", "bize", "nipo tu", "maisha", "sikupotea"],
          replies: [
            "Nipo tu, mzee. Nasaka mkwanja hapa na pale. Sikupotea, nilikuwa bize kidogo. Vipi, umeona yule demu mpya kwenye duka la Kariakoo?",
            "Maisha yanapambana mkuu. Wewe bize zako zikoje? Umemuona yule wa Kariakoo?"
          ]
        },
        {
          triggers: ["demu", "kariakoo", "mrembo", "buguruni"],
          replies: [
            "(Anacheka) Wewe Chidi, hutabadilika! Nimemuona, mrembo kweli. Lakini wewe umesahau yule wa kule Buguruni?",
            "Aisee demu wenu wa Kariakoo anakula bata mwingi. Huyo wa Buguruni vipi? Bado yupo?"
          ]
        },
        {
          triggers: ["nenda", "tukutane", "kesho", "meseji", "simu"],
          replies: [
            "Sawa mzee, nenda zako! Ukinipigia simu, usisahau kunitumia meseji! Tukutane kesho!",
            "Poa mkuu. Twende tukasake mkwanja. Usisahau kuni-text! Bata tuone kesho."
          ]
        }
      ]
    }
  },

  detectStyle: function(message) {
    const msg = message.toLowerCase();
    if (this.patterns.kimtaani.keywords.some(kw => msg.includes(kw))) return "kimtaani";
    if (this.patterns.kifamilia.keywords.some(kw => msg.includes(kw))) return "kifamilia";
    if (this.patterns.rasmi.keywords.some(kw => msg.includes(kw))) return "rasmi";
    return "rasmi";
  },

  getReply: function(message) {
    const style = this.detectStyle(message);
    const pattern = this.patterns[style];
    const msg = message.toLowerCase();

    for (let flow of pattern.flows) {
      if (flow.triggers.some(trigger => msg.includes(trigger))) {
        return flow.replies[Math.floor(Math.random() * flow.replies.length)];
      }
    }

    const defaults = [
      "Sawa mkuu, nimekupata. Endelea kunipa muktadha zaidi.",
      "Niko hapa mkuu. Niambie zaidi nisaidieje?",
      "Kapela Bot nipo. Semaje sasa?"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  },

  handleMessage: function(userMessage) {
    return this.getReply(userMessage);
  }
};

// TOKENS
const VERIFY_TOKEN = "kapela_v500_secret";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const MESSENGER_TOKEN = process.env.MESSENGER_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// VERIFY WEBHOOK
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

// RECEIVE MESSAGES - MESSENGER + WHATSAPP
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
      url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
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
    console.log('WhatsApp sent');
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
    console.log('Messenger sent');
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
