const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json());

app.get('/', (req, res) => res.send('OK'));

const TOKEN = process.env.PAGE_ACCESS_TOKEN;
const AI_KEY = process.env.AI_TOKEN;

app.post('/webhook', async (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      let msg = entry.messaging[0];
      let id = msg.sender.id;
      if (msg.message && msg.message.text) {
        let userMsg = msg.message.text;
        let reply = 'Poa mkuu';

        try {
          let ai = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: 'You are Kapela, a 24-year-old guy from Dar es Salaam. Reply in Swahili slang or English. Be human, funny, short. Only mention business if asked about phone or price. Then say: Bei kuanzia 20k, WhatsApp +255762237432'
              },
              { role: 'user', content: userMsg }
            ],
            temperature: 0.9,
            max_tokens: 60
          }, {
            headers: {
              'Authorization': 'Bearer ' + AI_KEY,
              'Content-Type': 'application/json'
            }
          });

          reply = ai.data.choices[0].message.content.trim();
        } catch(e) {
          console.log(e.response?.data || e.message);
          reply = 'Dah mtandao bana. WhatsApp +255762237432';
        }

        await axios.post('https://graph.facebook.com/v18.0/me/messages?access_token=' + TOKEN, {
          recipient: { id: id },
          message: { text: reply }
        }).catch(e => console.log(e.response?.data));
      }
    }
    res.sendStatus(200);
  } else res.sendStatus(404);
});

app.get('/webhook', (req, res) => {
  let VERIFY = 'kapela123';
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token === VERIFY) res.status(200).send(challenge);
  else res.sendStatus(403);
});

app.listen(process.env.PORT || 3000);
