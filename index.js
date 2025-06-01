const { Client, GatewayIntentBits, Collection, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const db = require('./db');
require('./deploy-commands');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection();

// تحميل الأوامر
const commandFolders = ['commands', 'developer'];
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ✅ تعيين حالة البوت عند التشغيل
  client.user.setPresence({
    activities: [
      {
        name: 'By: ! Nawaf',
        type: ActivityType.Listening
      }
    ],
    status: 'idle' // 'idle' | 'dnd' | 'invisible' | 'online'
  });
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    // أوامر الشات (Slash commands)
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const isBlacklisted = db.prepare(`SELECT 1 FROM blacklist WHERE userId = ?`).get(interaction.user.id);
      if (isBlacklisted && interaction.commandName !== 'appeal') {
        return interaction.reply({
          content: '🚫 أنت محظور من استخدام البوت. يمكنك تقديم طعن باستخدام /appeal',
          ephemeral: true
        });
      }

      // تحقق من أوامر المطور
      if (['kickbot', 'whitelist', 'blacklist'].includes(interaction.commandName)) {
        if (interaction.user.id !== config.ownerId)
          return interaction.reply({ content: '🚫 هذا الأمر خاص بالمطور فقط.', ephemeral: true });
      }

      await command.execute(interaction);
    }

    // عناصر التحكم (أزرار وقائمة)
    else if (interaction.isMessageComponent()) {
      const controls = require('./controls');
      await controls.handle(interaction);
    }
  } catch (error) {
    console.error('❌ خطأ في Interaction:', error);

    // منع الخطأ "InteractionAlreadyReplied"
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: '❌ حدث خطأ غير متوقع أثناء تنفيذ العملية.',
          ephemeral: true
        });
      } catch (err) {
        console.error('⚠️ فشل إرسال رد الطوارئ:', err.message);
      }
    }
  }
});

client.login(config.token);
