import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { downloadAuctionLots, isStringUrl, Logger } from '@/utils';
import { embedAuctionLot } from '@/embeds';
import { saveAuctionLot } from '@/database';

const DEFAULT_PERMISSIONS_INTEGER = 1099511627782;

const POST_LOTS_BUTTON_ID = 'post-lots';
const UPDATE_LOTS_BUTTON_ID = 'update-lots';
const START_AUCTION_BUTTON_ID = 'start-auction';

export const auctionCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('auction')
      .setDescription('Auction Management | Officers Only')
      .setDefaultMemberPermissions(DEFAULT_PERMISSIONS_INTEGER);
  },
  executeCommand: async (interaction: CommandInteraction) => {
    const postLotsButton = new MessageButton()
      .setCustomId(POST_LOTS_BUTTON_ID)
      .setLabel('Post Lots')
      .setStyle('DANGER');

    const updateLotsButton = new MessageButton()
      .setCustomId(UPDATE_LOTS_BUTTON_ID)
      .setLabel('Update Lots')
      .setStyle('SECONDARY');
    const startAuctionButton = new MessageButton()
      .setCustomId(START_AUCTION_BUTTON_ID)
      .setLabel('Start Auction')
      .setStyle('SUCCESS');
    const actionRow = new MessageActionRow().addComponents([
      postLotsButton,
      updateLotsButton,
      startAuctionButton,
    ]);
    await interaction.reply({
      components: [actionRow],
      content: '**Auction Management**',
      ephemeral: true,
    });
  },
  registerEvents: (emitter: EventEmitter) => {},
};
