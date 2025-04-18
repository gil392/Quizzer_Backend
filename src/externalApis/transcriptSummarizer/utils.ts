export const splitTranscirptIntoChunks = (transcript: string, chunkSize: number, overlap: number): string[] => {
  const words: string[] = transcript.split(" ");
  const chunks: string[] = [];
  const nextFirstWord: number = chunkSize - overlap;

  for (let firstWord = 0; firstWord + overlap < words.length; firstWord += nextFirstWord) {
    const lastWord: number = Math.min(firstWord + chunkSize, words.length) 
    const currentChunk: string = words.slice(firstWord, lastWord).join(" ");
    chunks.push(currentChunk);
  }

  return chunks.length === 0 ? [transcript] : chunks;
}