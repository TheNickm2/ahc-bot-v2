import {
  ButtonInteraction,
  CommandInteraction,
  GuildMemberRoleManager,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { getTopSellersAhc, getTopSellersUpc, Logger } from '@/utils';
import DotEnv from 'dotenv';

DotEnv.config();

const EMBED_COLOR = '#b072ff';

const TOP_SELLERS_BUTTON_ID = 'topSellers';
const CHECK_MY_STATUS_BUTTON_ID = 'checkMyStatus';
const VINNY_RAFFLE_BUTTON_ID = 'vinnyRaffle';
const SERVER_BOOSTER_BUTTON_ID = 'serverBooster';

export const infoCenterCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('infocenter')
      .setDescription('View data from the AHF Info Center within Discord!');
  },
  executeCommand: async (interaction: CommandInteraction) => {
    try {
      const embed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('AHF Info Center')
        .setURL(
          process.env.EMBED_AUTHOR_LINK ? process.env.EMBED_AUTHOR_LINK : '',
        )
        .setAuthor({
          name: 'AHF Info Center',
          iconURL: process.env.EMBED_AUTHOR_ICON
            ? process.env.EMBED_AUTHOR_ICON
            : undefined,
          url: process.env.EMBED_AUTHOR_LINK
            ? process.env.EMBED_AUTHOR_LINK
            : '',
        })
        .setDescription(
          'Click the buttons below to navigate the AHC Info Center right here within Discord (or click "AHF Info Center" above to open the full info center in your web browser!)\n\nThe AHC Info Center is typically updated at least once daily, but may not always show real-time data.',
        )
        .setTimestamp();

      const buttons = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(TOP_SELLERS_BUTTON_ID)
          .setLabel('Top Sellers')
          .setStyle('SECONDARY')
          .setEmoji('<a:coin:726992358251561091>'),
        new MessageButton()
          .setCustomId(CHECK_MY_STATUS_BUTTON_ID)
          .setLabel('Check My Status')
          .setStyle('SECONDARY')
          .setEmoji('<:info:985035960305745990>'),
        new MessageButton()
          .setCustomId(VINNY_RAFFLE_BUTTON_ID)
          .setLabel('Vinny Raffle Status')
          .setStyle('SECONDARY')
          .setEmoji('<:chilla:805218053360451686>'),
        new MessageButton()
          .setCustomId(SERVER_BOOSTER_BUTTON_ID)
          .setLabel('Server Boosters')
          .setStyle('SECONDARY')
          .setEmoji('<a:nitroboostspin:909698016141778966>'),
      );

      await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true,
      });
    } catch (err) {
      Logger.error(err);
    }
  },
  registerEvents: (emitter: EventEmitter) => {
    emitter.on(
      TOP_SELLERS_BUTTON_ID,
      async (interaction: ButtonInteraction) => {
        try {
          await interaction.deferReply();
          const topSellersAhc = await getTopSellersAhc();
          const topSellersUpc = await getTopSellersUpc();
          if (!topSellersAhc || !topSellersUpc) {
            await interaction.deleteReply();
            await interaction.followUp({
              ephemeral: true,
              content: 'An error occurred while handling this request.',
            });
            return;
          }

          let ahcSellerString = '';
          topSellersAhc.forEach((amount, sellerName) => {
            ahcSellerString += `${sellerName} (${amount.toLocaleString(
              'en-US',
            )})\n`;
          });

          let upcSellerString = '';
          topSellersUpc.forEach((amount, sellerName) => {
            upcSellerString += `${sellerName} (${amount.toLocaleString(
              'en-US',
            )})\n`;
          });

          const embed = new MessageEmbed()
            .setTitle('Top Sellers')
            .setColor(EMBED_COLOR)
            .setAuthor({
              name: 'AHF Info Center',
              iconURL: process.env.EMBED_AUTHOR_ICON
                ? process.env.EMBED_AUTHOR_ICON
                : undefined,
              url: process.env.EMBED_AUTHOR_LINK
                ? process.env.EMBED_AUTHOR_LINK
                : '',
            })
            .setThumbnail(
              'https://cdn.discordapp.com/emojis/726992358251561091.gif',
            )
            .addField('AHC Top Sellers', ahcSellerString)
            .addField('UPC Top Sellers', upcSellerString)
            .setFooter({
              text: `Requested by ${interaction.user.username}#${interaction.user.discriminator}`,
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [embed],
          });
        } catch (err) {
          Logger.error(err);
        }
      },
    );

    emitter.on(
      CHECK_MY_STATUS_BUTTON_ID,
      async (interaction: ButtonInteraction) => {},
    );

    emitter.on(
      VINNY_RAFFLE_BUTTON_ID,
      async (interaction: ButtonInteraction) => {},
    );

    emitter.on(
      SERVER_BOOSTER_BUTTON_ID,
      async (interaction: ButtonInteraction) => {
        try {
          await interaction.deferReply({
            ephemeral: true,
          });
          const guild = interaction.guild;
          await guild?.members.fetch();
          await guild?.roles.fetch();
          const role = guild?.roles.premiumSubscriberRole;
          if (!role) {
            await interaction.editReply({
              content: `An error occurred while handling this command. Please try again later!`,
            });
            return;
          }
          const memberList = role.members.sort((a, z) =>
            a.displayName > z.displayName ? 1 : -1,
          );
          const boostersListString = memberList.reduce((acc, member) => {
            return `${acc}\n<a:nitroboostspin:909698016141778966> ${member.toString()}`;
          }, '');

          await interaction.editReply({
            content: `HUGE THANK YOU to our server boosters, listed below:${boostersListString}\n\nMany of the great features of our Discord server would be impossible to use without the support of these amazing server boosters!`,
          });
        } catch (err) {
          Logger.error(err);
        }
      },
    );
  },
};
