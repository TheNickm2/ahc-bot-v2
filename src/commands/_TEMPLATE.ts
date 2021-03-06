import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';

export const TEMPLATECommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('cmdName')
      .setDescription('cmdDescription');
  },
  executeCommand: async (interaction: CommandInteraction) => {
    await interaction.reply({
      ephemeral: true,
      content: 'response',
    });
  },
  registerEvents: (emitter: EventEmitter) => {},
};
