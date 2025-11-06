import { mergeAttributes } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { isValidTiptapJson, tiptapToPlainText } from "@/lib/tiptap-utils";
import { cn } from "@/lib/utils";

interface TiptapContentProps {
  content: string; // TipTap JSON string
  className?: string;
}

// Extend Mention to add custom 'type' attribute
const CustomMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-type"),
        renderHTML: (attributes) => {
          if (!attributes.type) {
            return {};
          }
          return {
            "data-type": attributes.type,
          };
        },
      },
    };
  },
});

/**
 * Read-only TipTap content renderer
 * Displays TipTap JSON with styled mentions
 * Falls back to plain text if JSON is invalid
 */
export function TiptapContent({ content, className }: TiptapContentProps) {
  // Validate and parse content
  const isValid = isValidTiptapJson(content);
  const parsedContent = isValid ? JSON.parse(content) : null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
      }),
      CustomMention.configure({
        HTMLAttributes: {
          class: "mention",
        },
      }),
    ],
    content: parsedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none",
          "[&_p]:leading-relaxed [&_p]:my-1",
          className
        ),
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (!editor || !parsedContent) return;

    try {
      const currentContent = JSON.stringify(editor.getJSON());
      if (currentContent !== content) {
        editor.commands.setContent(parsedContent);
      }
    } catch (e) {
      console.error("Failed to update TipTap content:", e);
    }
  }, [content, editor, parsedContent]);

  // Fallback to plain text if invalid JSON
  if (!isValid) {
    const plainText = tiptapToPlainText(content);
    return (
      <div className={cn("whitespace-pre-line text-sm leading-relaxed", className)}>
        {plainText || content}
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
