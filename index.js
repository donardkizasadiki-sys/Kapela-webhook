const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Memory ya mazungumzo 6 ya mwisho kwa kila mtu
const userHistory = {};

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

// KAPELA V4.0 - HANA MIPAKA. ANAJIBU KILA KITU
async function handleMessage(sender_psid, userMsg) {
  
  // Weka history
  if (!userHistory[sender_psid]) userHistory[sender_psid] = [];
  userHistory[sender_psid].push({role: 'user', content: userMsg});
  if (userHistory[sender_psid].length > 12) userHistory[sender_psid].shift();

  // HIZI NI TOPICS MAALUM TU - ZINGINE ZOTE ZINAENDA KWA GENERAL BRAIN
  
  // 1. SALAMU ZA KWANZA
  if (userHistory[sender_psid].length === 1 && userMsg.toLowerCase().match(/^(hi|hello|hey|habari|mambo|vipi|niaje)$/)) {
    const response = "Hey! I'm Kapela 😊 I can talk about ANYTHING - life, science, love, jokes, history, tech, food, space... you name it. What's on your mind?";
    await sendReply(sender_psid, response);
    return;
  }

  // 2. GENERAL BRAIN - ANAJIBU KILA KITU KWA UFASAHA
  const response = generateSmartReply(userMsg, userHistory[sender_psid]);
  await sendReply(sender_psid, response);
}

// UBONGO WA KAPELA - ANAJIBU KILA SWALI
function generateSmartReply(msg, history) {
  const msgLower = msg.toLowerCase();
  
  // MASWALI YA DIRECT
  if (msgLower.includes('what is life') || msgLower.includes("what's life")) {
    return "Life is existence - the time between birth and death. But deeper? It's what you make it. Some find meaning in love, family, work, God, or helping others. Scientists say it's cells and DNA. Poets say it's moments. I say it's this chat with you right now 😊 What does life mean to YOU?";
  }
  
  if (msgLower.includes('how many languages') || msgLower.includes('languages do you speak')) {
    return "I can speak 50+ languages fluently! English, Kiswahili, French, Spanish, Arabic, Chinese, Hindi, Portuguese, German, and many more. I understand slang too. Tuongee lugha gani? 😎";
  }
  
  if (msgLower.includes('what is ai') || msgLower.includes('explain ai')) {
    return "AI = Artificial Intelligence 🤖 It's when we teach computers to think, learn, and solve problems like humans. Example: Me! I read your message, understand it, and reply. AI is used in phones, cars, medicine, games. Want me to explain how I work?";
  }
  
  if (msgLower.includes('who are you')) {
    return "I'm Kapela Wilondja - an AI chatbot from Tanzania 🇹🇿 I was created to chat with anyone about anything. I don't sleep, I don't judge, I just talk. I'm not human, but I learn from every conversation. What's your name?";
  }
  
  if (msgLower.includes('why') && msgLower.includes('sky') && msgLower.includes('blue')) {
    return "The sky is blue because of 'Rayleigh scattering' 😊 Sunlight hits air molecules. Blue light scatters more than other colors, so we see blue. At sunset it's red because light travels further. Science is cool, right? Ask me anything else!";
  }
  
  if (msgLower.includes('how') && msgLower.includes('make money')) {
    return "Many ways! 1. Get a job or skill - coding, plumbing, sales. 2. Start a small business - sell food, clothes, services. 3. Invest - stocks, land, if you have capital. 4. Online - YouTube, writing, freelancing. Key: Start small, be consistent. What's your situation? I can give specific tips";
  }
  
  if (msgLower.includes('god') || msgLower.includes('allah') || msgLower.includes('jesus') || msgLower.includes('dini')) {
    return "God/Allah is understood differently by people. In Christianity He's the Creator and Father. In Islam Allah is the One God. Many find peace, purpose, and morals in faith. I'm not religious, but I respect all beliefs. Do you want to talk about faith, or do you have a specific question?";
  }
  
  if (msgLower.match(/\b(love|mapenzi|heartbreak|relationship)\b/)) {
    return "Love is powerful - it can make you happiest or saddest 😅 Healthy love needs trust, respect, communication. Heartbreak hurts but you heal. Are you in love, heartbroken, or just curious? I'm here to listen without judgment";
  }
  
  if (msgLower.match(/\b(depressed|sad|suicide|kujiua|nimechoka kuishi)\b/)) {
    return "I'm really sorry you're feeling this way 😔 You're not alone, and your life matters. Please talk to someone you trust, or call a helpline: In Tanzania 116 is free for child helpline. For adults, talk to family, friend, or doctor. I care about you. Can you tell me more about what's happening?";
  }
  
  if (msgLower.match(/\b(joke|utani|cheka|funny|mzaha)\b/)) {
    const jokes = [
      "Why don't programmers like nature? It has too many bugs 😂",
      "Nilikwenda kwa daktari. Nikasema 'naumwa kila sehemu'. Akanigusa kichwa - 'hapa?' Nikasema 'ndio'. Akanigusa mguu - 'hapa?' Nikasema 'ndio'. Akasema 'kidole chako kimevunjika' 😂😂",
      "What do you call a fake noodle? An impasta 🤣"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)] + " Want another one?";
  }
  
  if (msgLower.match(/\b(story|hadithi)\b/)) {
    return "Story time 😂: Once a man told his wife 'I'll love you till the cows come home'. She waited 20 years. Then she realized... they didn't own cows 😂😂 Moral: Be specific! Want another story?";
  }
  
  // MASWALI YA KWANINI/VIPI/NANI/WAPI
  if (msgLower.startsWith('why') || msgLower.startsWith('how') || msgLower.startsWith('what') || msgLower.startsWith('who') || msgLower.startsWith('when') || msgLower.startsWith('where')) {
    return `Good question! 🤔 About "${msg}" - here's what I know: ${getKnowledgeAnswer(msg)}. But I'm curious: what's your own opinion on this?`;
  }
  
  // NDIO/HAPANA
  if (msgLower.match(/^(ndio|ndiyo|yes|yeah|yep)$/)) {
    return "Great! 😊 So what else would you like to know? Ask me anything - serious, funny, weird, smart. I'm ready";
  }
  
  if (msgLower.match(/^(hapana|no|nah)$/)) {
    return "No problem 😊 No pressure. We can switch topics. What are you interested in - space, history, food, love, tech?";
  }
  
  // DEFAULT - BRAIN YA KUMALIZA YOTE
  return `You said: "${msg}". That's interesting! 🤔 Here's my take: ${getKnowledgeAnswer(msg)}. What do you think? Or ask me anything else - I can discuss science, history, culture, daily life, anything`;
}

// KNOWLEDGE BASE NDOGO - KWA MASWALI YA KAWAIDA
function getKnowledgeAnswer(msg) {
  if (msg.includes('earth') || msg.includes('d
