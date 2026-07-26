export interface ExtractedData {
  price?: number;
  currency?: string;
  text?: string;
}

const CURRENCY_REGEX = /\b(CUP|USD|EUR|MLC)\b/i;
const PRICE_REGEX =
  /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)/;

export function extractData(
  text: string,
  allowedCurrencies: string[],
): ExtractedData {
  const result: ExtractedData = { text };

  const currencyMatch = text.match(CURRENCY_REGEX);
  if (currencyMatch) {
    const foundCurrency = currencyMatch[1].toUpperCase();
    if (allowedCurrencies.includes(foundCurrency)) {
      result.currency = foundCurrency;
    }
  }

  const priceMatch = text.match(PRICE_REGEX);
  if (priceMatch) {
    const cleanPrice = priceMatch[1]
      .replace(/[.,](?=\d{3})/g, '')
      .replace(',', '.');
    const parsed = parseFloat(cleanPrice);
    if (!isNaN(parsed) && parsed > 0) {
      result.price = parsed;
    }
  }

  let cleanText = text;
  if (result.currency)
    cleanText = cleanText.replace(
      new RegExp(`\\b${result.currency}\\b`, 'i'),
      '',
    );
  if (result.price) cleanText = cleanText.replace(PRICE_REGEX, '');

  result.text = cleanText.replace(/\s+/g, ' ').trim();

  return result;
}
