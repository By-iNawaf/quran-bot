// deploy-commands.js

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const commands = [];

const commandFolders = ['commands', 'developer'];
for (const folder of commandFolders) {
  if (!fs.existsSync(`./${folder}`)) {
    console.warn(`⚠️ مجلد ${folder} غير موجود!`);
    continue;
  }

  const commandFiles = fs.readdirSync(`./${folder}`).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = `./${folder}/${file}`;
    const command = require(filePath);

    if (!command.data || typeof command.data.toJSON !== 'function') {
      console.warn(`⚠️ الملف ${filePath} لا يحتوي على data.toJSON صالح.`);
      continue;
    }

    commands.push(command.data.toJSON());
  }
}

console.log(`🛠 وجدت ${commands.length} أمر/أوامر.`);

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('🛠 جاري تسجيل الأوامر العالمية...');
    const data = await rest.put(
      Routes.applicationCommands(config.clientId), // تسجيل عالمي
      { body: commands }
    );
    console.log(`✅ تم تسجيل ${data.length} أمر كأوامر عالمية.`);
  } catch (error) {
    console.error('❌ فشل تسجيل الأوامر:', error);
  }
})();
