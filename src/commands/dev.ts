import {
  ButtonInteraction,
  CommandInteraction,
  version as djsVersion,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { version as tsVersion } from 'typescript';
import fileSize from 'filesize';
import { Logger } from '@/utils';
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
  executeCommand: async (interaction: CommandInteraction) => {
    const memory = process.memoryUsage();

    const devVars: embedDevInfoParams = {
      nodeVersion: process.version,
      tsVersion,
      djsVersion,
      heapSize: fileSize(memory.heapTotal),
      heapUsed: fileSize(memory.heapUsed),
      hostname: os.hostname(),
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
