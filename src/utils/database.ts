import Redis from 'ioredis';
import DotEnv from 'dotenv';
import { Logger } from '@/utils/logger';

DotEnv.config();

const DB_CLIENT = new Redis(process.env.REDIS_DB_STRING!);

export function getDbStatus() {
  return DB_CLIENT.status;
}

/**
 * Set a single key value pair in the database
 *
 * @export
 * @param {string} key
 * @param {(string | number | Buffer)} value - A string, number or Buffer that you want to store. Note that Redis stores values as strings regardless.
 * @return {(true | undefined)} true if successful, undefined (falsy) if an error occurred while setting the value.
 */
export async function setDatabaseValue(
  key: string,
  value: string | number | Buffer,
) {
  try {
    await DB_CLIENT.set(key, value);
    return true;
  } catch (err) {
    Logger.error(err);
    return;
  }
}

/**
 * Get a single value from the database by key
 *
 * @export
 * @param {string} key
 * @return {*}
 */
export async function getDatabaseValue(key: string) {
  try {
    return await DB_CLIENT.get(key);
  } catch (err) {
    Logger.error(err);
    return;
  }
}

/**
 * Determine if a value exists in the database without retrieving the value itself for performance reasons
 *
 * @export
 * @param {string} key
 * @return {Boolean} true if value is found to exist, false/undefined if an error occurs or value doesn't exist
 */
export async function doesDatabaseValueExist(key: string) {
  try {
    return Boolean(await DB_CLIENT.exists(key));
  } catch (err) {
    Logger.error(err);
    return;
  }
}

/**
 * Store an object in the database
 *
 * @export
 * @param {string} key
 * @param {object} value - A valid JSON object. Note that all properties on the object will be converted to strings.
 * @return {(true | undefined)} true if successful, undefined (falsy) if an error occurred while setting the value.
 */
export async function setDatabaseHashTable(key: string, value: object) {
  try {
    await DB_CLIENT.hmset(key, value);
    return true;
  } catch (err) {
    Logger.error(err);
    return;
  }
}

/**
 * Get a single property value from a hash table stored in the database by key
 *
 * @export
 * @param {string} key - The key to find in the database
 * @param {string} property - The property to retrieve from the hash table
 * @return {(string | null | undefined)} a single string value or null/undefined if the value is not able to be retrieved.
 */
export async function getDatabaseHashValue(key: string, property: string) {
  try {
    return await DB_CLIENT.hget(key, property);
  } catch (err) {
    Logger.error(err);
    return;
  }
}

/**
 * Get an entire hash table by key from the database
 *
 * @export
 * @param {string} key
 * @return {(Record<string,string> | undefined)} a Record<string, string> value or null/undefined if unable to retrieve the requested value
 */
export async function getDatabaseHashTable(key: string) {
  try {
    return await DB_CLIENT.hgetall(key);
  } catch (err) {
    Logger.error(err);
    return;
  }
}
