export const fetcher = async (url: RequestInfo, init?: RequestInit): Promise<JSON | any> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
};
