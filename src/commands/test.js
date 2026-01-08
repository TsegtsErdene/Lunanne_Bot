import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder
} from "discord.js";

export async function test(interaction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral
  });



  const textComponent = new TextDisplayBuilder().setContent('# this is text bby');
  
  const sepComp = new SeparatorBuilder();

  const btn = new ButtonBuilder()
      .setCustomId("testt")
      .setLabel("wuwu")
      .setStyle(ButtonStyle.Secondary)

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("test")
      .setLabel("wowo")
      .setStyle(ButtonStyle.Secondary)
  );

    const sectionComp = new SectionBuilder()
    .addTextDisplayComponents(textComponent,textComponent,textComponent)
    .setButtonAccessory(new ButtonBuilder()
      .setCustomId("testtt")
      .setLabel("wuasaswu")
      .setStyle(ButtonStyle.Secondary));

    const containerComp = new ContainerBuilder()
        .addTextDisplayComponents(textComponent,textComponent)
        .addSectionComponents(sectionComp)

    const section2 =  new SectionBuilder()
    .addTextDisplayComponents(textComponent,textComponent,textComponent);
    
    const cont = new ContainerBuilder().addTextDisplayComponents(textComponent,textComponent)


  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
    components: [textComponent,sepComp,row,containerComp,cont,cont],
  });
}
