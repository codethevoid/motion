const trillion = 1e12;
const billion = 1e9;
const million = 1e6;
const thousand = 1e3;

export const formatBigNum = (num: number, hideDecimals = false): string => {
  if (Math.abs(num) >= trillion) {
    return `${(num / trillion).toFixed(hideDecimals ? 0 : 2)}T`;
  } else if (Math.abs(num) >= billion) {
    return `${(num / billion).toFixed(hideDecimals ? 0 : 2)}B`;
  } else if (Math.abs(num) >= million) {
    return `${(num / million).toFixed(hideDecimals ? 0 : 2)}M`;
  } else if (Math.abs(num) >= thousand) {
    return `${(num / thousand).toFixed(hideDecimals ? 0 : 2)}K`;
  } else {
    return `${num.toFixed(hideDecimals ? 0 : 2)}`;
  }
};
