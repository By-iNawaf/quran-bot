const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('عرض مدة الاستجابة'),
  async execute(interaction) {
    await interaction.reply(`🏓 Ping: ${interaction.client.ws.ping}ms`);
  }
};
