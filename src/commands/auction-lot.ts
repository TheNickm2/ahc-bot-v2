import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import type { EventEmitter } from 'events';

const MODAL_ID = 'auction-lot-create';

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
          .setDescription('edit'),
      );
  },
  executeCommand: async (interaction: ChatInputCommandInteraction) => {
  },
  registerEvents: (emitter: EventEmitter) => {
    emitter.on(MODAL_ID, (interaction: ModalSubmitInteraction) => {
      // TODO: handle modal submit
    });
  },
};
