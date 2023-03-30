import type { IAuctionLot } from '@/database';
import { EmbedBuilder, TextChannel } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const coinEmote = process.env.EMOTE_COIN;

type embedAuctionSummaryProps = {
  auctionLots: IAuctionLot[];
  channel: TextChannel;
  endDate: Date;
};

export function embedAuctionSummary({
  auctionLots,
  channel,
  endDate,
}: embedAuctionSummaryProps) {
  const lots: { name: string; value: string; inline?: boolean }[] = [];
  auctionLots.forEach((auctionLot, index) => {
    lots.push({
      name: `Lot #${index + 1} | ${auctionLot.title}`,
      value: `[Jump to lot →](https://discord.com/channels/${
        channel.guild.id
      }/${channel.id}/${auctionLot.id ?? ''})`,
    });
  });

  const auctionActive = endDate > new Date();
  const endTimestamp = Math.round(endDate.getTime() / 1000);

  return new EmbedBuilder()
    .setTitle(`Auction Summary ${coinEmote}`)
    .setDescription(
      `${
        (auctionActive
          ? `**Auction Ends <t:${endTimestamp}:R>**\n`
          : `Auction Ended <t:${endTimestamp}:R>\n`) +
        (auctionActive
          ? `Get your bids in before <t:${endTimestamp}:f> (your local time) ⏰`
          : 'Winners - Please deposit to the AHC or UPC guild bank. Guests may mail gold to <@408464948306509824>. Items will be mailed after deposits are verified!')
      }`,
    )
    .setFooter({ text: 'Last updated' })
    .setTimestamp()
    .setColor('#b072ff')
    .addFields(...lots);
}
