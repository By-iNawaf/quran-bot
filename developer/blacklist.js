const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('منع مستخدم من استخدام البوت')
    .addUserOption(option =>
      option.setName('user').setDescription('المستخدم الذي تريد حظره').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    db.prepare(`INSERT OR REPLACE INTO blacklist (userId, addedAt) VALUES (?, ?)`)
      .run(user.id, new Date().toISOString());

    await interaction.reply(`🚫 تم حظر ${user.tag} من استخدام البوت.`);
  }
};
