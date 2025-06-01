const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('معلومات عن البوت'),

  async execute(interaction) {
    const infoMessage = `
🤖 **بوت تشغيل القرآن**
لوحة تحكم، تشغيل مباشر، أزرار تفاعلية.

> مطور البوت: **BY Nawaf**
`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('سيرفر الدعم')
        .setStyle(ButtonStyle.Link) // مهم: زر رابط لازم يكون Link
        .setEmoji('🔗')
        .setURL('https://discord.gg/mZhfMguX4G'),

      new ButtonBuilder()
        .setLabel('مطور البوت Nawaf')
        .setStyle(ButtonStyle.Link) // أيضاً زر رابط
        .setEmoji('👨‍💻')
        .setURL('https://discord.com/users/732540761295421480')
    );

    await interaction.reply({ content: infoMessage.trim(), components: [row] });
  }
};
