import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  ButtonStyle,
  TextInputStyle,
  SlashCommandBuilder,
} from 'discord.js';
import type { EventEmitter } from 'events';
import { startAuction } from '@/utils';
import { getAllAuctionLots } from '@/database';
import { postAuctionLots } from '@/utils/postAuctionLots';
import Sugar from 'sugar';

const DEFAULT_PERMISSIONS_INTEGER = 1099511627782;

const POST_LOTS_BUTTON_ID = 'post-lots';
const START_AUCTION_BUTTON_ID = 'start-auction';

const START_AUCTION_MODAL_ID = 'start-auction-modal';

const START_MODAL_END_DATE_INPUT_ID = 'start-modal-date-input';
const START_MODAL_ANNOUNCEMENT_INPUT_ID = 'start-modal-announcement-input';

export const auctionCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('auction')
      .setDescription('Auction Management | Officers Only')
      .setDefaultMemberPermissions(DEFAULT_PERMISSIONS_INTEGER);
  },
  executeCommand: async (interaction: ChatInputCommandInteraction) => {
    const postLotsButton = new ButtonBuilder()
      .setCustomId(POST_LOTS_BUTTON_ID)
      .setLabel('Post Lots')
      .setStyle(ButtonStyle.Secondary);
    const startAuctionButton = new ButtonBuilder()
      .setCustomId(START_AUCTION_BUTTON_ID)
      .setLabel('Start Auction')
      .setStyle(ButtonStyle.Success);
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
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
              content: 'Could not load text channel information.',
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

    emitter.addListener(
      START_AUCTION_BUTTON_ID,
      async (interaction: ButtonInteraction) => {
        const lots = await getAllAuctionLots();
        if (!lots?.length) {
          await interaction.reply({
            content:
              'No auction lots found in the database. Please ensure you have posted the lots from the Google Sheet first.',
            ephemeral: true,
          });
          return;
        }
        const modal = new ModalBuilder()
          .setCustomId(START_AUCTION_MODAL_ID)
          .setTitle('Start Auction')
          .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId(START_MODAL_END_DATE_INPUT_ID)
                .setLabel('Auction End Date (Eastern Time)')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Saturday at 8PM'),
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId(START_MODAL_ANNOUNCEMENT_INPUT_ID)
                .setLabel('Auction Announcement Message')
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(
                  'Message to be sent to all users when the auction starts.',
                ),
            ),
          );
        await interaction.showModal(modal);
      },
    );

    emitter.addListener(
      START_AUCTION_MODAL_ID,
      async (interaction: ModalSubmitInteraction) => {
        await interaction.deferReply({
          ephemeral: true,
        });
        const endDateInput = interaction.fields.getTextInputValue(
          START_MODAL_END_DATE_INPUT_ID,
        );
        const announcementInput = interaction.fields.getTextInputValue(
          START_MODAL_ANNOUNCEMENT_INPUT_ID,
        );
        if (!endDateInput?.trim().length) {
          await interaction.editReply({
            content: 'Please enter an auction end date.',
          });
          return;
        } else if (!announcementInput?.trim().length) {
          await interaction.editReply({
            content: 'Please enter an auction announcement message.',
          });
          return;
        }
        const endDate = Sugar.Date.create(endDateInput.trim());
        if (!endDate || !Sugar.Date.isFuture(endDate)) {
          await interaction.editReply({
            content: 'Provided end date was in the past or invalid.',
          });
          return;
        }
        if (!interaction.channel) {
          await interaction.guild?.fetch();
          await interaction.guild?.channels.fetch();
          await interaction.channel!.fetch();
          if (!interaction.channel) {
            await interaction.editReply({
              content: 'Could not load text channel information.',
            });
            return;
          }
        }
        const result = await startAuction(endDate, announcementInput.trim(), interaction.channel as TextChannel, emitter);
      },
    );
  },
};
