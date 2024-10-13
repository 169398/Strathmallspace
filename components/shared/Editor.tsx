import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import Code from "@editorjs/code";

interface EditorProps {
  onChange: (content: string) => void;
  initialData?: string;
}

const Editor = ({ onChange, initialData }: EditorProps) => {
  const editorInstance = useRef<EditorJS | null>(null);
  const isInitialized = useRef(false); // Track if the editor is initialized

  useEffect(() => {
    if (!isInitialized.current) {
      editorInstance.current = new EditorJS({
        holder: "editor-js",
        tools: {
          header: Header,
          list: List,
          embed: Embed,
          table: Table,
          code: Code,
        },
        data: initialData ? JSON.parse(initialData) : {},
        onChange: async () => {
          try {
            const content = await editorInstance.current?.save();
            if (content) {
              onChange(JSON.stringify(content));
            }
          } catch (err) {
            console.error("Error saving editor content:", err);
          }
        },
      });

      isInitialized.current = true; // Prevent re-initialization
    }

    return () => {
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy();
        } catch (err) {
          console.error("Error destroying EditorJS instance:", err);
        }
        editorInstance.current = null;
      }
    };
  }, [initialData, onChange]);

  return <div id="editor-js" className="rounded border p-4"></div>;
};

export default Editor;
