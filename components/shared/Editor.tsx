"use client";

import EditorJS, { OutputData } from "@editorjs/editorjs";
import { useCallback, useEffect, useRef, useState } from "react";

interface EditorProps {
  placeholder?: string;
  onChange: (content: string) => void;
}

export const Editor = ({ placeholder, onChange }: EditorProps) => {
  const editorRef = useRef<EditorJS>();
  const [editorData, setEditorData] = useState<OutputData | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  const initializeEditor = useCallback(async () => {
    if (editorRef.current || !holderRef.current) return;

    try {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;

      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder,
        onChange: debounce(async () => {
          try {
            const data = await editor.save();
            setEditorData(data);

            // Convert blocks to readable text
            const text = data.blocks
              .map((block) => {
                switch (block.type) {
                  case "paragraph":
                    return block.data.text;
                  case "header":
                    return `${block.data.text}`;
                  case "list":
                    return block.data.items.join("\n");
                  default:
                    return "";
                }
              })
              .filter(Boolean)
              .join("\n\n");

            onChange(text);
          } catch (error) {
            console.error("Failed to save editor data:", error);
          }
        }, 250),
        tools: {
          header: {
            class: Header,
            config: {
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
        },
        data: editorData || {
          blocks: [
            {
              type: "paragraph",
              data: {
                text: "",
              },
            },
          ],
        },
      });

      editorRef.current = editor;
    } catch (error) {
      console.error("Editor initialization failed:", error);
    }
  }, [placeholder, onChange, editorData]);

  // Debounce function to prevent too frequent updates
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeEditor();
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = undefined;
        } catch (error) {
          console.error("Failed to destroy editor:", error);
        }
      }
    };
  }, [initializeEditor]);

  return (
    <div className="w-full prose prose-sm dark:prose-invert">
      <div
        ref={holderRef}
        className="min-h-[300px] w-full border rounded-md p-4 bg-background text-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500"
      />
    </div>
  );
};
