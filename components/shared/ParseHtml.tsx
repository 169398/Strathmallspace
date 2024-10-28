"use client";

import Prism from "prismjs";
import parse from "html-react-parser";
import { useEffect } from "react";

import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-aspnet";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-solidity";
import "prismjs/components/prism-json";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-r";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-mongodb";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

interface ParseHtmlParams {
  content: any; // Changed type to allow Editor.js JSON format
}

const ParseHtml = ({ content }: ParseHtmlParams) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const convertEditorJsToHtml = (content: any) => {
    if (!content) return "";
    
    try {
      // If content is a string, try to parse it as JSON
      const data = typeof content === 'string' ? JSON.parse(content) : content;
      
      if (!data.blocks) return "";

      return data.blocks.map((block: any) => {
        switch (block.type) {
          case 'header':
            return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          case 'paragraph':
            return `<p>${block.data.text}</p>`;
          case 'image':
            return `<figure>
              <img src="${block.data.file.url}" alt="${block.data.caption || ''}" />
              ${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}
            </figure>`;
          // Add more cases for other block types as needed
          default:
            return '';
        }
      }).join('');
    } catch (error) {
      console.error('Error parsing content:', error);
      return String(content); // Fallback to original content if parsing fails
    }
  };

  const htmlContent = convertEditorJsToHtml(content);

  return <div className="markdown w-full min-w-full">{parse(htmlContent)}</div>;
};

export default ParseHtml;
