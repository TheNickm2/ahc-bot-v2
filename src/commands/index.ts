import { auctionCommand } from '@/commands/auction';
import { devCommand } from '@/commands/dev';
import { infoCenterCommand } from '@/commands/infocenter';
import { rollCommand } from '@/commands/roll';
import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { EventEmitter } from 'events';

export const Commands = [
  devCommand,
  rollCommand,
  auctionCommand,
  infoCenterCommand,
] as Command[];

export interface Command {
  createCommand: () => SlashCommandBuilder;
  registerEvents: (emitter: EventEmitter) => void;
  executeCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
