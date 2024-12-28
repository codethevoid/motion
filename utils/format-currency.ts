export const formatCurrency = (currency: string): string => {
  if (currency.length === 40) {
    // convert from hex to string
    return Buffer.from(currency, "hex").toString("utf-8");
  }
  return currency;
};
