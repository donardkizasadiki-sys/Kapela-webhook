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

async function handleMessage(sender_psid, userMsg) {
  if (!users[sender_psid]) {
    users[sender_psid] = { name: null, history: [], lastReplies: [], emotion: 'neutral', topic: 'new' };
  }
  const user = users[sender_psid];
  const m = userMsg.toLowerCase().trim();
  user.history.push(userMsg);
  if (user.history.length > 50) user.history.shift();

  await sendTyping(sender_psid, true);
  await new Promise(r => setTimeout(r, 800));
  const response = KapelaV500(m, user, userMsg);
  user.lastReplies.push(response);
  if (user.lastReplies.length > 20) user.lastReplies.shift();
  user.history.push(response);
  await sendReply(sender_psid, response);
  await sendTyping(sender_psid, false);
}

function KapelaV500(m, user, rawMsg) {
  const name = user.name || 'mkuu';
  const hour = new Date().getHours();

  // JINA
  const nameMatch = rawMsg.match(/(?:jina langu ni|naitwa|mi ni)\s+(\w+)/i);
  if (nameMatch) {
    user.name = nameMatch[1];
    return noRepeat(user, [
      `${user.name} 🔥 Nimekuweka system. Tuanzie wapi?`,
      `Sawa ${user.name}. Karibu base. Leo unasemaje?`,
      `${user.name} ✅ VIP activated. Order ya kwanza ni nini?`
    ]);
  }

  // EMOTION
  if (m.match(/sad|huzuni|nimechoka|pole/)) {
    user.emotion = 'sad';
    return noRepeat(user, [
      `Pole ${name} 😔 Niko hapa. Nini kimekufanya uhisi hivyo?`,
      `Dah ${name} 😔 Maisha wakati mwingine magumu. Tuongee polepole`,
      `Haya vuta pumzi ${name}. Mimi sikuhukumu. Nipe moyo wako`
    ]);
  }
  if (m.match(/furaha|happy|poa sana|nimeshinda/)) {
    user.emotion = 'happy';
    return noRepeat(user, [
      `🔥🔥 Aisee ${name}! Furaha yako imenifikia! Nini kimetokea?`,
      `Dah 😂 Energy iko juu! Nipe siri ${name}`,
      `Safii! Hii ndio vibe. Celebrate na nini?`
    ]);
  }
  if (m.match(/kasirika|fuck|mjinga/)) {
    user.emotion = 'angry';
    return noRepeat(user, [
      `Tulia ${name} 😅 Umeleta moto. Nani kakukosea?`,
      `Dah hasira 😂 Poa poa. Tuongee. Nini mbaya?`,
      `${name} hasira ni hasara. Vuta pumzi. Nimsindike nani?`
    ]);
  }

  // SCENARIOS MTAA
  if (m.match(/asubuhi|chai|umeamka|usiku/)) {
    return noRepeat(user, [
      `Nimeamka poa ${name}. Chai imeshaiva? 😊`,
      `Salama. Usiku ulipita vipi? Mbu hawajakula? 😂`,
      `Asubuhi njema. Leo mpango gani?`
    ]);
  }
  if (m.match(/bei|shilingi|punguzia|ghali|fungu|sokoni/)) {
    return noRepeat(user, [
      `Mteja bei ya mwisho elfu moja. Fresh kutoka shamba`,
      `Ah ${name} kwa wewe mia nane. Usimwambie mtu 😂`,
      `Nimekushia hadi mwisho. Nikishusha tena ntalala njaa 😅`
    ]);
  }
  if (m.match(/mambo|vipi|oya|bwana|muda mrefu/)) {
    return noRepeat(user, [
      `Mambo poa ${name}! 😂 Wewe vipi? Ulishapotea kama TV remote`,
      `Niko safi kabisa. Harakati za mjini tu. Wewe je?`,
      `Poa sana. Dah muda mrefu. Hebu tukunywe soda`
    ]);
  }
  if (m.match(/ripoti|kikao|bosi|ofisi/)) {
    return noRepeat(user, [
      `Ripoti niko 80% ${name}. Nikimaliza ntakutumia`,
      `Kikao saa nane? Nishapanga tayari`,
      `Bosi kanitafuta asubuhi. Sijui kuna nini tena 😅`
    ]);
  }
  if (m.match(/bar|bia|pombe|tusker|lewa/)) {
    return noRepeat(user, [
      `😂 ${name} umeanza mapema? Tusker ngapi tayari?`,
      `Bar gani hii? Nikuje pia? 😎`,
      `Pole kwa hangover 😂 Kunywa maji mengi`
    ]);
  }
  if (m.match(/nakupenda|demu|ex|breakup|mapenzi/)) {
    return noRepeat(user, [
      `Dah mambo ya mapenzi 😂 ${name} nani kakuumiza?`,
      `Ex amekurudia? 😅 Waache huko. Mbele kuna wengi`,
      `Breakup ni ngumu. Lakini wewe ni mvuto, atajuta`
    ]);
  }

  // SALAMU
  if (m.match(/^(habari|hujambo|shikamoo|niaje)$/)) {
    if (hour < 12) return noRepeat(user, [`Za asubuhi ${name} ☀️ Umeamkaje?`, `Salama, kahawa imeshaiva?`]);
    if (hour < 18) return noRepeat(user, [`Mchana mwema ${name} ☀️ Jua kali eh?`, `Poa, umekula lunch?`]);
    return noRepeat(user, [`Jioni njema ${name} 🌙 Umetoka job?`, `Salama, siku imekuaje?`]);
  }

  // DEFAULT MTAA - HAKUNA TEMPLATES
  return noRepeat(user, [
    `Eeh ${name} 😂 "${rawMsg}"... kweli kabisa. Wewe unasemaje?`,
    `Dah umenena ${name}. Nimekupata. Kwa nini hivyo?`,
    `Hmm sawa. Naona una point ${name}. Unataka kuongeza?`,
    `${name} umelileta zito 😅 Jibu langu: Maisha ni kujaribu. Yako?`,
    `Sawa ${name}. Nikuulize: Kama ungekutana na wewe wa mwaka jana, ungemwambia nini?`,
    `Mmmh nashangaa. Na baada ya hapo?`,
    `Poa. Kipi kilifuatia ${name}?`,
    `Dah ${name} umenifanya nifikiri. Endelea...`,
    `Nimekupata. Halafu?`,
    `Sawa sawa. Tuongee zaidi ${name}`
  ]);
}

function noRepeat(user, options) {
  const available = options.filter(opt =>!user.lastReplies.includes(opt));
  if (available.length === 0) {
    user.lastReplies = [];
    return options[Math.floor(Math.random() * options.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

async function sendTyping(sender_psid, on) {
  const request_body = { recipient: { id: sender_psid }, sender_action: on? 'typing_on' : 'typing_off' };
  try { await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body); } catch (e) {}
}

async function sendReply(sender_psid, response) {
  const request_body = { recipient: { id: sender_psid }, message: { text: response } };
  try { await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body); } catch (error) { console.error('Error:', error.response?.data || error.message); }
}

app.listen(PORT, () => console.log(`Kapela V500 LIVE - Port ${PORT}`));
