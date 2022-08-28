import { GoogleSheetsHelper, Logger } from '@/utils';
import type { GoogleSpreadsheetRow } from 'google-spreadsheet';
import type { IAuctionLot } from '@/database';

interface GoogleSheetLot extends GoogleSpreadsheetRow {
  Title: string;
  Description: string;
  Image?: string;
  'Starting Bid': string;
}

export async function downloadAuctionLots() {
  try {
    const sheetId = '1YunSIoKSdttNrFXV7YNvx7f37y7X6Z85J3EkEOSi1w0';
    if (!sheetId) {
      Logger.error(
        'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.',
      );
      return;
    }
    const sheetHelper = new GoogleSheetsHelper(sheetId);
    const sheet = await sheetHelper.loadSheet('DiscordAuctionLots');
    if (!sheet) { Logger.error('Sheet could not be loaded.'); return;};
    await sheet.loadCells('A2:D100');
    const rows = await sheet.getRows();
    const auctionLots: Array<Omit<IAuctionLot, 'id'>> = [];
    rows.forEach((row) => {
      const rowData = row as GoogleSheetLot;
      if (
        !rowData ||
        !rowData.Title?.length ||
        !rowData.Description?.length ||
        !rowData['Starting Bid']?.length ||
        !Number(rowData['Starting Bid']?.replace(/[$,]/g, '') ?? 0)
      ) {
        return;
      }
      auctionLots.push({
        title: rowData.Title,
        description: rowData.Description,
        startingBid: Number(rowData['Starting Bid']),
        image: rowData.Image,
      });
    });
    if (auctionLots.length) {
      return auctionLots;
    }
    Logger.warn('No auction lots in auctionLots array');
    return;
  } catch (ex) {
    Logger.error(ex);
    return;
  }
}