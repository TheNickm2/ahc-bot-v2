import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { EventEmitter } from 'events';

export const TEMPLATECommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('cmdName')
      .setDescription('cmdDescription');
  },
  executeCommand: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      ephemeral: true,
      content: 'response',
    });
  },
  registerEvents: (emitter: EventEmitter) => {},
};
