import { Logger } from '@/utils';
import { Schema, model, connection } from 'mongoose';

export interface IHistoricalLot {
  title: string;
  description: string;
  startingBid: number;
  winningBid: number;
  winnerId: string;
  id: string;
}

const historicalLotSchema = new Schema<IHistoricalLot>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startingBid: { type: Number, required: true },
  winningBid: { type: Number, required: true },
  winnerId: { type: String, required: true },
  id: { type: String, required: true, unique: true },
});

const HistoricalLot = model<IHistoricalLot>(
  'HistoricalLot',
  historicalLotSchema,
);

export async function getHistoricalLot(lotId: string) {
  try {
    const result = await HistoricalLot.findOne({ id: lotId });
    if (result) {
      return result;
    }
  } catch (err) {
    Logger.error(err);
  }
}

export async function saveHistoricalLot(lot: IHistoricalLot) {
  try {
    const existingLot = await getHistoricalLot(lot.id);
    if (existingLot) {
      existingLot.overwrite(lot);
      await existingLot.save();
      return existingLot;
    } else {
      const result = await HistoricalLot.create(lot);
      return result;
    }
  } catch (err) {
    Logger.error(err);
  }
}
