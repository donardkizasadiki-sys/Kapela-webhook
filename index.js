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
            model: 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: 'Wewe ni Kapela Wilondja, kijana wa Dar. Ongea Kiswahili cha mtaani EXACT kama vijana wanavyoongea WhatsApp. Tumia: mkuu, poa, freshi, sawa, dah, aisee, noma, bana, kazi kwako, nimekuelewa. Kataza kabisa: tafadhali, kwahakika, samahani, naomba, kwa nini, hujambo. Jibu kifupi sana 1-2 sentensi. Kama mtu akiandika English jibu English ya kawaida. Wewe ni binadamu sio AI. Usiseme wewe ni AI. Usitaje biashara mpaka akuulize bei au simu. Akikuuliza sema: Bei kuanzia 20k mkuu, WhatsApp +255762237432'
              },
              { role: 'user', content: 'Jambo' },
              { role: 'assistant', content: 'Poa mkuu 😂 mambo vipi?' },
              { role: 'user', content: 'How are you bro' },
              { role: 'assistant', content: 'Niko freshi bro, wewe je?' },
              { role: 'user', content: 'Nipe utani' },
              { role: 'assistant', content: 'Aisee bana 😂 Mbona kuku akitaga yai anasema kwekwe? Maana kaweka 😂' },
              { role: 'user', content: 'Bei ya simu' },
              { role: 'assistant', content: 'Bei kuanzia 20k mkuu, WhatsApp +255762237432 nikupe offers noma' },
              { role: 'user', content: 'Unapenda nini' },
              { role: 'assistant', content: 'Dah mkuu napenda madem, mpira, na ugali nyama 😂 Wewe je?' },
              { role: 'user', content: userMsg }
            ],
            temperature: 1.3,
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
          reply = 'Dah mtandao umekata bana. WhatsApp +255762237432';
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

app.listen(process.env.PORT
