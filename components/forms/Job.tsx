'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Editor } from '@/components/shared/Editor';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { JobSchema } from '@/lib/validation';
import { createJob } from '@/lib/actions/job.action';
import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type EditorJS from "@editorjs/editorjs";


interface Props {
  userId: string;
}

const JobForm = ({ userId }: Props) => {
  const editorRef = useRef<EditorJS | null>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof JobSchema>>({
    resolver: zodResolver(JobSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      startDate: new Date(),
      deadline: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof JobSchema>) {
    try {
      setIsSubmitting(true);

      // Get the content from editor
      const blocks = await editorRef.current?.save();
      const description = JSON.stringify(blocks);

      // Validate description length before submitting
      if (!description || description.length < 10) {
        toast.error('Description must be at least 10 characters');
        return;
      }

      await createJob({
        title: values.title,
        description,
        price: values.price,
        startDate: values.startDate,
        deadline: values.deadline,
        authorId: userId,
      });

      router.push('/jobs');
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Something went wrong! Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          editorRef.current = editor;
        },
        onChange: async () => {
          const blocks = await editor.save();
          const content = JSON.stringify(blocks);
          // Update form field
          form.setValue('description', content);
        },
        placeholder: "Type your job description here...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          list: List,
          code: Code,
          inlineCode: InlineCode,
        },
      });
    }
  }, [form]);

  // Handle editor initialization
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter job title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <div className="min-h-[200px] w-full rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="prose prose-stone dark:prose-invert">
                    <div
                      id="editor"
                      className="min-h-[200px] text-invert dark:text-zinc-200"
                      onBlur={async () => {
                        const blocks = await editorRef.current?.save();
                        field.onChange(JSON.stringify(blocks));
                      }}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (KSH )</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter price" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value.toISOString().split('T')[0]}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value.toISOString().split('T')[0]}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="primary-gradient w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Job'}
        </Button>
      </form>
    </Form>
  );
};

export default JobForm; 