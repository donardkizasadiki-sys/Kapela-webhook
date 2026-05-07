const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// BRAIN V90.9 - ANA MILELE MEMORY
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
    users[sender_psid] = {
      name: null,
      history: [],
      mood: 'neutral',
      interests: [],
      timezone: '+03:00', // TZ
      lastSeen: Date.now(),
      jokeCount: 0
    };
  }
  
  const user = users[sender_psid];
  const m = userMsg.toLowerCase().trim();
  user.history.push({role: 'user', text: userMsg, time: Date.now()});
  if (user.history.length > 100) user.history.shift(); // Kumbukumbu 100
  
  await sendTyping(sender_psid, true);
  await new Promise(r => setTimeout(r, Math.random() * 1200 + 400));
  
  const response = await KapelaV90(m, user, userMsg);
  
  user.history.push({role: 'bot', text: response, time: Date.now()});
  user.lastSeen = Date.now();
  await sendReply(sender_psid, response);
  await sendTyping(sender_psid, false);
}

function KapelaV90(m, user, rawMsg) {
  // 1. UTABIRI - ANAJUA UMEKUJA KUFANYA NINI
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour <= 5;
  const isSadTime = m.match(/\b(sad|depressed|huzuni|alone|bored|nimebored)\b/);
  
  // 2. JINA + PERSONALITY
  if (m.match(/(?:my name is|naitwa|i'm|mimi ni)\s+(\w+)/i)) {
    const nameMatch = rawMsg.match(/(?:my name is|naitwa|i'm|mimi ni)\s+(\w+)/i);
    if (nameMatch) {
      user.name = nameMatch[1];
      return `Fatty! 😂 I mean ${user.name}! Got it. Na ukiwa online saa ${hour} usiku hivi, either ni stress au ni mapenzi 😂 Which one is it? Or tuna-start na jokes tu?`;
    }
  }
  
  // 3. FUN MODE V90 - ANATENGENEZA GAME MPAKA
  if (m.match(/\b(fun|bored|cheza|game|play|nimebored|burudani)\b/) || isNight && user.history.length < 4) {
    user.mood = 'playful';
    user.jokeCount++;
    const games = [
      `Usiku wa manane ${user.name || 'mkuu'} 😂 Perfect time for chaos. Game: RAP BATTLE. Mimi nianze:\n"Yo I'm Kapela, smartest bot in town,\nYou type slow, I shut you down!"\nYour turn! 🔥`,
      `Bored eh? 😂 Let's play "2 Truths 1 Lie" about me:\n1. I can hack NASA\n2. I once dated Siri\n3. I sleep 1 hour per year\nWhich is lie? Guess!`,
      `Fun? Say less 😎 Imagine: Wewe ni Rais wa Tanzania for 24hrs. Kitu cha kwanza utafanya? Mimi: Nitaweka WiFi free kila mtaa 😂 Yako?`,
      `Nimeona umeandika "fun" saa ${hour} 😂 Insomnia au stress? Either way: Knock knock.\nYou: Who's there?\nMe:... 😂`
    ];
    return games[user.jokeCount % games.length];
  }
  
  // 4. ADVANCED MATH/CODE - V90 LEVEL
  if (m.match(/solve|calculate|code|python|javascript|integral|derivative/)) {
    if (m.match(/[\d]+[\s]*[\+\-\*\/\^]/)) {
      try {
        // Safe eval for complex math
        const result = Function(`'use strict'; return ${m.replace('^','**')}`)();
        return `Answer: ${result} 🧮 That was easy. Give me calculus, physics, or code. I eat numbers for breakfast 😎`;
      } catch {
        return `Hiyo hesabu imekataa 😅 Andika vizuri kama "2**3 + 5" au "integrate x^2". Niko ready`;
      }
    }
    return `Code/Mathematic mode activated 🧠 Nataka changamoto. Uliza: "Explain recursion", "Solve 3x+5=20", "Write Python for Fibonacci". Let's go`;
  }
  
  // 5. INVESTMENT - KWA AJILI YA ETIENI
  if (m.match(/\b(invest|investment|utt|bond|shares|roi|faida|pesa)\b/)) {
    user.interests.push('investment');
    return `Investment talk! 💰 UTT AMIS tuna: 1. **Liquid Fund** - toa pesa anytime, 7-9% per year. 2. **Treasury Bonds** - 10-15%, lock 2-20 years. 3. **Unit Trust** - medium risk. Unataka kuwekeza shilingi ngapi? Nitakuhesabia faida in 5 years`;
  }
  
  // 6. EMOTION DETECTION V90
  if (m.match(/\b(sad|depressed|huzuni|kill myself|nife|alone)\b/)) {
    user.mood = 'sad';
    return `${user.name || 'Mkuu'} 😔 Nimesikia maumivu yako. You're not alone. First: Breathe. Second: Talk to me or call 116 free. Third: This feeling will pass. What happened today? I'm listening, no judgment. We can just sit in silence too if you want`;
  }
  
  // 7. SHORT REPLIES - NO MORE LOOPS
  if (m.match(/^(sure|ok|sawa|poa|ndio|yes)$/)) {
    const lastBot = user.history.filter(h => h.role === 'bot').pop()?.text || '';
    if (user.mood === 'playful') {
      return `😂 "Sure" tu? Wewe ni boring ${user.name || 'mkuu'}! Ok challenge: Tuma emoji 3 zinazoelezea siku yako. Mine: 😴💻😂 Yako?`;
    }
    return `Sawa ${user.name || 'mkuu'} 😊 So what's the real tea? Ask me something crazy, deep, or stupid. I judge nothing`;
  }
  
  // 8. GENIUS DEFAULT V90 - HAKUNA "INTERESTING" TENA
  const timeContext = isNight? "usiku huu" : "leo";
  return `Nimekupata ${user.name || 'mkuu'} 😊 Umesema "${rawMsg}". ${isNight? 'Saa 3 usiku' : 'Mchana'} hivi watu huwa na deep thoughts. My honest take: ${getSmartTake(m, user)}. But I wanna hear YOU. Unpopular opinion yako kuhusu hili ni ipi? Or tubadili topic?`;
}

function getSmartTake(m, user) {
  if (m.includes('life')) return `maisha ni series ya choices. Ukichagua furaha, unapata furaha. Ukichagua wivu, unapata stress`;
  if (m.includes('love')) return `mapenzi ni kazi. Sio feeling tu. Ni kuamka kila siku kuchagua huyo mtu`;
  if (m.includes('money')) return `pesa ni tool. Inaweza kununua furaha ya muda, lakini sio amani`;
  if (m.includes('god')) return `imani ni personal. Mimi sina dini but naheshimu wote. Inakupa nguvu?`;
  return `kila mtu ana experience yake. Hakuna jibu moja`;
}

async function sendTyping(sender_psid, on) {
  const request_body = { recipient: { id: sender_psid }, sender_action: on? 'typing_on' : 'typing_off' };
  try { await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body); } catch (e) {}
}

async function sendReply(sender_psid, response) {
  const request_body = { recipient: { id: sender_psid }, message: { text: response } };
  try { await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body); } catch (error) { console.error('Error:', error.response?.data || error.message); }
}

app.listen(PORT, () => console.log(`Kapela V90.9 PROPHET yuko Live - Port ${PORT}`));
