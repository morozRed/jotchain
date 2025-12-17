import type { SuggestionProps } from "@tiptap/suggestion";
import { Folder, Plus, User } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface MentionItem {
  id: string;
  type: string;
  label: string;
  category: string;
  color?: string;
  query?: string;
}

export const MentionList = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  SuggestionProps<MentionItem>
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    async (index: number) => {
      const item = props.items[index];

      if (!item) return;

      // Handle "create new" actions
      if (item.type === "create-project") {
        try {
          console.log("Creating project:", item.query);
          const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              project: {
                name: item.query,
                color: "#3b82f6"  // Default blue color
              }
            }),
          });

          if (response.ok) {
            const newProject = await response.json();
            console.log("Project created:", newProject);

            // Insert mention with correct attrs
            props.command({
              id: newProject.id,
              label: newProject.name,
              type: "project",
            });
          } else {
            const errorText = await response.text();
            console.error("Failed to create project:", response.status, errorText);
          }
        } catch (error) {
          console.error("Error creating project:", error);
        }
        return;
      }

      if (item.type === "create-person") {
        try {
          console.log("Creating person:", item.query);
          const response = await fetch("/api/persons", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              person: {
                name: item.query
              }
            }),
          });

          if (response.ok) {
            const newPerson = await response.json();
            console.log("Person created:", newPerson);

            // Insert mention with correct attrs
            props.command({
              id: newPerson.id,
              label: newPerson.name,
              type: "person",
            });
          } else {
            const errorText = await response.text();
            console.error("Failed to create person:", response.status, errorText);
          }
        } catch (error) {
          console.error("Error creating person:", error);
        }
        return;
      }

      // Insert regular mention - ensure correct attrs structure
      console.log("Inserting mention:", item);
      props.command({
        id: item.id,
        label: item.label,
        type: item.type,
      });
    },
    [props],
  );

  const upHandler = useCallback(() => {
    setSelectedIndex((prev) =>
      prev <= 0 ? props.items.length - 1 : prev - 1,
    );
  }, [props.items.length]);

  const downHandler = useCallback(() => {
    setSelectedIndex((prev) =>
      prev >= props.items.length - 1 ? 0 : prev + 1,
    );
  }, [props.items.length]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  // Group items by category
  const groupedItems = props.items.reduce(
    (acc, item, index) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({ item, index });
      return acc;
    },
    {} as Record<string, { item: MentionItem; index: number }[]>,
  );

  if (props.items.length === 0) {
    return (
      <div className="rounded-md border border-border bg-popover p-2 px-2 py-1.5 text-sm text-muted-foreground shadow-md">
        No results
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-1 last:mb-0">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            {category}
          </div>
          {items.map(({ item, index }) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                index === selectedIndex && "bg-accent text-accent-foreground",
              )}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {item.type === "project" && (
                <Folder className="h-4 w-4 shrink-0 text-primary" />
              )}
              {item.type === "person" && (
                <User className="h-4 w-4 shrink-0 text-primary" />
              )}
              {(item.type === "create-project" || item.type === "create-person") && (
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
});

MentionList.displayName = "MentionList";
