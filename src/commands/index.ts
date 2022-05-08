import { devCommand } from '@/commands/dev';
import { rollCommand } from '@/commands/roll';
import { auctionLotCommand } from '@/commands/auction-lot';
import type { SlashCommandBuilder } from '@discordjs/builders';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { EventEmitter } from 'events';

export const Commands = [
  devCommand,
  rollCommand,
  auctionLotCommand,
] as Command[];

export interface Command {
  createCommand: () => SlashCommandBuilder;
  registerEvents: (emitter: EventEmitter) => void;
  executeCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
