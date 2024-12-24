const trillion = 1e12;
const billion = 1e9;
const million = 1e6;
const thousand = 1e3;

export const formatBigNum = (num: number): string => {
  if (Math.abs(num) >= trillion) {
    return `${(num / trillion).toFixed(2)}T`;
  } else if (Math.abs(num) >= billion) {
    return `${(num / billion).toFixed(2)}B`;
  } else if (Math.abs(num) >= million) {
    return `${(num / million).toFixed(2)}M`;
  } else if (Math.abs(num) >= thousand) {
    return `${(num / thousand).toFixed(2)}K`;
  } else {
    return `${num.toFixed(2)}`;
  }
};
