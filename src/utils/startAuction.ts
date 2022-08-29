import { getAllAuctionLots } from '@/database';
import { embedAuctionSummary } from '@/embeds';
import { activateAuction, initializeAuctionEndJob, Logger } from '@/utils';
import { setRedisKeyValue } from '@/utils/redis';
import {
  MessageActionRow,
  MessageButton,
  TextBasedChannel,
  TextChannel,
} from 'discord.js';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { endAuction } from '@/utils/endAuction';

dotenv.config();

export const BID_BUTTON_ID_PREFIX = 'bid-';

export async function startAuction(
  endDate: Date,
  announcement: string,
  channel: TextChannel,
) {
  try {
    // Add "bid" buttons to each lot
    const auctionLots = await getAllAuctionLots();
    if (!auctionLots?.length) return;
    auctionLots.forEach(async (lot) => {
      const msg = await channel.messages.fetch(lot.id);
      if (!msg) return;
      const button = new MessageButton()
        .setCustomId(`${BID_BUTTON_ID_PREFIX}${lot.id}`)
        .setLabel('Place Bid')
        .setStyle('SECONDARY')
        .setEmoji(process.env.EMOTE_COIN || '<a:coin:726992358251561091>');
      const editResult = await msg.edit({
        components: [new MessageActionRow().addComponents([button])],
      });
      if (!editResult) return;
    });

    // Post auction embed to channel
    const summaryEmbed = embedAuctionSummary({
      auctionLots,
      channel,
      endDate,
    });
    await channel.send({
      embeds: [summaryEmbed],
    });

    // Set redis keys for auction activation status & end date
    // Also set a job to end the auction after the end date
    await activateAuction(endDate, channel.client, channel);

    // Post announcement in announcement channel
    const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;
    if (!announcementChannelId) return;
    await channel.guild.fetch();
    await channel.guild.channels.fetch();
    const announcementChannel = channel.guild.channels.cache.get(
      announcementChannelId,
    ) as TextChannel;
    if (!announcementChannel) return;
    const announcementMentionIds: string[] | undefined = JSON.parse(
      process.env.ANNOUNCEMENT_MENTION_ROLES || '[]',
    ) as string[];
    let mentionString = '';
    if (announcementMentionIds?.length) {
      mentionString =
        announcementMentionIds.map((id) => `<@&${id}>`).join(' ') + ' ';
    }
    await announcementChannel.send({
      content: `${mentionString}${announcement}`,
    });
    return true;
  } catch (error) {
    Logger.error(error);
  }
}
