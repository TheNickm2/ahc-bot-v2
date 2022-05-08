import {
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collection,
  TextChannel,
} from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from '@discordjs/builders';
import type { EventEmitter } from 'events';
import { Logger } from '@/utils';

const MIN_VALUE = 1;
const BUTON_ID = '';

const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const msgOptions: Collection<string, ChatInputCommandInteraction> = new Collection();

const getResponseString = (qty: number, sides: number) => {
  let results = '';
  for (let i = 0; i < qty; i++) {
    const result = randomInteger(MIN_VALUE, sides);
    const resultString = `${'`'}Roll #${i + 1}:${'`'} **${result}**\n`;
    results += resultString;
  }
  return results;
};

export const rollCommand = {
  createCommand: () => {
    return new SlashCommandBuilder()
      .setName('roll')
      .setDefaultPermission(true)
      .setDescription(
        'Roll a die with the specified number of sides (Default 6)',
      )
      .addIntegerOption((option) =>
        option.setName('sides').setDescription('Number of sides on the die'),
      )
      .addNumberOption((option) =>
        option
          .setName('qty')
          .setDescription('How many rolls should we do? (Max 10)'),
      );
  },
  executeCommand: async (interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.deferReply();

      const qty = Number(interaction.options.get('qty')?.value ?? 1);
      if (qty > 10) {
        await interaction.editReply({
          content: `If you'd have paid attention to the command, you'd have known that ${qty} is more than the maximum quantity of 10 😉`,
        });
        return;
      }

      const componentRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setCustomId('reroll')
          .setEmoji({
            name: '🎲',
          })
          .setLabel('Reroll')
          .setStyle(ButtonStyle.Secondary),
      ]);

      const interactionReply = await interaction.fetchReply();
      if (!interactionReply) {
        throw 'Failed to properly fetch interaction reply information.';
      }

      const sides = (interaction.options.get('sides', false)?.value ??
        6) as number;

      msgOptions.set(interactionReply.id, interaction);

      const resultString = getResponseString(qty, sides);

      if (!resultString) {
        await interaction.editReply({
          content: `An error occurred while performing this command.`,
        });
        return;
      }

      await interaction.editReply({
        content: `__Rolled ${qty} x d**${sides}**__... <a:dice:954277834845741077>\n\n${resultString}`,
        components: [componentRow],
      });
    } catch (err) {
      if (err) {
        Logger.error(
          `An error occurred while executing the ${interaction.command?.name} command:\n${err}`,
        );
      }
    }
  },
  registerEvents: (emitter: EventEmitter) => {
    emitter.on('reroll', async (interaction: ButtonInteraction) => {
      const previousInteraction = msgOptions.get(interaction.message?.id);
      if (!previousInteraction) {
        Logger.error(
          `Previous interaction failed to load from cache.\n${interaction.toJSON()}`,
        );
        return;
      }
      try {
        if (interaction.user.id !== previousInteraction.user.id) {
          await interaction.reply({
            ephemeral: true,
            content: `Only ${previousInteraction.user.toString()} may reroll that request. Start your own dice roll request with \`/roll\`!`,
          });
          return;
        }

        const prevMsg = await (
          (await interaction.guild?.channels.fetch(
            interaction.channelId,
          )) as TextChannel
        ).messages.fetch(interaction.message.id);

        if (prevMsg) {
          try {
            await prevMsg.edit({
              content: `**REROLLED**\n~~${prevMsg.content}~~`,
              components: [],
            });
          } catch {}
        } else {
          Logger.error(
            `Previous message failed to load:\ninteraction.channel: ${interaction.channel}\ninteraction.message.id: ${interaction.message.id}`,
          );
        }

        await interaction.deferReply();

        const qty = Number(previousInteraction.options.get('qty')?.value ?? 1);
        if (qty > 10) {
          await interaction.editReply({
            content: `If you'd have paid attention to the command, you'd have known that ${qty} is more than the maximum quantity of 10 😉`,
          });
          return;
        }

        const componentRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setCustomId('reroll')
              .setEmoji({ name: '🎲' })
              .setLabel('Reroll')
              .setStyle(ButtonStyle.Secondary),
          ]);

        const sides = (previousInteraction.options.get('sides', false)?.value ??
          6) as number;

        const resultString = getResponseString(qty, sides);

        if (!resultString) {
          await interaction.editReply({
            content: `An error occurred while performing this command.`,
          });
          return;
        }

        const interactionReply = await interaction.fetchReply();
        if (!interactionReply) {
          throw 'Failed to properly fetch interaction reply information.';
        }

        msgOptions.delete(interaction.message.id);
        msgOptions.set(interactionReply.id, previousInteraction);

        await interaction.editReply({
          content: `__Rolled ${qty} x d**${sides}**__... <a:dice:954277834845741077>\n\n${resultString}`,
          components: [componentRow],
        });
      } catch (err: any) {
        Logger.error(err);
      }
    });
  },
};
