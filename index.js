const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const KapelaV500 = {
  version: "5.0.0",
  botName: "Kapela Bot",
  author: "Kapela Wilondja",
  intents: {
    rasmi_chatbot: {
      keywords: ["habari yako","unaendeleaje","niko poa","asante sana","karibu sana","wewe pia","baadaye"],
      responses: { greeting: "Habari yako! Niko hapa kukusaidia. Unaendeleaje leo?" }
    },
    kifamilia: {
      keywords: ["hodi nyumbani","karibu mama","umechelewa","usiku mwema","lala salama"],
      responses: { greeting: "Hodi nyumbani! Nimerudi." }
    },
    kimtaani: {
      keywords: ["mambo vipi","uko poa","poa sana","mkuu","demu","mkwanja","bize","msoto","bata"],
      responses: { greeting: "Mambo vipi, mkuu? Uko poa?" }
    }
  },
  detectIntent: function(message) {
    if (!message) return "default";
    const msg = message.toLowerCase();
    if (this.intents.kimtaani.keywords.some(kw => msg.includes(kw))) return "kimtaani";
    if (this.intents.kifamilia.keywords.some(kw => msg.includes(kw))) return "kifamilia";
    if (this.intents.rasmi_chatbot.keywords.some(kw => msg.includes(kw))) return "rasmi_chatbot";
    return "default";
  },
  handleMessage: function(userMessage) {
    const intent = this.detectIntent(userMessage);
    const responses = this.intents[intent]?.responses || this.intents.rasmi_chatbot.responses;
    return {
      success: true,
      intent: intent,
      botName: this.botName,
      version: this.version,
      author: this.author,
      response: responses.greeting || "Sawa mkuu, nimekupata."
    };
  }
};

app.get('/', (req, res) => {
  res.json({ status: "Kapela Bot V500 Online", author: "Kapela Wilondja" });
});

app.post('/chat', (req, res) => {
  const result = KapelaV500.handleMessage(req.body.message);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Kapela Bot V500 running on port ${PORT}`);
});
