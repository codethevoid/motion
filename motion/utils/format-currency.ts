const formatLpCurrency = (currency: string) => {
  return `LP ${currency.slice(0, 4)}...${currency.slice(-4)}`;
};

export const formatCurrency = (currency: string): string => {
  if (currency.length === 40) {
    // convert from hex to string and remove null bytes
    if (currency.startsWith("03")) {
      return formatLpCurrency(currency);
    }
    return Buffer.from(currency, "hex").toString("utf-8").replace(/\0/g, ""); // Remove null bytes
  }
  return currency;
};

export const getSafeCurrency = (currency: string): string => {
  if (/^[A-Z]{3}$/.test(currency)) {
    return currency;
  }

  // Convert to hex and pad to 40 characters
  return Buffer.from(currency).toString("hex").toUpperCase().padEnd(40, "0");
};
