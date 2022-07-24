import type { AuctionLot } from '@/interfaces';
import { HexColorString, MessageEmbed } from 'discord.js';
import DotEnv from 'dotenv';

DotEnv.config();

const EMOTES = {
  COIN: process.env.EMOTE_COIN,
  CHECK: process.env.EMOTE_CHECK,
  CANCEL: process.env.EMOTE_CANCEL,
  LIST_ITEM: process.env.EMOTE_LIST_ITEM,
};

const EMBED_COLOR =
  (process.env.EMBED_COLOR as HexColorString) || ('#b072ff' as HexColorString);

export function embedAuctionLot(
  lotInfo: Omit<AuctionLot, 'messageId' | 'bids'>,
) {
  if (!lotInfo.startingBid) {
    return;
  }

  const fields: { name: string; value: string; inline?: boolean }[] = [
    {
      name: 'Starting Bid',
      value: `${EMOTES.COIN} ${lotInfo.startingBid.toLocaleString('en-us')}`,
      inline: true,
    },
  ];

  if (lotInfo.currentBid) {
    fields.push({
      name: 'Current Bid',
      value: `${EMOTES.COIN} ${lotInfo.currentBid.toLocaleString('en-us')}`,
      inline: true,
    });
  }

  if (lotInfo.currentLeaderId) {
    fields.push({
      name: 'Current Leader',
      value: `<@${lotInfo.currentLeaderId}>`,
      inline: true,
    });
  }

  if (lotInfo.paid) {
    fields.push({
      name: 'Paid',
      value: `${EMOTES.CHECK}`,
      inline: true,
    });
  }

  if (lotInfo.sent) {
    fields.push({
      name: 'Sent',
      value: `${EMOTES.CHECK}`,
      inline: true,
    });
  }

  return new MessageEmbed()
    .setTitle(lotInfo.title)
    .setDescription(lotInfo.description)
    .setImage(lotInfo.imageUrl ?? null)
    .setFields(fields)
    .setColor(EMBED_COLOR);
}
