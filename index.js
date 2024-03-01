const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
  Partials,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.GuildMember],
});

client.once("ready", () => {
  console.log("Bot is Ready!");
  console.log("Code by Wick Studio");
  console.log("discord.gg/wicks");
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!bc") || message.author.bot) return;

  if (
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    return message.reply({
      content: "ليس لديك صلاحية لاستخدام هذا الامر.",
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("لوحة تحكم البرودكاست")
    .setDescription("الرجاء اختيار نوع الارسال للاعضاء.");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("send_all")
      .setLabel("ارسل للجميع")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("send_online")
      .setLabel("ارسل للمتصلين")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("send_offline")
      .setLabel("ارسل للغير المتصلين")
      .setStyle(ButtonStyle.Danger),
  );

  await message.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    let customId;
    if (interaction.customId === "send_all") {
      customId = "modal_all";
    } else if (interaction.customId === "send_online") {
      customId = "modal_online";
    } else if (interaction.customId === "send_offline") {
      customId = "modal_offline";
    }

    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle("Type your message");

    const messageInput = new TextInputBuilder()
      .setCustomId("messageInput")
      .setLabel("اكتب رسالتك هنا")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(messageInput));

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit()) {
    const message = interaction.fields.getTextInputValue("messageInput");

    const guild = interaction.guild;
    if (!guild) return;

    if (interaction.customId === "modal_all") {
      await guild.members.fetch().then((members) => {
        members.forEach((member) => {
          if (!member.user.bot) {
            member.send(message).catch(console.error);
          }
        });
      });
    } else if (interaction.customId === "modal_online") {
      await guild.members.fetch().then((members) => {
        members.forEach((member) => {
          if (
            !member.user.bot &&
            member.presence &&
            member.presence.status !== "offline"
          ) {
            member.send(message).catch(console.error);
          }
        });
      });
    } else if (interaction.customId === "modal_offline") {
      await guild.members.fetch().then((members) => {
        members.forEach((member) => {
          if (
            !member.user.bot &&
            (!member.presence || member.presence.status === "offline")
          ) {
            member.send(message).catch(console.error);
          }
        });
      });
    }

    await interaction.reply({
      content: "Message sent successfully.",
      ephemeral: true,
    });
  }
});


client.login(process.env.TOKEN);
