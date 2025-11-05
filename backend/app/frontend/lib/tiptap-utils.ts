/**
 * TipTap utility functions for content conversion and validation
 */

export interface TiptapDocument {
  type: "doc";
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, any>;
}

/**
 * Convert plain text to TipTap JSON document
 * Preserves line breaks as separate paragraphs
 */
export function plainTextToTiptap(text: string): string {
  if (!text || text.trim() === "") {
    return getEmptyTiptapDocument();
  }

  const lines = text.split("\n");
  const content = lines.map((line) => ({
    type: "paragraph",
    content: line.trim()
      ? [
          {
            type: "text",
            text: line,
          },
        ]
      : [],
  }));

  const doc: TiptapDocument = {
    type: "doc",
    content,
  };

  return JSON.stringify(doc);
}

/**
 * Extract plain text from TipTap JSON document
 * Useful for search, AI processing, and display fallback
 */
export function tiptapToPlainText(json: string): string {
  try {
    const doc = JSON.parse(json) as TiptapDocument;
    const texts: string[] = [];

    function extractText(node: TiptapNode) {
      if (node.type === "text" && node.text) {
        texts.push(node.text);
      }

      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractText);
      }
    }

    if (doc.content && Array.isArray(doc.content)) {
      doc.content.forEach((node, index) => {
        extractText(node);
        // Add newline between paragraphs (except last one)
        if (index < doc.content.length - 1 && node.type === "paragraph") {
          texts.push("\n");
        }
      });
    }

    return texts.join("");
  } catch (error) {
    console.error("Failed to parse TipTap JSON:", error);
    return "";
  }
}

/**
 * Get an empty TipTap document
 */
export function getEmptyTiptapDocument(): string {
  const doc: TiptapDocument = {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  };

  return JSON.stringify(doc);
}

/**
 * Validate if a string is valid TipTap JSON
 */
export function isValidTiptapJson(content: string): boolean {
  if (!content) return false;

  try {
    const parsed = JSON.parse(content);

    // Check basic structure
    if (typeof parsed !== "object" || parsed === null) {
      return false;
    }

    // Check for doc type
    if (parsed.type !== "doc") {
      return false;
    }

    // Check for content array
    if (!Array.isArray(parsed.content)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if TipTap document is empty (no text content)
 */
export function isTiptapEmpty(json: string): boolean {
  const plainText = tiptapToPlainText(json);
  return plainText.trim() === "";
}
