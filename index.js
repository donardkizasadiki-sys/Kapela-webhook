const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "kapela123";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// 1. Kwa ajili ya ku-verify na Meta
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// 2. Kwa ajili ya kupokea DM na kujibu
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

// 3. Function ya kujibu message
function handleMessage(sender_psid, received_message) {
  let response;
  
  if (received_message.text) {
    response = {
      "text": `Umesema: "${received_message.text}". Nimepokea mkuu! 🔥`
    }
  }
  
  callSendAPI(sender_psid, response);
}

// 4. Function ya kutuma jibu kwa Facebook
function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": { "id": sender_psid },
    "message": response
  }

  axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
.catch((err) => {
    console.error("Error:", err.response.data);
  });
}

app.get('/', (req, res) => {
  res.send('Kapela Webhook Iko Live');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
