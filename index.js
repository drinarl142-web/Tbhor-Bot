// index.js - Advanced Discord Moderation Bot
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Listë e fjalëve të ndaluara (shembull, shto 500+ fjalë)
const bannedWords = [
  "badword1","badword2","badword3","badword4","badword5",
  // ...shto fjalët tjera këtu
];

// Ruaj për ndëshkime (timeout / kick / ban)
const punishments = {}; // {userId: {badWordCount, spamCount, capsCount}}

// Settings
const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minuta timeout
const CAPS_WARNING_LIMIT = 5;
const SPAM_WARNING_LIMIT = 2;

client.on("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return; // mos reagoni tek botët

  const userId = message.author.id;
  if (!punishments[userId]) punishments[userId] = {badWordCount:0, spamCount:0, capsCount:0};

  // -------- Anti Bad Words --------
  const foundWord = bannedWords.find(word => message.content.toLowerCase().includes(word));
  if (foundWord) {
    await message.delete().catch(console.error);

    punishments[userId].badWordCount += 1;

    if (punishments[userId].badWordCount === 1) {
      message.author.send("You used a banned word. Timeout 10 minutes.").catch(()=>{});
      message.member.timeout(TIMEOUT_DURATION, "Used banned word").catch(console.error);
    } else if (punishments[userId].badWordCount === 2) {
      message.member.ban({reason: "Repeated use of banned words"}).catch(console.error);
    }
    return;
  }

  // -------- Anti Caps --------
  if (message.content.length > 5 && message.content === message.content.toUpperCase()) {
    await message.delete().catch(console.error);
    punishments[userId].capsCount +=1;

    if (punishments[userId].capsCount <= CAPS_WARNING_LIMIT) {
      message.author.send(`Do not type in ALL CAPS. Warning ${punishments[userId].capsCount}/${CAPS_WARNING_LIMIT}`).catch(()=>{});
    } else {
      message.member.kick("Repeated ALL CAPS messages").catch(console.error);
    }
    return;
  }

  // -------- Anti Spam --------
  if (message.content.length < 10 && message.content.split(" ").length <= 2) {
    punishments[userId].spamCount +=1;
    await message.delete().catch(console.error);

    if (punishments[userId].spamCount <= SPAM_WARNING_LIMIT) {
      message.author.send(`Do not spam. Warning ${punishments[userId].spamCount}/${SPAM_WARNING_LIMIT}`).catch(()=>{});
    } else {
      message.member.kick("Repeated spam messages").catch(console.error);
      punishments[userId].spamCount = 0; // reset after kick
    }
    return;
  }

  // -------- Example command --------
  if (message.content === "!ping") {
    message.reply("Pong!");
  }

});

client.login(process.env.MTQ2OTA2NDMwMTc5MTk0MDkzMA.GiPWJ2.VM-aJfC_KzbPaPv7crPZyt0lQkZqTNW3ENCUTo;