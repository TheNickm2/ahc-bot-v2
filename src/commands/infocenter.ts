import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { Logger } from '@/utils';
import DotEnv from 'dotenv';
import * as Cache from '@/cache';

DotEnv.config();

const EMBED_COLOR = '#b072ff';

const TOP_SELLERS_BUTTON_ID = 'topSellers';
const CHECK_MY_STATUS_BUTTON_ID = 'checkMyStatus';
const VINNY_RAFFLE_BUTTON_ID = 'vinnyRaffle';
const SERVER_BOOSTER_BUTTON_ID = 'serverBooster';
const SHARE_BOOSTER_BUTTON_ID = 'shareBooster';

const AHC_BANNER_EMOTE = '<:AHCbanner:975254289888968794>';
const UPC_BANNER_EMOTE = '<:UPCbanner:985742809606807553>';

const AHC_BANNER_IMAGE = 'https://media.discordapp.net/stickers/975254619657756702.png';
const UPC_BANNER_IMAGE = 'https://media.discordapp.net/stickers/985746042542764164.png';

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
          const {
            AHC: topSellersAhc,
            UPC: topSellersUpc,
            lastUpdated,
          } = Cache.getTopSellers();
          if (!topSellersAhc.size || !topSellersUpc.size) {
            await interaction.deleteReply();
            await interaction.followUp({
              ephemeral: true,
              content: 'An error occurred while handling this request.',
            });
            return;
          }

          let ahcSellerString = '';
          topSellersAhc.forEach((amount, sellerName) => {
            ahcSellerString += `${process.env.EMOTE_LIST_ITEM || '-'} ${sellerName} (${amount.toLocaleString(
              'en-US',
            )})\n`;
          });

          let upcSellerString = '';
          topSellersUpc.forEach((amount, sellerName) => {
            upcSellerString += `${process.env.EMOTE_LIST_ITEM || '-'} ${sellerName} (${amount.toLocaleString(
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
            .addField(`${AHC_BANNER_EMOTE} AHC Top Sellers`, ahcSellerString)
            .addField(`${UPC_BANNER_EMOTE} UPC Top Sellers`, upcSellerString)
            .setFooter({
              text: `Cache last updated`,
            })
            .setTimestamp(lastUpdated);

          await interaction.editReply({
            embeds: [embed],
          });
        } catch (err) {
          try {
            await interaction.deleteReply();
            await interaction.followUp({
              ephemeral: true,
              content: `An error occurred while handling this request.\n\n\`${err}\``,
            });
          } catch (e) {}
          Logger.error(err);
        }
      },
    );

    emitter.on(
      CHECK_MY_STATUS_BUTTON_ID,
      async (interaction: ButtonInteraction) => {
        await interaction.deferReply({
          ephemeral: true,
        });
        const { AHC, UPC, lastUpdated } = Cache.getMembers();
        if (!AHC.size || !UPC.size) {
          await interaction.editReply({
            content:
              'An error occurred while handling this request. Please try again later.',
          });
          return;
        }
        const discordMember = interaction.member as GuildMember;
        const memberName = discordMember.nickname
          ? discordMember.nickname
          : discordMember.user.username;
        const memberAhc = AHC.get(memberName.trim().toLowerCase());
        const memberUpc = UPC.get(memberName.trim().toLowerCase());
        if (!memberAhc && !memberUpc) {
          await interaction.editReply({
            content: `Unable to find a guild member with the name ${memberName}. If your Discord account name does not match your in-game account name, please set your nickname to match your in-game account name and try again.`,
          });
          return;
        }

        const raffleKey = Object.keys(memberAhc ?? memberUpc ?? {}).find(
          (key) => key.startsWith('Vinny Raffle Tickets'),
        );
        const bonusKey = Object.keys(memberAhc ?? memberUpc ?? {}).find((key) =>
          key.startsWith('Vinny Bonus Tickets'),
        );

        const ahcEmbed = memberAhc
          ? new MessageEmbed()
              .setTitle('Your AHC Status')
              .setAuthor({
                name: 'AHF Info Center',
                iconURL: process.env.EMBED_AUTHOR_ICON || '',
                url: process.env.EMBED_AUTHOR_LINK || '',
              })
              .setColor(EMBED_COLOR)
              .setDescription(
                `Hello ${memberName}! Check your AHC status below!`,
              )
              .addFields([
                {
                  name: 'User ID',
                  value: memberAhc.Who,
                  inline: true,
                },
                {
                  name: 'Sales',
                  value: memberAhc.Sales.toLocaleString('en-US'),
                  inline: true,
                },
                {
                  name: 'Requirements Met',
                  value: memberAhc.Safe
                    ? process.env.EMOTE_CHECK || 'Yes'
                    : process.env.EMOTE_CANCEL || 'No',
                  inline: true,
                },
                {
                  name: 'Vinny Raffle Tickets',
                  value: memberAhc[raffleKey ?? 'raffle'] ?? 0,
                  inline: true,
                },
                {
                  name: 'Vinny Bonus Tickets',
                  value: memberAhc[bonusKey ?? 'bonus'] ?? 0,
                  inline: true,
                },
                {
                  name: 'Mat Raffle Tickets',
                  value: memberAhc['Mat Raffle Tickets'] ?? 0,
                  inline: true,
                },
              ])
              .setThumbnail(AHC_BANNER_IMAGE)
              .setFooter({ text: `Cache last updated` })
              .setTimestamp(lastUpdated)
          : undefined;
        const upcEmbed = memberUpc
          ? new MessageEmbed()
              .setTitle('Your UPC Status')
              .setAuthor({
                name: 'AHF Info Center',
                iconURL: process.env.EMBED_AUTHOR_ICON || '',
                url: process.env.EMBED_AUTHOR_LINK || '',
              })
              .setColor(EMBED_COLOR)
              .setDescription(
                `Hello ${memberName}! Check your UPC status below!`,
              )
              .addFields([
                {
                  name: 'User ID',
                  value: memberUpc.Who,
                  inline: true,
                },
                {
                  name: 'Sales',
                  value: memberUpc.Sales.toLocaleString('en-US'),
                  inline: true,
                },
                {
                  name: 'Vinny Raffle Tickets',
                  value: memberUpc[raffleKey ?? 'raffle'] ?? 0,
                  inline: true,
                },
                {
                  name: 'Vinny Bonus Tickets',
                  value: memberUpc[bonusKey ?? 'bonus'] ?? 0,
                  inline: true,
                },
                {
                  name: 'Mat Raffle Tickets',
                  value: memberUpc['Mat Raffle Tickets'] ?? 0,
                  inline: true,
                },
              ])
              .setThumbnail(UPC_BANNER_IMAGE)
              .setFooter({ text: `Cache last updated` })
              .setTimestamp(lastUpdated)
          : undefined;

        const embeds: MessageEmbed[] = [];

        if (ahcEmbed) embeds.push(ahcEmbed);
        if (upcEmbed) embeds.push(upcEmbed);

        await interaction.editReply({
          embeds,
        });
      },
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

          const isOfficer =
            interaction.memberPermissions?.has('MODERATE_MEMBERS');
          const msgActionRow = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(SHARE_BOOSTER_BUTTON_ID)
              .setLabel('Share with Channel')
              .setStyle('SECONDARY'),
          );

          await interaction.editReply({
            content: `HUGE THANK YOU to our server boosters, listed below:${boostersListString}\n\nMany of the great features of our Discord server would be impossible to use without the support of these amazing server boosters!`,
            components: isOfficer ? [msgActionRow] : [],
          });
        } catch (err) {
          Logger.error(err);
        }
      },
    );
    emitter.on(
      SHARE_BOOSTER_BUTTON_ID,
      async (interaction: ButtonInteraction) => {
        interaction.reply({
          content: interaction.message.content,
        });
      },
    );
  },
};
