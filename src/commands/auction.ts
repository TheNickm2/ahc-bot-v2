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
import { downloadAuctionLots, isStringUrl, Logger } from '@/utils';
import { embedAuctionLot } from '@/embeds';
import { saveAuctionLot } from '@/database';

const DEFAULT_PERMISSIONS_INTEGER = 1099511627782;

export const auctionCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('auction')
      .setDescription('Auction Management')
      .setDefaultMemberPermissions(DEFAULT_PERMISSIONS_INTEGER);
  },
  executeCommand: async (interaction: CommandInteraction) => {
  },
  registerEvents: (emitter: EventEmitter) => {},
};
