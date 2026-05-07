// Kapela Bot V500 - Kapela Wilondja
// Keywords & Dialogue Manager - Swahili Edition

const KapelaV500 = {
  version: "5.0.0",
  botName: "Kapela Bot",
  author: "Kapela Wilondja",
  lastUpdate: "2026-05-07",

  intents: {
    rasmi_chatbot: {
      name: "salama_za_chatbot",
      keywords: [
        "habari yako", "unaendeleaje", "niko poa", "niko tayari kukusaidia",
        "una swali lolote", "ningekufanyia", "nimekupata", "majibu yanaweza kuwa",
        "asante sana", "umenisaidia", "karibu sana", "furaha yangu",
        "usisite kuniuliza", "kuwa na siku njema", "wewe pia", "baadaye"
      ],
      responses: {
        greeting: "Habari yako! Niko hapa kukusaidia. Unaendeleaje leo?",
        reply: "Mimi niko poa tu, niko tayari kukusaidia. Una swali lolote au kuna kitu ningekufanyia?",
        answer: "Sawa, nimekupata. Kwa {topic}, majibu yanaweza kuwa {answer}.",
        closing: "Karibu sana! Ni furaha yangu kukusaidia. Kama utahitaji msaada mwingine, usisite kuniuliza. Kuwa na siku njema!"
      }
    },

    kifamilia: {
      name: "mazungumzo_ya_nyumbani",
      keywords: [
        "hodi nyumbani", "karibu mama", "umechelewa", "habari za kazini",
        "asante mungu", "foleni kubwa", "umejifunzaje", "nimejifunza vizuri",
        "nimemaliza kazi za shule", "nzuri sana", "jitahidi", "baba amerudi",
        "yuko sebuleni", "anatazama habari", "kubadilisha nguo", "nikaongee naye",
        "usisahau kunywa maziwa", "kulala", "usiku mwema", "lala salama"
      ],
      responses: {
        greeting: "Hodi nyumbani! Nimerudi.",
        welcome: "Karibu Mama! Umechelewa leo kidogo. Habari za kazini?",
        encourage: "Nzuri sana! Ndiyo hivyo, uwe unajitahidi kila wakati.",
        closing: "Usiku mwema mwanangu, lala salama."
      }
    },

    kimtaani: {
      name: "lugha_ya_mtaani",
      keywords: [
        "mambo vipi", "uko poa", "poa sana", "nashangaa maisha", "msoto wangu",
        "hujapotea", "nasaka mkwanja", "hapa na pale", "bize kidogo",
        "yule demu", "mrembo kweli", "hutabadilika", "anakula bata",
        "ngoja niende zangu", "tukutane kesho", "nenda zako",
        "ukinipigia simu", "usisahau kunitumia meseji"
      ],
      responses: {
        greeting: "Mambo vipi, mkuu? Uko poa?",
        reply: "Poa sana! Nipo hapa nashangaa tu maisha. Wewe je?",
        joke: "Wewe hutabadilika! 😂",
        closing:
