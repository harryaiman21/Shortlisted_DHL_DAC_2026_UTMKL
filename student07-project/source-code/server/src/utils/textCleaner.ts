export const cleanText = (text: string) => {
  return text
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[^\x20-\x7E\n]/g, "")
    .trim();
};