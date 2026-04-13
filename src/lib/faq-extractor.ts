// Extract FAQ-style Q&A from article HTML content
// Looks for H3 headings that are questions + following paragraph as answer

export type FaqItem = {
  question: string;
  answer: string;
};

export function extractFaqs(html: string): FaqItem[] {
  const faqs: FaqItem[] = [];

  // Match H3 headings that look like questions
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = h3Regex.exec(html)) !== null) {
    const heading = match[1].replace(/<[^>]*>/g, '').trim();
    const answer = match[2].replace(/<[^>]*>/g, '').trim();

    // Check if heading is a question (contains ? or starts with question words)
    const isQuestion =
      heading.includes('?') ||
      /^(how|what|why|when|where|which|who|can|do|does|is|are|should|will)/i.test(heading);

    if (isQuestion && answer.length > 20) {
      faqs.push({
        question: heading.replace(/\?$/, '') + '?',
        answer: answer.length > 300 ? answer.slice(0, 297) + '...' : answer,
      });
    }
  }

  return faqs.slice(0, 5); // Max 5 FAQs per article
}
