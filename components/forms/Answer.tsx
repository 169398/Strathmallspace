'use client';


import type EditorJS from '@editorjs/editorjs';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { createAnswer } from '@/lib/actions/answer.action';
import { usePathname } from 'next/navigation';
import Loading from '../shared/Loading';
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from 'sonner';

interface AnswerProps {
  question: string;
  questionId: string;
  authorId: string;
}

const Answers = ({ question, questionId, authorId }: AnswerProps) => {
  const pathName = usePathname();
  const editorRef = useRef<EditorJS | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

 

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "answer-editor",
        onReady() {
          editorRef.current = editor;
        },
        placeholder: "Write your answer here...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
         
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                      throw new Error('File size too large (max 5MB)');
                    }

                    const [res] = await uploadFiles("imageUploader", { files: [file] });

                    if (!res?.url) {
                      throw new Error('Upload failed');
                    }

                    return {
                      success: 1,
                      file: {
                        url: res.url,
                      },
                    };
                  } catch (error) {
                    console.error('Image upload error:', error);
                    return {
                      success: 0,
                      error: 'Upload failed. Please try another image.'
                    };
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };

    if (isMounted) {
      init();

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }
  }, [isMounted, initializeEditor]);

  const handleCreateAnswer = async () => {
    setIsSubmitting(true);

    try {
      const blocks = await editorRef.current?.save();
      
      if (!blocks || blocks.blocks.length === 0) {
        toast.error("Please write your answer before submitting");
        return;
      }

      await createAnswer({
        content: JSON.stringify(blocks),
        author: authorId,
        question: questionId,
        path: pathName,
      });

      if (editorRef.current) {
        editorRef.current.clear();
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const enhanceAnswer = async () => {
    if (!authorId || !editorRef.current) return;
    setIsSubmittingAI(true);

    try {
      // Get current content from editor
      const currentContent = await editorRef.current.save();
      
      // Send the content to the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chatgpt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            editorContent: JSON.stringify(currentContent) 
          }),
        }
      );

      const aiAnswer = await response.json();
      const aiReplay = aiAnswer.reply;

      if (editorRef.current) {
        // Clear the current content
        await editorRef.current.clear();
        
        // Parse the AI response as HTML and create an EditorJS block
        await editorRef.current.render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: aiReplay
              }
            }
          ]
        });
      }
    } catch (error) {
      console.log('Error enhancing answer:', error);
    } finally {
      setIsSubmittingAI(false);
    }
  };

  return (
    <div>
      {isSubmitting && <Loading title="Submitting your answer" />}
      {isSubmittingAI && <Loading title="AI is enhancing your answer 😀" />}
      <div className="mt-8 flex w-full flex-row items-center justify-between gap-5 max-sm:mt-3 sm:gap-2">
        <h4 className="h3-semibold max-sm:paragraph-semibold  text-invert max-sm:text-center">
          Write your answer
        </h4>

        {/*  TODO: Add hover effect to the button */}
        <Button
          className="btn text-invert-secondary gap-1.5 rounded-md px-4 py-2.5"
          onClick={enhanceAnswer}
          disabled={isSubmittingAI}
        >
          {isSubmittingAI ? (
            <>
              <Image
                src="/assets/icons/stars.svg"
                alt="star icon"
                width={12}
                height={12}
                className="object-contain"
              />
              <p className="max-sm:hidden">Enhancing...</p>
            </>
          ) : (
            <>
              <Image
                src="/assets/icons/stars.svg"
                alt="star icon"
                width={12}
                height={12}
                className="object-contain"
              />
              <p className="max-sm:hidden">Enhance your answer</p>
            </>
          )}
        </Button>
      </div>
      <div className="mt-6 flex w-full flex-col gap-10">
        <div className="min-h-[350px] w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="prose prose-stone dark:prose-invert">
            <div id="answer-editor" className="min-h-[350px]" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleCreateAnswer}
            className="primary-gradient paragraph-regular w-fit text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Answers;
