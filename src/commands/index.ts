import { auctionCommand } from '@/commands/auction';
import { devCommand } from '@/commands/dev';
import { infoCenterCommand } from '@/commands/infocenter';
import { rollCommand } from '@/commands/roll';
import type { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
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
  executeCommand: (interaction: CommandInteraction) => Promise<void>;
}
