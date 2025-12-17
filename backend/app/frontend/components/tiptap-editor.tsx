import { Extension, mergeAttributes } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

import { mentionSuggestion } from "./tiptap-mention-suggestion";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

// Custom extension to handle Cmd+Enter for submission
const SubmitOnCmdEnter = Extension.create({
  name: "submitOnCmdEnter",

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        // Dispatch custom event for parent to handle
        const event = new CustomEvent("submit-shortcut");
        this.editor.view.dom.dispatchEvent(event);
        return true; // Prevent default behavior
      },
    };
  },
});

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

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  autoFocus = false,
  onKeyDown,
}: TiptapEditorProps) {
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
        suggestion: mentionSuggestion,
      }),
      SubmitOnCmdEnter,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none",
          "h-full px-3 py-2",
          "[&_p]:leading-relaxed [&_p]:my-1",
          className,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(JSON.stringify(json));
    },
    autofocus: autoFocus ? "end" : false,
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (!editor || !value) return;

    try {
      const currentContent = JSON.stringify(editor.getJSON());
      if (currentContent !== value) {
        editor.commands.setContent(JSON.parse(value));
      }
    } catch (e) {
      console.error("Failed to parse TipTap content:", e);
    }
  }, [value, editor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!editor || !onKeyDown) return;

    const handleSubmit = () => {
      // Create a fake KeyboardEvent for the parent handler
      const fakeEvent = {
        metaKey: true,
        key: "Enter",
        preventDefault: () => {},
      } as React.KeyboardEvent;
      onKeyDown(fakeEvent);
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("submit-shortcut", handleSubmit);

    return () => {
      editorElement.removeEventListener("submit-shortcut", handleSubmit);
    };
  }, [editor, onKeyDown]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col bg-transparent",
        "focus-within:outline-none",
      )}
    >
      <EditorContent editor={editor} placeholder={placeholder} className="flex-1" />
    </div>
  );
}
