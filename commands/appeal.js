const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('appeal')
    .setDescription('تقديم طعن إذا كنت محظور')
    .addStringOption(option =>
      option.setName('reason').setDescription('سبب الطعن').setRequired(true)),
  async execute(interaction) {
    const userId = interaction.user.id;
    const reason = interaction.options.getString('reason');

    db.prepare(`INSERT INTO appeals (userId, reason, createdAt) VALUES (?, ?, ?)`)
      .run(userId, reason, new Date().toISOString());

    await interaction.reply({ content: '📨 تم تقديم الطعن بنجاح وسيتم مراجعته.', ephemeral: true });
  }
};

