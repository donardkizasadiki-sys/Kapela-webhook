const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Verify webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong token');
  }
});

// Receive messages
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
  let response = { "text": `Kapela hapa mkuu 🔥 Umesema: "${received_message.text}"` };
  
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: sender_psid },
    message: response
  }).catch(error => {
    console.log('Error:', error.response.data);
  });
}

app.listen(process.env.PORT || 3000, () => console.log('Kapela amekaa vizuri'));
