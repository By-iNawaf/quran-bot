const { SlashCommandBuilder, ChannelType } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fixestup')
    .setDescription('إصلاح صلاحيات لوحة التحكم'),
  
  async execute(interaction) {
    const guild = interaction.guild;

    // البحث عن التصنيف
    const category = guild.channels.cache.find(c => c.name === config.categoryName && c.type === ChannelType.GuildCategory);
    if (!category) {
      return interaction.reply({ content: '❌ التصنيف المطلوب غير موجود.', ephemeral: true });
    }

    // البحث عن القناة النصية ضمن التصنيف
    const textChannel = guild.channels.cache.find(
      c => c.parentId === category.id && c.name === config.controlChannelName && c.type === ChannelType.GuildText
    );
    if (!textChannel) {
      return interaction.reply({ content: '❌ القناة النصية المطلوبة غير موجودة.', ephemeral: true });
    }

    // البحث عن القناة الصوتية ضمن التصنيف
    const voiceChannel = guild.channels.cache.find(
      c => c.parentId === category.id && c.name === config.voiceChannelName && c.type === ChannelType.GuildVoice
    );
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ القناة الصوتية المطلوبة غير موجودة.', ephemeral: true });
    }

    try {
      // إعادة ضبط صلاحيات القناة النصية
      await textChannel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false,
        ViewChannel: true
      });

      await textChannel.permissionOverwrites.edit(interaction.client.user.id, {
        SendMessages: true,
        ViewChannel: true
      });

      // إعادة ضبط صلاحيات القناة الصوتية
      await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
        Speak: false,
        Stream: false,
        Connect: true,
        ViewChannel: true
      });

      await voiceChannel.permissionOverwrites.edit(interaction.client.user.id, {
        Speak: true,
        Connect: true,
        ViewChannel: true
      });

      await interaction.reply({ content: '✅ تم إصلاح صلاحيات لوحة التحكم بنجاح.', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ حدث خطأ أثناء إصلاح الصلاحيات.', ephemeral: true });
    }
  }
};
