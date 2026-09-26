export const WORDS_PER_MINUTE = 200;

export const stripMarkdownAndHtml = (content: string): string => {
  if (!content) return "";

  return (
    content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`[^`]*`/g, "")
      // Remove images: ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // Keep link text from markdown links: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove Markdown headers, blockquotes, list markers
      .replace(/^[#>*+\-\d.]+\s+/gm, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
};

export const calculateReadingTime = (content?: string | null): number => {
  if (!content || typeof content !== "string" || !content.trim()) {
    return 1;
  }

  const cleanText = stripMarkdownAndHtml(content);
  if (!cleanText) {
    return 1;
  }

  const words = cleanText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

export default calculateReadingTime;
