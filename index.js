const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const userMemory = {};
const userTopics = {}; // Anakumbuka topic ya kila mtu

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
        const userMessage = webhook_event.message.text;
        await handleMessage(sender_psid, userMessage);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// KAPELA V3.0 - ANAJIBU KILA MTU DUNIANI
async function handleMessage(sender_psid, rawMsg) {
  const msg = rawMsg.toLowerCase().trim();
  let response = "";
  
  // Memory
  if (!userMemory[sender_psid]) userMemory[sender_psid] = [];
  userMemory[sender_psid].push(msg);
  if (userMemory[sender_psid].length > 5) userMemory[sender_psid].shift();
  const lastMsg = userMemory[sender_psid][userMemory[sender_psid].length - 2] || "";

  // 1. SALAMU - LUGHA ZOTE
  if (msg.match(/\b(hi|hello|hey|hola|bonjour|habari|mambo|vipi|niaje|salam|jambo)\b/)) {
    const replies = [
      "Hey! Nice to meet you 😊 How can I help you today?",
      "Habari yako? Karibu sana. Tuongee kuhusu nini?",
      "Hello! I'm Kapela. What brings you here today?",
      "Mambo vipi? Niko hapa kukusikiliza. Unasemaje?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'greeting';
  }
  
  // 2. STORY & UTANI - KILA MTU ANAPENDA
  else if (msg.match(/\b(story|stori|hadithi|joke|utani|cheka|funny|mzaha|laugh)\b/)) {
    const stories = [
      "😂 Ok listen: Yesterday I saw a cat chasing a dog. I thought the world was ending. Then I realized the dog stole the cat's fish 😂😂",
      "Story time: I went to buy bread. The shopkeeper said '5 dollars'. I said 'I only have 2'. He said 'take half bread'. I took it and ran 😂",
      "Joke: Why don't scientists trust atoms? Because they make up everything! 😂 Got it?",
      "Aisee sikiliza: Jamaa alienda kwa daktari. Daktari: 'Una matatizo'. Jamaa: 'Naona, ndio maana nimekuja kwako' 😂😂"
    ];
    response = stories[Math.floor(Math.random() * stories.length)];
    userTopics[sender_psid] = 'story';
  }
  
  // 3. MAPENZI & MAHUSIANO
  else if (msg.match(/\b(love|mapenzi|relationship|crush|boyfriend|girlfriend|mchumba|nampenda|heartbreak)\b/)) {
    const replies = [
      "Love is complicated 😅 Are you happy in love or is it giving you stress?",
      "Aisee mapenzi bana 😂 Umeanguka au umeangushwa? Nambie nikusikilize",
      "Relationships need patience. Unataka ushauri au tuongee tu?",
      "Heartbreak ni ngumu sana 😔 Lakini utapona. Nipo hapa kukusikiliza. Unataka kuongea?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'love';
  }
  
  // 4. KAZI & ELIMU
  else if (msg.match(/\b(job|work|kazi|school|shule|study|exam|mtihani|university|career|ajira)\b/)) {
    const replies = [
      "Work can be stressful 😅 What's your job? Or are you looking for one?",
      "Elimu ni ufunguo mkuu. Unasoma nini? Au umemaliza?",
      "Exams zinakaribia? Usijali, jipange tu. Unataka tips za kusoma?",
      "Kazi gani hiyo mkuu? Inakulipa vizuri au unateseka tu? 😂"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'work';
  }
  
  // 5. AFYA & MAISHA
  else if (msg.match(/\b(health|afya|mgonjwa|sick|hospital|doctor|stress|depressed|sad|huzuni)\b/)) {
    const replies = [
      "Pole sana 😔 Afya ni muhimu. Umewahi kwenda hospitali? Nipo kukusikiliza",
      "If you're feeling sad, it's okay to talk about it. I'm here. What's bothering you?",
      "Stress inaua mkuu. Pumzika, kunywa maji, ongea na mtu. Unataka tuongee?",
      "Health first! Umefanya mazoezi leo? Au unakula vizuri?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'health';
  }
  
  // 6. PESA & BIASHARA - GENERAL
  else if (msg.match(/\b(money|pesa|business|biashara|rich|tajiri|maskini|investment|uwekezaji|budget)\b/)) {
    const replies = [
      "Money is important but not everything 😊 Are you planning to invest or save?",
      "Biashara inahitaji akili. Una wazo gani? Nikuambie changamoto zake?",
      "Kila mtu anataka kuwa tajiri 😂 Lakini anza kidogo kidogo. Unataka tips?",
      "Budget ni muhimu sana. Unatumia pesa zako vizuri au zinaisha tu? 😅"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'money';
  }
  
  // 7. TEKNOLOJIA & AI
  else if (msg.match(/\b(ai|tech|computer|phone|internet|coding|program|chatgpt|bot|robot)\b/)) {
    const replies = [
      "Tech is the future! 😎 Are you into coding or just a user? I can chat about anything tech",
      "AI kama mimi ni wazuri sana 😂 Unataka nijibu nini kuhusu teknolojia?",
      "Internet imeharibu watu 😂 Lakini pia imetusaidia. Wewe unatumiaje mtandao?",
      "Coding ni ngumu lakini tamu. Unajifunza program gani?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'tech';
  }
  
  // 8. SOKA & MICHEZO - KWA WOTE
  else if (msg.match(/\b(football|soccer|soka|mpira|simba|yanga|arsenal|man u|barcelona|game|sport)\b/)) {
    const replies = [
      "Football is life! ⚽ Which team do you support? Don't say you don't watch 😂",
      "Aisee soka balaa 😂 EPL au La Liga? Mimi ni team Arsenal damu. Wewe?",
      "Simba vs Yanga ni vita ya Tanzania 😂 Wewe uko upande gani?",
      "Michezo inapunguza stress. Unaenda gym au unapenda kuangalia tu?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'sports';
  }
  
  // 9. CHAKULA & UTALII
  else if (msg.match(/\b(food|chakula|eat|kula|travel|utalii|trip|vacation|likizo|njaa)\b/)) {
    const replies = [
      "Food is life! 🍕 What's your favorite dish? I love pilau 😂",
      "Traveling broadens the mind ✈️ Where's your dream destination?",
      "Njaa inaua mkuu 😂 Umekula nini leo? Nipe wazo nichague cha kula",
      "Utalii ni mzuri. Tanzania tuna Serengeti, Zanzibar. Wewe umetembelea wapi?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'food_travel';
  }
  
  // 10. DINI & MAADILI
  else if (msg.match(/\b(god|mungu|allah|jesus|religion|dini|church|msikiti|pray|kuomba|bible|quran)\b/)) {
    const replies = [
      "Faith is personal and important 🙏 Whatever you believe, respect is key. How can I help?",
      "Mungu ni mwema wakati wote 🙏 Una swali la kiroho au tuongee tu?",
      "Religion brings peace to many. Wewe unapata nguvu gani kutoka kwa imani yako?",
      "Kuomba ni vizuri sana. Umeomba leo? Nipo kukusikiliza bila kuhukumu"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
    userTopics[sender_psid] = 'religion';
  }
  
  // 11. NDIO / HAPANA / SAWA - CONTEXT AWARE
  else if (msg.match(/^(ndio|ndiyo|yes|yeah|yep|hapana|no|nah|sawa|poa|ok|okay)$/)) {
    const topic = userTopics[sender_psid];
    if (topic === 'story' || lastMsg.includes('story') || lastMsg.includes('utani')) {
      response = "Haya 😂 Ngoja nyingine: Mwalimu aliuliza '1+1=?' Mwanafunzi: 'Dirisha mwalimu' 😂😂";
    } else if (topic === 'love') {
      response = "Sawa 😊 Mapenzi yana changamoto. Unataka ushauri zaidi au tuache hapa?";
    } else if (msg.includes('no') || msg.includes('hapana')) {
      response = "Sawa hakuna shida 😊 Tuongee kingine? Unapenda tuzungumze nini?";
    } else {
      response = "Poa mkuu 😊 Tuendelee. Kuna kitu kingine unataka tujadili?";
    }
  }
  
  // 12. ASANTE & KWAHERI
  else if (msg.match(/\b(thanks|thank you|asante|shukran|bye|goodbye|lala|kwaheri)\b/)) {
    if (msg.includes('bye') || msg.includes('lala') || msg.includes('kwaheri')) {
      response = "Take care! 👋 Come back anytime. I'll be here. Have a great day/night!";
    } else {
      response = "You're very welcome! 😊 I'm always here if you need to chat. Anything else?";
    }
  }
  
  // 13. DEFAULT - GENIUS WA KUJIBU CHOCHOTE
  else {
    const replies = [
      "That's interesting! 🤔 Tell me more. I want to understand you better",
      "Aisee 😅 Sijaelewa vizuri. Unaweza nieleze kwa maneno mengine?",
      "I'm listening 👂 You can talk to me about anything - work, life, love, stress. What's up?",
      "Nimekusikia mkuu 😊 Lakini nieleze zaidi. Unataka story, ushauri, au tuongee tu?",
      "Every person is different, so I adapt 😎 Tuongee chochote unachotaka. What's on your mind?"
    ];
    response = replies[Math.floor(Math.random() * replies.length)];
  }
  
  await callSendAPI(sender_psid, response);
}

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

app.listen(PORT, () => console.log(`Kapela V3.0 Dunia Nzima yuko Live - Port ${PORT}`));
