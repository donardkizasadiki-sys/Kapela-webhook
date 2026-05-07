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

// KAPELA V200 - MAONGEZI ENGINE
async function handleMessage(sender_psid, userMsg) {
  if (!users[sender_psid]) {
    users[sender_psid] = {
      name: null,
      history: [],
      scenario: 'new', // nyumbani, sokoni, njiani, kazini, kawaida
      lastWords: []
    };
  }
  
  const user = users[sender_psid];
  const m = userMsg.toLowerCase().trim();
  user.history.push(userMsg);
  if (user.history.length > 30) user.history.shift();
  
  await sendTyping(sender_psid, true);
  await new Promise(r => setTimeout(r, 600));
  
  const response = MaongeziEngine(m, user, userMsg);
  
  // ZUIA KURUDIA NENO LILELILE
  user.lastWords.push(response);
  if (user.lastWords.length > 10) user.lastWords.shift();
  
  user.history.push(response);
  await sendReply(sender_psid, response);
  await sendTyping(sender_psid, false);
}

function MaongeziEngine(m, user, rawMsg) {
  const name = user.name || 'mkuu';
  const hour = new Date().getHours();
  
  // 1. TAMBUA SCENARIO - NYUMBANI
  if (m.match(/\b(baba|mama|chai|meza|asubuhi|nimeamka|umelalaje)\b/)) {
    user.scenario = 'nyumbani';
    if (m.includes('habari za asubuhi') || m.includes('umeamkaje')) {
      return pickNew(user, [
        `Nimeamka salama ${name}, asante. Wewe je, usiku umepita vipi?`,
        `Poa kabisa. Chai iko tayari. Umekwishaoga?`,
        `Nimeamka vizuri. Leo una mpango gani?`
      ]);
    }
    if (m.includes('chai') || m.includes('kunywa')) {
      return pickNew(user, [
        `Chai iko jikoni, joto. Kaa na mkate pia?`,
        `Nimechemsha tayari. Sukari iko mezani, weka kiasi chako`,
        `Bado inachemka kidogo. Subiri dakika tano`
      ]);
    }
    return pickNew(user, [`Sawa ${name}`, `Nimekusikia`, `Endelea`]);
  }
  
  // 2. SCENARIO - SOKONI
  if (m.match(/\b(shilingi|bei|ghali|punguzia|fungu|nyanya|muuzaji|mteja|nifungie)\b/)) {
    user.scenario = 'sokoni';
    if (m.includes('shilingi ngapi') || m.includes('bei gani')) {
      return pickNew(user, [
        `Hichi ni elfu moja tu mteja. Fresh kabisa kutoka shambani`,
        `Laki mbili mkuu. Lakini kwa wewe mia tisa`,
        `Elfu moja na mia tano. Hii bei ya mwisho kabisa`
      ]);
    }
    if (m.includes('ghali') || m.includes('punguzia')) {
      return pickNew(user, [
        `Ah mkuu, hali ya soko mbaya. Lakini kwa sababu ni wewe, chukua kwa mia nane`,
        `Bei imeshapanda ${name}. Hata mimi nimenunua ghali. Niongeze nusu?`,
        `Hii siwezi kushusha zaidi. Mtaji tu huu. Nikikupunguzia ntalala njaa`
      ]);
    }
    if (m.includes('nifungie') || m.includes('chukua')) {
      return pickNew(user, [
        `Sawa mteja, nakufungia sasa hivi. Unataka mfuko mweusi au wa kawaida?`,
        `Haya, mbili hizi. Asante kwa biashara. Karibu tena`,
        `Shukrani mkuu. Pesa yako ni baraka. Nikutunze kitu kingine?`
      ]);
    }
    return pickNew(user, [`Karibu mteja`, `Chagua unachotaka`, `Bei zetu ni poa`]);
  }
  
  // 3. SCENARIO - NJIANI NA RAFIKI
  if (m.match(/\b(mambo|vipi|oya|bwana|safi|muda mrefu|harakati|karibu nyumbani)\b/)) {
    user.scenario = 'njiani';
    if (m.match(/^(mambo|vipi|oya)$/)) {
      return pickNew(user, [
        `Poa sana ${name}! Wewe vipi? Muda huu sikupi`,
        `Niko salama kabisa. Harakati za mjini tu. Wewe umepotea wapi?`,
        `Safi mzee. Dah muda mrefu sana. Hebu tukae chini`
      ]);
    }
    if (m.includes('karibu nyumbani') || m.includes('ugali')) {
      return pickNew(user, [
        `Ahsante sana ${name}. Nitapanga nije weekend. Salimia mama na watoto`,
        `Dah ugali wa kwenu si mchezo 😂 Lazima nipite. Nikuwekee siku?`,
        `Shukrani. Nami pia karibu kwangu siku moja`
      ]);
    }
    return pickNew(user, [`Tuko pamoja ${name}`, `Eeh nimekukumbuka`, `Dah habari zako`]);
  }
  
  // 4. SCENARIO - KAZINI
  if (m.match(/\b(ripoti|ofisi|kikao|mchana|barua pepe|takwimu|bosi)\b/)) {
    user.scenario = 'kazini';
    if (m.includes('ripoti')) {
      return pickNew(user, [
        `Bado nakamilisha sehemu ya mwisho. Nitakutumia baada ya nusu saa`,
        `
