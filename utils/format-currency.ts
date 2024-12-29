export const formatCurrency = (currency: string): string => {
  if (currency.length === 40) {
    // convert from hex to string and remove null bytes
    return Buffer.from(currency, "hex").toString("utf-8").replace(/\0/g, ""); // Remove null bytes
  }
  return currency;
};
