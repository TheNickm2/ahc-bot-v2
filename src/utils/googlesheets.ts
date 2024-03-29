import { Logger } from '@/utils';
import { Collection } from 'discord.js';
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

export async function getTopSellersAhc() {
  try {
    const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!sheetId) {
      console.warn(
        'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.',
      );
      return false;
    }
    const sheetHelper = new GoogleSheetsHelper(sheetId);
    const sheet = await sheetHelper.loadSheet('Dues');
    if (!sheet) return false;
    await sheet.loadCells('AA26:AB35');
    const topSellers: Collection<string, number> = new Collection();
    for (let i = 26; i < 36; i++) {
      const sellerName = await sheet.getCellByA1(`AA${i}`).value.toString();
      const sellerAmount = Number(await sheet.getCellByA1(`AB${i}`).value);
      if (typeof sellerAmount === 'number') {
        topSellers.set(sellerName, sellerAmount);
      } else {
        return false;
      }
    }
    return topSellers;
  } catch (ex) {
    Logger.error(ex);
    return false;
  }
}

export async function getTopSellersUpc() {
  try {
    const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!sheetId) {
      console.warn(
        'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.',
      );
      return false;
    }
    const sheetHelper = new GoogleSheetsHelper(sheetId);
    const sheet = await sheetHelper.loadSheet('UPC Dues');
    if (!sheet) return false;
    await sheet.loadCells('AA3:AB12');
    const topSellers: Collection<string, number> = new Collection();
    for (let i = 3; i < 13; i++) {
      const sellerName = await sheet.getCellByA1(`AA${i}`).value.toString();
      const sellerAmount = Number(await sheet.getCellByA1(`AB${i}`).value);
      if (typeof sellerAmount === 'number') {
        topSellers.set(sellerName, sellerAmount);
      } else {
        return false;
      }
    }
    return topSellers;
  } catch (ex) {
    Logger.error(ex);
    return false;
  }
}

export async function getAhcMembers() {
  try {
    const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!sheetId) {
      console.warn(
        'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.',
      );
      return false;
    }
    const sheetHelper = new GoogleSheetsHelper(sheetId);
    const sheet = await sheetHelper.loadSheet('AHC Bot Pull');
    if (!sheet) return false;
    await sheet.loadCells('A2:F502');
    const ahcMembers: Collection<string, AhfGuildMember> = new Collection();
    const rows = await sheet.getRows();
    rows.forEach((row) => {
      const rowData = row as AhfGuildMember;
      if (!rowData.Who || rowData.Who.trim() === '') return;
      ahcMembers.set(rowData.Who.trim().toLowerCase(), rowData);
    });
    if (ahcMembers.size === 0) return false;
    return ahcMembers;
  } catch (ex) {
    Logger.error(ex);
    return false;
  }
}

export async function getUpcMembers() {
  try {
    const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!sheetId) {
      console.warn(
        'The Google Sheet ID was not found in the environment variables. Please ensure the GOOGLE_SPREADSHEET_ID environment variable exists.',
      );
      return false;
    }
    const sheetHelper = new GoogleSheetsHelper(sheetId);
    const sheet = await sheetHelper.loadSheet('UPC Bot Pull');
    if (!sheet) return false;
    await sheet.loadCells('A2:F502');
    const ahcMembers: Collection<string, AhfGuildMember> = new Collection();
    const rows = await sheet.getRows();
    rows.forEach((row) => {
      const rowData = row as AhfGuildMember;
      if (!rowData.Who || rowData.Who.trim() === '') return;
      ahcMembers.set(rowData.Who.trim().toLowerCase(), rowData);
    });
    if (ahcMembers.size === 0) return false;
    return ahcMembers;
  } catch (ex) {
    Logger.error(ex);
    return false;
  }
}

export interface AhfGuildMember extends GoogleSpreadsheetRow {
  Who: string;
  Sales: number;
  Safe?: boolean;
  'Mat Raffle Tickets': number;
  [key: string]: any;
}

export class GoogleSheetsHelper {
  private readonly doc: GoogleSpreadsheet;
  private clientEmail: string;
  private clientPrivateKey: string;
  private initialized: boolean;
  /**
   * Creates an instance of GoogleSheetsHelper.
   * @param {string} docId - The Document ID of the Google Spreadsheet (from the URL)
   * @memberof GoogleSheetsHelper
   */
  constructor(docId: string) {
    this.initialized = false;
    this.doc = new GoogleSpreadsheet(docId);
    this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
    this.clientPrivateKey = process.env.GOOGLE_PRIVATE_KEY ?? '';
  }

  /**
   * Internal method to initialize the connection to Google - ran once on first loadsheet operation.
   *
   * @memberof GoogleSheetsHelper
   */
  private async initializeDocsConnection() {
    await this.doc.useServiceAccountAuth({
      client_email: this.clientEmail,
      private_key: this.clientPrivateKey,
    });
    await this.doc.loadInfo();
  }
  public async loadSheet(titleOrIndex: string | number) {
    if (!this.initialized) {
      await this.initializeDocsConnection();
      this.initialized = true;
    }
    if (typeof titleOrIndex === 'number')
      return this.doc.sheetsByIndex[titleOrIndex];
    if (typeof titleOrIndex === 'string')
      return this.doc.sheetsByTitle[titleOrIndex];
    return null;
  }
}
