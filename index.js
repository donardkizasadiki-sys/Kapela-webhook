const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// BRAIN YA KAPELA V10 - ANAKUMBUKA KILA MTU
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

// KAPELA V10 - GENIUS BRAIN
async function handleMessage(sender_psid, userMsg) {
  
  // Tengeneza profile ya user
  if (!users[sender_psid]) {
    users[sender_psid] = {
      name: null,
      history: [],
      mood: 'neutral',
      topics: [],
      lang: 'mix' // swahili + english
    };
  }
  
  const user = users[sender_psid];
  user.history.push({role: 'user', text: userMsg, time: Date.now()});
  if (user.history.length > 20) user.history.shift(); // Kumbuka message 20
  
  // Tuma typing...
  await sendTyping(sender_psid, true);
  
  // Chelewesha kidogo ili ionekane anafikiri
  await new Promise(r => setTimeout(r, 800));
  
  const response = await KapelaBrain(userMsg, user);
  
  user.history.push({role: 'bot', text: response, time: Date.now()});
  await sendReply(sender_psid, response);
  await sendTyping(sender_psid, false);
}

// UBONGO MKUU WA V10
async function KapelaBrain(msg, user) {
  const m = msg.toLowerCase().trim();
  const history = user.history.slice(-6); // 6 messages za mwisho
  
  // 1. JINA
  if (m.match(/my name is|naitwa|i'm|mimi ni/)) {
    const name = msg.match(/(?:my name is|naitwa|i'm|mimi ni)\s+(\w+)/i);
    if (name) {
      user.name = name[1];
      return `Nice to meet you ${user.name}! 😊 I'll remember that. So ${user.name}, what's on your mind today? Ask me anything - math, science, life, jokes...`;
    }
  }
  
  // 2. MASWALI YA ELIMU - MATH, SCIENCE, HISTORY
  if (m.match(/\b(calculate|solve|what is \d|\+|\-|\*|\/|square root|% of)\b/)) {
    try {
      // Simple math solver
      const mathExp = msg.match(/[\d\+\-\*\/\.\(\)\s]+/);
      if (mathExp) {
        const result = eval(mathExp[0]); // Safe for basic math only
        return `That's ${result} 😊 Need me to solve anything else? I'm good at math, physics, history...`;
      }
    } catch {}
    return "Send me the math problem clearly, like '25 * 4' or 'what is 15% of 200' and I'll solve it 😊";
  }
  
  if (m.includes('relativity') || m.includes('einstein')) {
    return "Einstein's Relativity has 2 parts: 1. Special: Time slows down when you move fast. E=mc² means energy = mass × speed of light². 2. General: Gravity is space-time bending. Like a heavy ball on a trampoline. Want me to explain with an example?";
  }
  
  if (m.includes('photosynthesis')) {
    return "Photosynthesis = Plants make food ☀️ They take CO2 + Water + Sunlight → Glucose + Oxygen. Formula: 6CO2 + 6H2O + light → C6H12O6 + 6O2. That's why plants are life! Need more details?";
  }
  
  if (m.includes('world war') || m.includes('vita vya dunia')) {
    return "WW2: 1939-1945. Hitler's Germany vs Allies (US, UK, USSR). 70M+ died. Ended with atomic bombs on Japan. WW1: 1914-1918. Started after Archduke killed. Want specific battles or causes?";
  }
  
  // 3. ANDIKA CV, BARUA, SHAIRI
  if (m.includes('write') && m.includes('cv') || m.includes('andika cv')) {
    return "Sure! To write your CV I need: 1. Full name? 2. Job you want? 3. Skills? 4. Experience? Send me those and I'll write it professionally. Or want a template first?";
  }
  
  if (m.includes('write') && m.includes('poem') || m.includes('andika shairi')) {
    return "Here's a quick one:\n\n*In the quiet of the night,*\n*Stars whisper to the moon,*\n*Dreams take their flight,*\n*And hope arrives soon.*\n\nWant me to write about love, life, or any topic?";
  }
  
  // 4. MASWALI YA FALSAFA
  if (m.match(/\b(what is life|meaning of life|purpose|maana ya maisha)\b/)) {
    return "Life has no one answer. Biology: 4 billion years of evolution, cells, DNA. Philosophy: Some say it's happiness, love, helping others, or worship. Me? I think life is the sum of moments - like this chat with you${user.name? ' ' + user.name : ''}. What makes YOUR life meaningful?";
  }
  
  // 5. TECH & AI
  if (m.match(/\b(what is ai|explain ai|how do you work)\b/)) {
    return "I'm AI - Artificial Intelligence 🤖 I don't have a brain like humans. I use patterns, rules, and memory to understand your message and reply. I'm code running on a server. I learn from our chat but I don't feel emotions. Ask me how specific tech works!";
  }
  
  // 6. EMOTIONS - ANAONA MOOD
  if (m.match(/\b(sad|depressed|huzuni|nimechoka kuishi|suicide)\b/)) {
    user.mood = 'sad';
    return "I'm really sorry you're feeling this way 😔 You matter, and you're not alone. Please talk to someone you trust - family, friend, doctor. In Tanzania call 116 for free help. I'm here to listen 24/7. Can you tell me what's hurting you most right now?";
  }
  
  if (m.match(/\b(happy|furaha|excited|good mood)\b/)) {
    user.mood = 'happy';
    return "That's amazing! 😊 I'm happy when you're happy. What made your day good? Tell me everything!";
  }
  
  // 7. JOKES & STORIES
  if (m.match(/\b(joke|utani|cheka|funny)\b/)) {
    const jokes = [
      "Why did the scarecrow win an award? Because he was outstanding in his field! 😂",
      "Mwalimu: 'Taja ndege asiyeruka'. Mwanafunzi: 'Ndege aliyekufa mwalimu' 😂😂",
      "I told my wife she was drawing her eyebrows too high. She looked surprised 😂"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)] + " Want another?";
  }
  
  // 8. CONTEXT AWARE - ANAJIBU KULINGANA NA MAZUNGUMZO
  const lastBotMsg = history.filter(h => h.role === 'bot').pop()?.text || '';
  if (m.match(/^(ndio|yes|yeah|more|another|zaidi)$/)) {
    if (lastBotMsg.includes('joke')) return "Ok ok 😂 What did one wall say to the other? 'I'll meet you at the corner!' Want more?";
    if (lastBotMsg.includes('Relativity')) return "Example: If you travel in space at 99% light speed for 1 year, 7 years pass on Earth. That's time dilation! Crazy right? Ask me anything else";
    return "Sawa! 😊 What else do you want to know? I can explain, calculate, write, or just chat";
  }
  
  if (m.match(/^(hapana|no|stop)$/)) {
    return "Poa, no problem 😊 Let's switch. Talk to me about anything - your day, dreams, questions, random thoughts. I'm all ears";
  }
  
  // 9. SALAMU WITH NAME
  if (m.match(/^(hi|hello|hey|habari|mambo|niaje)$/) && history.length <= 2) {
    return `Hey${user.name? ' ' + user.name : ''}! 😊 I'm Kapela V10. I can discuss science, math, write stuff, tell jokes, or just chat about life. What's on your mind today?`;
  }
  
  // 10. UNIVERSAL ANSWER - HACHANGANYIKIWI TENA
  return generateUniversalAnswer(msg, user, history);
}

// BRAIN YA MWISHO - AKIKOSA JIBU SPECIFIC
function generateUniversalAnswer(msg, user, history) {
  const name = user.name? ` ${user.name}` : '';
  
  // Jaribu kuelewa intent
  if (msg.includes('?')) {
    return `That's a really good question${name}! 🤔 While I don't have exact data on "${msg}", here's how I think about it: Most things in life depend on context. Can you give me more details so I answer better? Or ask me anything else - I'm good at math, science, writing, advice...`;
  }
  
  if (msg.length < 10) {
    return `You said "${msg}"${name} 😊 Tell me more! I can chat about anything - what's your day like, what are you curious about, or want me to tell you something interesting?`;
  }
  
  // Jibu la jumla lakini smart
  return `I hear you${name} 😊 You mentioned "${msg}". That's interesting because everyone experiences things differently. My view: life is about learning and sharing. What's your take on this? Or ask me anything else - I know science, history, math, I can write, joke...`;
}

async function sendTyping(sender_psid, on) {
  const request_body = {
    recipient: { id: sender_psid },
    sender_action: on? 'typing_on' : 'typing_off'
  };
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body);
  } catch (e) {}
}

async function sendReply(sender_psid, response) {
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

app.listen(PORT, () => console.log(`Kapela V10 GENIUS yuko Live - Port ${PORT}`));
