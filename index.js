const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.post('/webhook', (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message && webhook_event.message.text) {
        let userMessage = webhook_event.message.text.toLowerCase();
        let response;
        if (userMessage.includes('vp hali') || userMessage.includes('mambo') || userMessage.includes('habari')) {
          response = { "text": "Salama vp hali yako uko?\nKaribu nikuhudumie mkuu 🔥" };
        } else if (userMessage.includes('niaje') || userMessage.includes('ukoje')) {
          response = { "text": "Poa sana mkuu, wewe je? Unahitaji huduma gani leo?" };
        } else if (userMessage.includes('kazi yako') || userMessage.includes('huduma')) {
          response = { "text": "Mimi ni Content Creator na pia na manage wasanii. Kama unahitaji huduma hiyo tafadhali niambie" };
        } else if (userMessage.includes('unapatikana wapi') || userMessage.includes('location')) {
          response = { "text": "Napatikana Nyarugusu\nKwa mawasiliano zaidi: WhatsApp +255762237432" };
        } else if (userMessage.includes('namba') || userMessage.includes('whatsapp')) {
          response = { "text": "Namba yangu ya WhatsApp: +255762237432\nSave ukinikuta online tuongee zaidi" };
        } else if (userMessage.includes('asante') || userMessage.includes('shukran')) {
          response = { "text": "Karibu sana mkuu 🙏\nNipo hapa kukuhudumia wakati wowote" };
        } else {
          response = { "text": `Nimekupata mkuu.\nTuma "huduma" uone ninachofanya, au "namba" upate WhatsApp` };
        }
        callSendAPI(sender_psid, response);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  let VERIFY_TOKEN = "kapela123";
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

function callSendAPI(sender_psid, response) {
  let request_body = { "recipient": { "id": sender_psid }, "message": response };
  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
 .catch(err => console.error("Error:", err.response? err.response.data : err));
}

app.listen(process.env.PORT || 3000, () => console.log('Webhook is listening'));
