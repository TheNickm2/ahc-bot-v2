import { getAuctionLot } from '@/database';
import { BID_BUTTON_ID_PREFIX, Logger } from '@/utils';
import {
  ButtonInteraction,
  ActionRowBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import EventEmitter from 'events';
import { v4 as v4Uuid } from 'uuid';

export async function handleBidButtonEvent(
  interaction: ButtonInteraction,
  emitter: EventEmitter,
) {
  try {
    await interaction.deferReply({
      ephemeral: true,
    });
    const lotId = interaction.customId?.replace(BID_BUTTON_ID_PREFIX, '');
    if (!lotId) return;
    const lot = await getAuctionLot(lotId);
    if (!lot) return;
    const uuid = v4Uuid();
    const modal = new ModalBuilder()
      .setTitle(`Bid on ${lot.title}`)
      .setCustomId(`${BID_BUTTON_ID_PREFIX}${uuid}`)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(`bidAmount`)
            .setLabel('Bid Amount (Numbers Only)')
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        ),
      );
    emitter.addListener(`${BID_BUTTON_ID_PREFIX}${uuid}`, async (interaction: ModalSubmitInteraction) => {
      await handleBidModalSubmit(interaction);
    });
    await interaction.showModal(modal);
    return true;
  }
  catch (err) {
    Logger.error(err);
  }
}

async function handleBidModalSubmit(interaction: ModalSubmitInteraction) {

}
