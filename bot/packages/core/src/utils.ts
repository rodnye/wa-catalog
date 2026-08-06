import { IProduct } from '@bot/types';

const quotesMap: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
};

export const removeQuotes = (txt: string) =>
  txt.replace(
    new RegExp('[' + Object.keys(quotesMap).join('') + ']', 'g'),
    (substring) => quotesMap[substring] || substring,
  );
export const removePlurals = (txt: string) => txt.replace(/(es|s)$/, '');

export const removeSpaces = (txt: string) => txt.replace(/\s/g, '');

export const isLinguisticEqual = (str1: string, str2: string) => {
  return (
    removePlurals(removeQuotes(removeSpaces(str1.toLowerCase()))) ===
    removePlurals(removeQuotes(removeSpaces(str2.toLowerCase())))
  );
};

console.log(isLinguisticEqual(' accé s            Orio', 'Accesorios'));

export const parseProductMessage = (message: string) => {
  const product = {} as unknown as IProduct;

  const ind = message.indexOf('*Nombre:*');
};
