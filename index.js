const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const users = {};

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

app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;
      if (webhook_event.message && webhook_event.message.text) {
        await handleMessage(sender_psid, webhook_event.message.text);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// KAPELA V100.1 - SENTENCE GENERATOR
async function handleMessage(sender_psid, userMsg) {
  if (!users[sender_psid]) {
    users[sender_psid] = {
      name: null,
      history: [],
      topic: 'start',
      usedWords: new Set()
    };
  }
  
  const user = users[sender_psid];
  user.history.push(userMsg);
  if (user.history.length > 50) user.history.shift();
  
  await sendTyping(sender_psid, true);
  await new Promise(r => setTimeout(r, 700));
  
  const response = generateHumanReply(userMsg, user);
  
  user.history.push(response);
  await sendReply(sender_psid, response);
  await sendTyping(sender_psid, false);
}

function generateHumanReply(msg, user) {
  const m = msg.toLowerCase();
  const name = user.name || 'mkuu';
  
  // JINA
  const nameMatch = msg.match(/(jina langu ni|naitwa|i'm|my name is)\s+(\w+)/i);
  if (nameMatch) {
    user.name = nameMatch[2];
    return `${user.name}? Sawa, nimehifadhi. ${randomStart()} Vipi unapenda watu wakuite?`;
  }
  
  // KULALAMIKA KUHUSU LOOP
  if (m.includes('rudia') || m.includes('unarudia')) {
    return `Dah ${name} 😂 umenishika. Nimekuwa robot sana. Ngoja nianze upya bila script. Swali: Kama ungekuwa mnyama, ungekuwa mnyama gani na kwa nini?`;
  }
  
  // GENERATOR: Changanya maneno kuleta sentensi mpya kila mara
  const starters = ["Nimesikia", "Okay", "Duh", "Aisee", "Hmm", "Sawa", "Freshi"];
  const fillers = ["kwamba", "eti", "kumbe", "so", "basically"];
  const reactions = ["nimecheka", "umenishtua", "nimejifunza kitu", "umenifanya nifikiri", "hii ni deep"];
  const questions = [
    "Unasemaje kuhusu hili?",
    "Why do you think hivyo?",
    "Umejifunza wapi hii?",
    "Kama ningekuwa wewe ningefanya nini?",
    "Unataka tubadili topic au tuendelee?",
    "Give me your hottest take",
    "Rating from 1-10?"
  ];
  
  // Kama ni salamu
  if (m.match(/^(hi|hello|mambo|niaje|vipi|unaendeleaje)$/)) {
    user.topic = 'greeting';
    return `${randomPick(['Mambo', 'Poa', 'Freshi', 'Nipo'])} ${name} 😊 ${randomPick(['Siku inaendaje?', 'Umeamka na mood gani leo?', 'Coffee imeshaingia?', 'Tuanzie wapi leo?'])}`;
  }
  
  // Kama ni fun
  if (m.match(/\b(fun|bored|cheza|utani|game)\b/)) {
    user.topic = 'fun';
    return `${randomPick(['Bet', 'Sawa', 'Game on', 'Twende'])}! ${randomPick(['Tatua hili:', 'Jibu haraka:', 'Chagua:'])} ${randomPick(['Unge-date robot au zombie?', 'Pesa vs Amani - chagua 1', 'Kama maisha ni movie, title yake ni?', 'Kitu gani hukuwahi mwambia mtu?'])}`;
  }
  
  // Kama ni short reply
  if (msg.length < 10) {
    user.topic = 'short';
    return `${randomPick(starters)} ${name} 😂 ${randomPick(['Una maneno machache leo', 'Mbona mchache wa maneno', 'Type zaidi mzee'])}. ${randomPick(questions)}`;
  }
  
  // GENERIC GENERATOR - HAKUNA TEMPLATES
  user.topic = 'general';
  const starter = randomPick(starters);
  const filler = randomPick(fillers);
  const reaction = randomPick(reactions);
  const question = randomPick(questions);
  
  return `${starter} ${name}, ${filler} "${msg}" ${reaction}. ${question}`;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomStart() {
  return randomPick(['Nimekupata', 'Safi', 'Poa', 'Done', '✅']);
}

async function sendTyping(sender_psid, on) {
  const request_body = { recipient: { id: sender_psid }, sender_action: on? 'typing_on' : 'typing_off' };
  try { await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body); } catch (e) {}
}

async function sendReply(sender_psid, response) {
  const request_body = { recipient: { id: sender_psid }, message: { text: response } };
  try { await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body); } catch (error) { console.error('Error:', error.response?.data || error.message); }
}

app.listen(PORT, () => console.log(`Kapela V100.1 SENTENCE MIXER yuko Live - Port ${PORT}`));
