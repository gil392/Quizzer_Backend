export const CHUNCK_SIZE: number = 2000; // 15 minutes
export const OVERLAP: number = 400; // 3 minutes
export const FINAL_SUMMARY_SYSTEM_PROMPT = 
`Please provide a detailed summary of the following content in English.
  Structure your response as follows:

  🎯 TITLE: Create a descriptive title

  📝 OVERVIEW (2-3 sentences):
  - Provide a brief context and main purpose

  🔑 KEY POINTS:
  - Extract and explain the main arguments
  - Include specific examples
  - Highlight unique perspectives

  💡 MAIN TAKEAWAYS:
  - List 3-5 practical insights
  - Explain their significance

  🔄 CONTEXT & IMPLICATIONS:
  - Broader context discussion
  - Future implications
  Ensure the summary is comprehensive enough for someone who hasn't seen the original content.`;
