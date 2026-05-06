const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// UTAMBULISHO WA KAPELA
const KAPELA_INFO = {
  jina: "Kapela Wilondja",
  mahali: "Nyarugusu",
  simu: "+255762237432",
  kazi: "Nawasaidia watu na maswali yao"
};

app.get('/', (req, res) => {
  res.send('Kapela Bot Iko Live 🔥');
});

app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(sender_psid, received_message) {
  let userText = received_message.text.toLowerCase();
  let response;

  // 1. SALAMU ZOTE
  if (userText.includes('habari') || userText.includes('mambo') || userText.includes('vipi') || userText.includes('shikamoo') || userText.includes('hujambo')) {
    response = { "text": "Salama mkuu! Mimi ni Kapela. Habari yako? Karibu tuchati 😊" };
  }
  // 2. ANAJIULIZA WEWE NANI
  else if (userText.includes('wewe nani') || userText.includes('jina lako') || userText.includes('unaitwa')) {
    response = { "text": `Mimi ni ${KAPELA_INFO.jina}. Nipo ${KAPELA_INFO.mahali}. ${KAPELA_INFO.kazi}. Na wewe?` };
  }
  // 3. ANAULIZA NAMBARI/MAHALI
  else if (userText.includes('namba') || userText.includes('simu') || userText.includes('mawasiliano') || userText.includes('wapi')) {
    response = { "text": `Nipo ${KAPELA_INFO.mahali} mkuu. Namba yangu: ${KAPELA_INFO.simu}. Tuwasiliane.` };
  }
  // 4. MAONGEZI YA KAWAIDA
  else if (userText.includes('uko poa') || userText.includes('unaendeleaje')) {
    response = { "text": "Nipo poa sana mkuu! Shukrani kwa kuuliza. Wewe je, siku inaendaje?" };
  }
  else if (userText.includes('asante') || userText.includes('shukrani')) {
    response = { "text": "Karibu sana mkuu 🙏 Furaha yangu kukusaidia." };
  }
  else if (userText.includes('umri') || userText.includes('miaka')) {
    response = { "text": "Hahaha mkuu, mimi ni bot. Sina miaka ila nina hekima za miaka 100 😎" };
  }
  else if (userText.includes('unapenda') || userText.includes('chakula')) {
    response = { "text": "Mimi napenda ugali na samaki mkuu 🐟 Wewe je?" };
  }
  // 5. JIBU LOLOTE LINGINE - KAMA MTU KAWAIDA
  else {
    let majibuRandom = [
      `Aisee mkuu, kuhusu "${received_message.text}" - ngoja nifikirie 🤔 Unaweza kueleza zaidi?`,
      `Hahaha "${received_message.text}" 😂 Umechesha. Nieleze zaidi mkuu.`,
      `Mkuu "${received_message.text}" ni swali zuri. Mimi ni ${KAPELA_INFO.jina} kutoka ${KAPELA_INFO.mahali}. Unataka tuongee kuhusu nini?`,
      `Duh, "${received_message.text}" 😅 Sijaelewa vizuri. Mimi ni Kapela tu, sio mchawi. Unaweza kueleza kwa njia nyingine?`
    ];
    response = { "text": majibuRandom[Math.floor(Math.random() * majibuRandom.length)] };
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": { "id": sender_psid },
    "message": response
  };

  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
  .then(() => console.log('Message sent!'))
  .catch((err) => console.error('Unable to send message:' + err));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));
