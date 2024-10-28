/* eslint-disable tailwindcss/no-custom-classname */
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuestionsSchema } from "@/lib/validation";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { createQuestion, updateQuestion } from "@/lib/actions/question.action";
import { useRouter, usePathname } from "next/navigation";
import { uploadFiles } from "@/lib/uploadthing";
import type EditorJS from '@editorjs/editorjs';
import { useToast } from "../ui/use-toast";

interface QuestionProps {
  type?: string;
  questionDetails?: string;
  userId: string;
}

const Question = ({ type, userId, questionDetails }: QuestionProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  // Check if questionDetails is not empty or undefined before parsing
  const parsedQuestionDetails = questionDetails
    ? JSON.parse(questionDetails)
    : "";

  // Ensure parsedQuestionDetails is not null before accessing its properties
  const groupedTags = parsedQuestionDetails
    ? parsedQuestionDetails.tags.map((tag: any) => tag.name)
    : [];

  // 1. Define your form.
  const form = useForm<z.infer<typeof QuestionsSchema>>({
    resolver: zodResolver(QuestionsSchema),
    defaultValues: {
      title: parsedQuestionDetails.title || "",
      explanation: parsedQuestionDetails.content || "",
      tags: groupedTags || [],
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof QuestionsSchema>) {
    try {
      setIsSubmitting(true);

      // Get the content from editor
      const blocks = await editorRef.current?.save();

      if (type === "Edit") {
        await updateQuestion({
          questionId: parsedQuestionDetails._id,
          title: values.title,
          content: JSON.stringify(blocks),
          path: pathname,
        });

        router.push(`/question/${parsedQuestionDetails._id}`);
      } else {
        await createQuestion({
          title: values.title,
          content: JSON.stringify(blocks),
          tags: values.tags,
          author: userId,
          path: pathname,
        });
        router.push("/");
      }

      toast({
        title: `Question ${type === "Edit" ? "Updated" : "Created"} Successfully`,
        variant: "default",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  

  // * Define a function to handle adding tags.

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any
  ) => {
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault();

      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== "") {
        if (tagValue.length > 15) {
          return form.setError("tags", {
            type: "required",
            message: "Tags should be less than 15 characters",
          });
        }
        if (!field.value.includes(tagValue as never)) {
          form.setValue("tags", [...field.value, tagValue]);
          tagInput.value = "";
          form.clearErrors("tags");
        }
      } else {
        form.trigger();
      }
    }
  };

  const handleTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag);
    form.setValue("tags", newTags);
  };


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
        holder: "editor",
        onReady() {
          editorRef.current = editor;
        },
        placeholder: "Type here to write your post...",
        inlineToolbar: true,
        data: parsedQuestionDetails.content ? JSON.parse(parsedQuestionDetails.content) : { blocks: [] },
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
                    // Add file size check
                    const maxSize = 5 * 1024 * 1024; // 5MB
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
  }, [parsedQuestionDetails]);

  const [isMounted, setIsMounted] = useState<boolean>(false);

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

  return (
    <div>
      {" "}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col ">
                <FormLabel className="paragraph-semibold text-invert">
                  Question Title <span className="text-primary">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Input
                    className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px] border"
                    placeholder="Ask a Question"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular text-invert-3 mt-2.5 ">
                  Ask your question here.
                </FormDescription>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-invert">
                  Detailed explanation of your problem{" "}
                  <span className="text-primary-main">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <div className="min-h-[500px] w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="prose prose-stone dark:prose-invert">
                      <div id="editor" className="min-h-[500px]" />
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="body-regular text-invert-3 mt-2.5">
                  Describe your question here, but remember, the more specific
                  you are, the better the answer you&apos;ll get. Imagine
                  you&apos;re asking a friend for help!
                </FormDescription>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-invert">
                  Tags <span className="text-primary-main">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <>
                    <Input
                      disabled={type === "Edit"}
                      className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px] border"
                      placeholder="Add Tags..."
                      onKeyDown={(e) => handleInputKeyDown(e, field)}
                    />
                    {field.value.length > 0 && (
                      <div className="flex-start mt-2.5 gap-3">
                        {field.value.map((tag: any) => (
                          <Badge
                            key={tag}
                            className="subtle-medium question-tag-bg flex cursor-pointer
                            items-center  justify-center gap-2 rounded-md  px-3 py-2 uppercase duration-300 ease-in-out hover:border-red-500"
                            onClick={() =>
                              type !== "Edit"
                                ? handleTagRemove(tag, field)
                                : () => {}
                            }
                          >
                            {tag}
                            {type !== "Edit" && (
                              <Image
                                src="/assets/icons/close.svg"
                                alt="Remove"
                                width={12}
                                height={12}
                                className="cursor-pointer object-contain invert dark:invert-0"
                              />
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                </FormControl>
                <FormDescription className="body-regular text-invert-3 mt-2.5 ">
                  Add up to 3 tags that describe the problem you&apos;re facing.
                  Press Enter to add each tag.
                </FormDescription>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={`primary-gradient px-3 py-4 text-white ${
              isSubmitting && "cursor-progress"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>{type === "Edit" ? "Updating..." : "Posting..."}</>
            ) : (
              <>{type === "Edit" ? "Edit Question" : "Ask Question"}</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Question;
