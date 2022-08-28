import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { downloadAuctionLots, isStringUrl, Logger } from '@/utils';
import { embedAuctionLot } from '@/embeds';
import { saveAuctionLot } from '@/database';
import { postAuctionLots } from '@/utils/postAuctionLots';

const DEFAULT_PERMISSIONS_INTEGER = 1099511627782;

const POST_LOTS_BUTTON_ID = 'post-lots';
const START_AUCTION_BUTTON_ID = 'start-auction';

export const auctionCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('auction')
      .setDescription('Auction Management | Officers Only')
      .setDefaultMemberPermissions(DEFAULT_PERMISSIONS_INTEGER);
  },
  executeCommand: async (interaction: CommandInteraction) => {
    const postLotsButton = new MessageButton()
      .setCustomId(POST_LOTS_BUTTON_ID)
      .setLabel('Post Lots')
      .setStyle('SECONDARY');
    const startAuctionButton = new MessageButton()
      .setCustomId(START_AUCTION_BUTTON_ID)
      .setLabel('Start Auction')
      .setStyle('SUCCESS');
    const actionRow = new MessageActionRow().addComponents([
      postLotsButton,
      startAuctionButton,
    ]);
    await interaction.reply({
      components: [actionRow],
      content: '**Auction Management**',
      ephemeral: true,
    });
  },
  registerEvents: (emitter: EventEmitter) => {
    emitter.addListener(
      POST_LOTS_BUTTON_ID,
      async (interaction: ButtonInteraction) => {
        await interaction.deferReply({
          ephemeral: true,
        });
        if (!interaction.channel) {
          await interaction.guild?.fetch();
          await interaction.guild?.channels.fetch();
          await interaction.channel!.fetch();
          if (!interaction.channel) {
            await interaction.editReply({
              content: 'Could not load text channel information.'
            });
            return;
          }
        }
        const res = await postAuctionLots(interaction.channel);
        if (!res) {
          await interaction.editReply({
            content: 'Failed to post lots.',
          });
          return;
        }
        await interaction.editReply({
          content: 'Successfully posted lots.',
        });
      },
    );
  },
};
