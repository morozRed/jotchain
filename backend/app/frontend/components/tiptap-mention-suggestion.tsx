import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import type { Instance as TippyInstance } from "tippy.js";
import tippy from "tippy.js";

import { MentionList } from "./tiptap-mention-list";

export const mentionSuggestion: Omit<
  SuggestionOptions,
  "editor"
> = {
  char: "@",

  items: async ({ query }) => {
    const items: any[] = [];

    try {
      const response = await fetch(
        `/api/mentions?q=${encodeURIComponent(query)}`,
      );

      if (response.ok) {
        const data = await response.json();

        // Add matching projects and persons
        if (data.projects && Array.isArray(data.projects)) {
          items.push(...data.projects.map((p: any) => ({ ...p, category: "Projects" })));
        }
        if (data.persons && Array.isArray(data.persons)) {
          items.push(...data.persons.map((p: any) => ({ ...p, category: "People" })));
        }
      } else {
        console.error("Failed to fetch mentions:", response.status);
      }
    } catch (error) {
      console.error("Error fetching mentions:", error);
    }

    // Always add "create new" options if query is present (even if API fails)
    if (query.trim()) {
      items.push(
        {
          id: "create-project",
          type: "create-project",
          label: `Create project "${query}"`,
          category: "Actions",
          query: query,
        },
        {
          id: "create-person",
          type: "create-person",
          label: `Create person "${query}"`,
          category: "Actions",
          query: query,
        },
      );
    }

    return items;
  },

  render: () => {
    let component: ReactRenderer;
    let popup: TippyInstance[];

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          theme: "light-border",
          maxWidth: 350,
        });
      },

      onUpdate(props: SuggestionProps) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return (component.ref as any)?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
