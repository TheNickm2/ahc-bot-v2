import {
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  TextChannel,
  TextInputStyle,
} from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
} from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { Logger } from '@/utils';
import { embedAuctionLot } from '@/embeds';
import { getDatabaseHashTable, setDatabaseHashTable } from '@/utils/database';
import { AuctionLot } from '@/interfaces';

const MODAL_ID_ADD = 'modal-auction-lot-add';
const MODAL_ID_EDIT = 'modal-auction-lot-edit';
const MODAL_ID_BID = 'modal-place-bid';
const PLACE_BID_BUTTON_ID = 'button-place-bid';

export const auctionLotCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('auction-lot')
      .setDescription('Auction lot commands for officers.')
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('add')
          .setDescription('add'),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('edit')
          .setDescription('edit')
          .addStringOption((option) =>
            option
              .setName('message-id')
              .setDescription(
                'The message ID of the auction lot you wish to edit',
              )
              .setRequired(true),
          ),
      );
  },
  executeCommand: async (interaction: ChatInputCommandInteraction) => {
    try {
      const subCommand = interaction.options.getSubcommand(true);
      if (!subCommand) {
        throw 'Subcommand is required.';
      }
      switch (subCommand) {
        case 'add': {
          await addAuctionLotCommand(interaction);
        }
        case 'edit': {
          await editAuctionLotCommand(interaction);
        }
      }
    } catch (err) {
      Logger.error(err);
    }
  },
  registerEvents: (emitter: EventEmitter) => {
    // modal submit/button click event handlers
    emitter.on(MODAL_ID_ADD, addAuctionLotModal); // add lot modal
    emitter.on(MODAL_ID_EDIT, editAuctionLotModal); // edit lot modal
    emitter.on(PLACE_BID_BUTTON_ID, placeBidButton); // place bid button
    emitter.on(MODAL_ID_BID, placeBidModal); // place bid modal
  },
};

async function addAuctionLotCommand(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL_ID_ADD)
    .setTitle('Add an Auction Lot')
    .addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Title')
          .setPlaceholder('Your Awesome Title Goes Here')
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ]),
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Description')
          .setPlaceholder('Your awesome description goes here...')
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph),
      ]),
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('startingBid')
          .setLabel('Starting Bid')
          .setPlaceholder('1000000')
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ]),
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('imageUrl')
          .setLabel('Image Url')
          .setPlaceholder('https://i.imgur.com/yourawesomeimage.jpg')
          .setRequired(false)
          .setStyle(TextInputStyle.Short),
      ]),
    ]);
  await interaction.showModal(modal);
}

async function editAuctionLotCommand(interaction: ChatInputCommandInteraction) {
  const auctionLotId = interaction.options.getString('message-id', true);
  if (!auctionLotId) {
    await interaction.reply({
      ephemeral: true,
      content: 'A valid message ID is required to edit an auction lot.',
    });
    return;
  }
  const auctionLotMsg = await (
    (await interaction.guild?.channels.fetch(
      interaction.channelId,
    )) as TextChannel
  ).messages.fetch(auctionLotId);

  if (!auctionLotMsg) {
    await interaction.reply({
      ephemeral: true,
      content: `Unable to retrieve a Discord message with the ID ${auctionLotId}.`,
    });
    return;
  }

  const auctionLot = (await getDatabaseHashTable(auctionLotId)) as
    | AuctionLot
    | undefined;

  if (!auctionLot) {
    await interaction.reply({
      ephemeral: true,
      content: 'Unable to retrieve auction lot info from the database.',
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(MODAL_ID_EDIT)
    .setTitle(`Edit ${auctionLot.title}`)
    .addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Title')
          .setPlaceholder('Your Awesome Title Goes Here')
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
          .setValue(auctionLot.title),
      ]),
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Description')
          .setPlaceholder('Your awesome description goes here...')
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph)
          .setValue(auctionLot.description),
      ]),
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('startingBid')
          .setLabel('Starting Bid')
          .setPlaceholder('1000000')
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
          .setValue(auctionLot.startingBid.toString()),
      ]),
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('imageUrl')
          .setLabel('Image Url')
          .setPlaceholder('https://i.imgur.com/yourawesomeimage.jpg')
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
          .setValue(auctionLot.imageUrl),
      ]),
    ]);

  await interaction.showModal(modal);
}

async function addAuctionLotModal(interaction: ModalSubmitInteraction) {
  const fieldValues = {
    title: interaction.fields.getTextInputValue('title'),
    description: interaction.fields.getTextInputValue('description'),
    startingBid: Number(
      interaction.fields
        .getTextInputValue('startingBid')
        .replaceAll(',', '')
        .trim(),
    ),
    imageUrl: interaction.fields.getTextInputValue('imageUrl'),
  };

  if (!fieldValues.startingBid || fieldValues.startingBid < 1) {
    await interaction.reply({
      ephemeral: true,
      content: `Starting Bid should be a positive integer`,
    });
    return;
  }

  const auctionEmbed = embedAuctionLot(fieldValues);

  if (!auctionEmbed) {
    await interaction.reply({
      ephemeral: true,
      content: 'An error occurred while building the Auction Lot embed.',
    });
    return;
  }

  await interaction.reply({
    embeds: [auctionEmbed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setCustomId(PLACE_BID_BUTTON_ID)
          .setEmoji({ name: '💸' })
          .setLabel('Place Bid')
          .setStyle(ButtonStyle.Secondary),
      ]),
    ],
  });

  const reply = await interaction.fetchReply();

  const auctionLot: AuctionLot = {
    messageId: reply.id,
    ...fieldValues,
  };

  const result = await setDatabaseHashTable(auctionLot.messageId, auctionLot);

  if (!result) {
    await interaction.deleteReply();
    await interaction.followUp({
      ephemeral: true,
      content: `A database error occurred while creating the auction lot.`,
    });
  }
}

async function editAuctionLotModal(interaction: ModalSubmitInteraction) {}

async function placeBidButton(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId(MODAL_ID_BID)
    .setTitle('Place Bid')
    .addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId('bid')
          .setLabel('Bid Amount')
          .setPlaceholder('100000')
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
      ]),
    ]);
  await interaction.showModal(modal);
}

async function placeBidModal(interaction: ModalSubmitInteraction) {}
