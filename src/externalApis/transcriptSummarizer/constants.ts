export const SUMMARIZER_PROMPT = "Here is a YouTube transcript. Please provide a detailed summary, highlighting key points, main arguments, and any important examples or case studies mentioned. Organize the summary in a structured format, such as bullet points or sections, to make it easy to understand. If there are action steps, conclusions, or recommendations, include those as well. Keep it concise but informative" 
export const CHUNCK_SIZE: number = 7000;
export const OVERLAP: number = 1000;
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
