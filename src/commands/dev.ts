import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  version as djsVersion,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { version as tsVersion } from 'typescript';
import { filesize } from 'filesize';
import os from 'node:os';
import type { embedDevInfoParams } from '@/embeds';
import { embedDevInfo } from '@/embeds';

const DEV_BUTTON_ID = 'devButton';

export const devCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('dev')
      .setDescription('Information for developers');
  },
  executeCommand: async (interaction: ChatInputCommandInteraction) => {
    const memory = process.memoryUsage();

    const devVars: embedDevInfoParams = {
      nodeVersion: process.version,
      tsVersion,
      djsVersion,
      heapSize: filesize(memory.heapTotal).toString(),
      heapUsed: filesize(memory.heapUsed).toString(),
      hostname: os.hostname(),
      // services: {
      // },
      serverId: interaction.guildId ?? 'unknown',
      userId: interaction.user.id,
      developer: `<@${process.env.DEVELOPER_ID ?? 0}>`,
    };

    await interaction.reply({
      ephemeral: true,
      embeds: [embedDevInfo(devVars)],
    });
  },
  registerEvents: (emitter: EventEmitter) => {
    emitter.on(DEV_BUTTON_ID, async (interaction: ButtonInteraction) => {
      await interaction.reply({
        content: 'You clicked my button :o',
        ephemeral: true,
      });
    });
  },
};
