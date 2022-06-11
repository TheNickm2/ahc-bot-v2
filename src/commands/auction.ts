import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { Logger } from '@/utils';

const MODAL_TIMEOUT = 1000 * 60 * 10; // 10 minutes

const BUTTON_ID_ADD_LOT = 'addLot';
const BUTTON_ID_EDIT_LOT = 'editLot';
const BUTTON_ID_DELETE_LOT = 'deleteLot';
const BUTTON_ID_START_AUCTION = 'startAuction';
const BUTTON_ID_END_AUCTION = 'endAuction';
const BUTTON_ID_CLEAR_CHANNEL = 'clearChannel';

const MODAL_ID_ADD_LOT = 'addLotModal';
const MODAL_ID_EDIT_LOT = 'editLotModal';
const MODAL_ID_DELETE_LOT = 'deleteLotModal';

const FIELD_LOT_TITLE = 'lotTitle';
const FIELD_LOT_DESCRIPTION = 'lotDescription';
const FIELD_STARTING_BID = 'startingBid';
const FIELD_IMAGE_URL = 'imageUrl';
const FIELD_MSG_ID = 'msgId';

export const auctionCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('auction')
      .setDescription('(Officer Only) Setup & Configure Discord Auction')
      .setDefaultMemberPermissions(1099511627776);
  },
  executeCommand: async (interaction: CommandInteraction) => {
    const lotActionRow = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId(BUTTON_ID_ADD_LOT)
        .setLabel('Add Lot')
        .setStyle('SECONDARY')
        .setEmoji('<:add:985214992527790140>'),
      new MessageButton()
        .setCustomId(BUTTON_ID_EDIT_LOT)
        .setLabel('Edit Lot')
        .setStyle('SECONDARY')
        .setEmoji('<:edit:985215060823670815>'),
      new MessageButton()
        .setCustomId(BUTTON_ID_DELETE_LOT)
        .setLabel('Delete Lot')
        .setStyle('SECONDARY')
        .setEmoji('<:remove:985215299764772885>'),
    ]);
    const auctionActionRow = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId(BUTTON_ID_START_AUCTION)
        .setLabel('Start Auction')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId(BUTTON_ID_END_AUCTION)
        .setLabel('End Auction')
        .setStyle('DANGER'),
      new MessageButton()
        .setCustomId(BUTTON_ID_CLEAR_CHANNEL)
        .setLabel('Clear Channel')
        .setStyle('PRIMARY'),
    ]);

    await interaction.reply({
      ephemeral: true,
      components: [lotActionRow, auctionActionRow],
      content: `Use the menu below to manage the Discord auction.`,
    });
  },
  registerEvents: (emitter: EventEmitter) => {
    emitter.on(BUTTON_ID_ADD_LOT, async (interaction: ButtonInteraction) => {
      const modal = new Modal()
        .setCustomId(MODAL_ID_ADD_LOT)
        .setTitle('Add Lot')
        .addComponents(
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_LOT_TITLE)
              .setLabel('Lot Title')
              .setPlaceholder('Lot Title')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_LOT_DESCRIPTION)
              .setLabel('Lot Description')
              .setPlaceholder('Lot Description')
              .setStyle('PARAGRAPH')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_STARTING_BID)
              .setLabel('Starting Bid')
              .setPlaceholder('Starting Bid')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_IMAGE_URL)
              .setLabel('Image URL')
              .setPlaceholder('Image URL')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
        );
      await interaction.showModal(modal);
      const modalInteraction = await interaction.awaitModalSubmit({
        time: MODAL_TIMEOUT,
      });
      if (!modalInteraction) {
        return;
      }
    });

    emitter.on(BUTTON_ID_EDIT_LOT, async (interaction: ButtonInteraction) => {
      const modal = new Modal()
        .setCustomId(MODAL_ID_EDIT_LOT)
        .setTitle('Edit Lot')
        .addComponents(
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_MSG_ID)
              .setLabel('Lot Message ID')
              .setPlaceholder('1234567890123')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_LOT_TITLE)
              .setLabel('Lot Title')
              .setPlaceholder('Lot Title')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_LOT_DESCRIPTION)
              .setLabel('Lot Description')
              .setPlaceholder('Lot Description')
              .setStyle('PARAGRAPH')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_STARTING_BID)
              .setLabel('Starting Bid')
              .setPlaceholder('Starting Bid')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
          new MessageActionRow<TextInputComponent>().addComponents([
            new TextInputComponent()
              .setCustomId(FIELD_IMAGE_URL)
              .setLabel('Image URL')
              .setPlaceholder('Image URL')
              .setStyle('SHORT')
              .setRequired(true),
          ]),
        );
      await interaction.showModal(modal);
      const modalInteraction = await interaction.awaitModalSubmit({
        time: MODAL_TIMEOUT,
      });
      if (!modalInteraction) {
        return;
      }
    });

    emitter.on(
      BUTTON_ID_DELETE_LOT,
      async (interaction: ButtonInteraction) => {},
    );

    emitter.on(
      BUTTON_ID_START_AUCTION,
      async (interaction: ButtonInteraction) => {},
    );

    emitter.on(
      BUTTON_ID_END_AUCTION,
      async (interaction: ButtonInteraction) => {},
    );

    emitter.on(
      BUTTON_ID_CLEAR_CHANNEL,
      async (interaction: ButtonInteraction) => {},
    );
  },
};
