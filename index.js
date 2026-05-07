const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook - Kupokea Messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;
      
      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text.toLowerCase();
        await handleMessage(sender_psid, userMessage);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Kapela Wilondja - MAONGEZI YA MTAANI TU
async function handleMessage(sender_psid, msg) {
  let response = "";

  if (msg.includes('habari') || msg.includes('mambo') || msg.includes('vipi') || msg.includes('niaje')) {
    const replies = [
      "Poa sana mkuu. Wewe je, umeamkaje?",
      "Niko salama kabisa. Dunia inakwendaje huko?",
      "Freshi mkuu. Leo umeamua kunikumbuka 😂",
      "Mambo poa. Wewe vipi, umelala vizuri?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  else if (msg.includes('soka') || msg.includes('mpira') || msg.includes('simba') || msg.includes('yanga') || msg.includes('arsenal')) {
    const replies = [
      "Aisee mkuu soka balaa 😂 Juzi Simba alikula kichapo. Wewe team gani?",
      "Mpira huu unaniumiza kichwa. Yanga wameanza visasi tena. Unasapoti wapi?",
      "EPL imechacha mkuu. Arsenal wanapwaya. Wewe unaona nani atabeba kikombe?",
      "Soka bila stress haiwezekani 😅 Leo kuna game? Nambie nikuje tuangalie pamoja"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  else if (msg.includes('njaa') || msg.includes('chakula') || msg.includes('kula')) {
    const replies = [
      "Aisee usiniambie njaa 😂 Mimi naota wali nyama. Wewe umekula?",
      "Chakula ni uhai mkuu. Leo nakula chips kuku. Wewe mpango gani?",
      "Njaa inanisumbua pia. Tuchangie order? 😂",
      "Kwenye kula mimi sichelewi. Uko wapi? Tukutane sehemu"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  else if (msg.includes('mvua') || msg.includes('jua') || msg.includes('baridi')) {
    const replies = [
      "Huku kunanyesha kama balaa mkuu ☔ Umejifunika?",
      "Jua limezidi leo. Nimeyeyuka kabisa. Huko vipi?",
      "Baridi inaninyima usingizi 😂 Umevaa sweta?",
      "Hali ya hewa inacheza na akili za watu. Leo joto, kesho mvua"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  else if (msg.includes('weekend') || msg.includes('mapumziko') || msg.includes('party')) {
    const replies = [
      "Weekend ndio imefika mkuu! Mpango gani? Mimi nipo free kabisa 😂",
      "Mapumziko yanaitwa. Tupeleke wapi? Nimechoka kulala nyumbani",
      "Party gani leo? Nipe location nifike chap",
      "Burudani lazima mkuu. Maisha ni mafupi. Unataka tuende wapi?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  else if (msg.includes('nimechoka') || msg.includes('stress') || msg.includes('shida') || msg.includes('kazi')) {
    const replies = [
      "Pole sana mkuu 😔 Maisha ndivyo yalivyo. Pumzika kidogo. Niko hapa kukusikiliza",
      "Stress achana nayo. Njoo tucheke kidogo. Unataka nikupe story?",
      "Kazi inachosha sana. Jipe break mkuu. Ustawi wa akili muhimu",
      "Shida zipite tu. Kesho ni siku nyingine. Usijali sana"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  else if (msg.includes('asante') || msg.includes('shukran') || msg.includes('thanks')) {
    response = "Karibu sana mkuu 😊 Tupo pamoja. Usisite kuniandikia tena";
  }
  else if (msg.includes('bye') || msg.includes('lala') || msg.includes('usiku mwema')) {
    response = "Usiku mwema mkuu. Lala salama. Tutaonana kesho 😴";
  }
  else if (msg.includes('poa') || msg.includes('safi') || msg.includes('freshi') || msg.includes('sawa')) {
    response = "Safi sana 😂 Tuko pamoja. Endelea kufurahia siku yako";
  }
  else {
    const replies = [
      "Aisee mkuu 😂 Nimekusikia. Nambie tena kidogo nielewe vizuri",
      "Duh umenichanganya kiasi. Ongea lugha ya mtaani nielewe chap",
      "Sijasoma vizuri hapo. Rudia tena mkuu",
      "Nipo hapa mkuu. Tuongee tu kama marafiki. Unasemaje?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  
  await callSendAPI(sender_psid, response);
}

// Tuma Jibu Messenger
async function callSendAPI(sender_psid, response) {
  const request_body = {
    recipient: { id: sender_psid },
    message: { text: response }
  };

  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

app.listen(PORT, () => console.log(`Kapela Mtaani yuko Live - Port ${PORT}`));
