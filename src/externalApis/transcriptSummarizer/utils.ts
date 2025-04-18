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

export const getSystemChunckSummaryPrompt = (chunckIndex:number) => 
    `Create a detailed summary of section ${chunckIndex + 1} in English.
        Maintain all important information, arguments, and connections.
        Pay special attention to:
        - Main topics and arguments
        - Important details and examples
        - Connections with other mentioned topics
        - Key statements and conclusions`;
