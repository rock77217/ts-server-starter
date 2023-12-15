import argon2 from "argon2";
import CryptoJS from "crypto-js";
import prettyMilliseconds from "pretty-ms";

const encryptPrefix = "Encrypt:";
const numRegex = /^-?[\d.]+(?:e-?\d+)?$/;

export const isMasterThread = () => {
  return process.env.NODE_APP_INSTANCE === "0";
};

export const deleteUndefinedElem = (input: any) => {
  for (const key of Object.keys(input)) {
    if (input[key] === undefined) delete input[key];
  }
  return input;
};

export const normalizeBool = (boolStr: any, defaultBool: boolean): boolean => {
  switch (typeof boolStr) {
    case "boolean":
      return boolStr;
    case "string":
      return boolStr === "true" ? true : false;
    default:
      return defaultBool;
  }
};

export const checkNumber = (num: any): boolean => {
  return numRegex.test(String(num));
};

export const argon2Hash = async (value: string): Promise<string> => {
  return (await argon2.hash(value)).toString();
};

export const argon2Verify = async (hash: string, key: string): Promise<boolean> => {
  return hash === key || (await argon2.verify(hash, key));
};

export const AESEncrypt = (message: string, key: string): string => {
  if (message.startsWith(encryptPrefix)) return message;
  else return `${encryptPrefix}${CryptoJS.AES.encrypt(message, key).toString()}`;
};

export const AESDecrypt = (secret: string, key: string): string => {
  if (secret.startsWith(encryptPrefix)) return AESDecrypt(secret.replace(encryptPrefix, ""), key);
  else return CryptoJS.AES.decrypt(secret, key).toString(CryptoJS.enc.Utf8);
};

export const spentTimeString = (start: number): string => {
  return prettyMilliseconds(Date.now() - start);
};

export const toJson = (value: any): any => {
  try {
    return JSON.parse(value);
  } catch (err: any) {
    return value;
  }
};
