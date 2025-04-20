export const splitTranscirptIntoChunks = (transcript: string, chunkSize: number, overlapSize: number): string[] => {
  const words: string[] = transcript.split(/[ \n]/).filter(Boolean);
  const chunks: string[] = [];
  const nextFirstWord: number = chunkSize - overlapSize;

  for (let firstWord = 0; firstWord + overlapSize < words.length; firstWord += nextFirstWord) {
    const lastWord: number = Math.min(firstWord + chunkSize, words.length) 
    const currentChunk: string = words.slice(firstWord, lastWord).join(' ');
    chunks.push(currentChunk);
  }

  return chunks.length === 0 ? [transcript] : chunks;
}
