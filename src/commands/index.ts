import { devCommand } from '@/commands/dev';
import type { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { EventEmitter } from 'events';

export const Commands = [devCommand] as Command[];

export interface Command {
  createCommand: () => SlashCommandBuilder;
  registerEvents: (emitter: EventEmitter) => void;
  executeCommand: (interaction: CommandInteraction) => Promise<void>;
}
