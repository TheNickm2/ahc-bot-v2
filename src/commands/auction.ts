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
import { isStringUrl, Logger } from '@/utils';
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
    const result = await saveAuctionLot({
      id: interaction.guild?.id ?? '01',
      title: interaction.user.username,
      description: interaction.user.toString(),
      startingBid: 696969,
      currentLeader: interaction.user.id,
      currentBid: 5256000
    });
    console.log(result);
    await interaction.reply({
      ephemeral: true,
      content: 'response',
    });
  },
  registerEvents: (emitter: EventEmitter) => {},
};
