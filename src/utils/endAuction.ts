import { getAllAuctionLots, saveHistoricalLot } from '@/database';
import { embedAuctionLot } from '@/embeds';
import { getRedisKeyValue, Logger, setRedisKeyValue } from '@/utils';
import type { Client } from 'discord.js';

export async function endAuction(client: Client) {
  try {
    const setAuctionActivePromise = setRedisKeyValue('auctionActive', 'false');
    const setAuctionEndDatePromise = setRedisKeyValue('auctionEndDate', '');
    const [setActiveResult, setEndDateResult] = await Promise.all([
      setAuctionActivePromise,
      setAuctionEndDatePromise,
    ]);
    if (!setActiveResult || !setEndDateResult) return;

    const auctionChannelId = await getRedisKeyValue('auctionChannelId');
    if (!auctionChannelId) return;
    const deleteChannelIdResult = await setRedisKeyValue(
      'auctionChannelId',
      '',
    );
    if (!deleteChannelIdResult) return;

    const channel = await client.channels.fetch(auctionChannelId);
    if (!channel || !channel.isText()) return;

    const allAuctionLots = await getAllAuctionLots();
    if (!allAuctionLots?.length) return;

    allAuctionLots.forEach(async (lot) => {
      const message = await channel.messages.fetch(lot.id);
      if (!message) return;

      const updatedEmbed = embedAuctionLot(lot, true) ?? message.embeds[0]; // fallback to original embed if no updated embed is returned
      const msgUpdateResult = await message.edit({
        embeds: [updatedEmbed],
        components: [],
      });
      if (!msgUpdateResult) return;

      const historicalLotResult = await saveHistoricalLot({
        title: lot.title || 'Unable to retrieve title',
        description: lot.description || 'Unable to retrieve description',
        startingBid: lot.startingBid || -1,
        winningBid: lot.currentBid || -1,
        winnerId: lot.currentLeader || 'No winner',
        id: lot.id,
        auctionEnd: new Date(),
      });
      if (!historicalLotResult) return;
    });

    const winMsg = `**The auction has ended**! Congratulations to the winners below:${allAuctionLots.reduce(
      (acc, curr) =>
        acc +
        `\n**${curr.title}:** ${
          curr.currentLeader ? `<@${curr.currentLeader}>` : 'No winner'
        }`,
      '',
    )}`;
    const winMsgResult = await channel.send(winMsg);
  } catch (err) {
    Logger.error(err);
    if (err instanceof Error) {
      Logger.debug(err.stack);
    }
  }
}
