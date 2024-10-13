/* eslint-disable tailwindcss/no-custom-classname */
'use client';
import React, {  useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QuestionsSchema } from '@/lib/validation';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { createQuestion, updateQuestion } from '@/lib/actions/question.action';
import { useRouter, usePathname } from 'next/navigation';
import { Editor } from '@/components/shared/Editor';

interface QuestionProps {
  type?: string;
  questionDetails?: string;
  userId: string;
}

const Question = ({ type, userId, questionDetails }: QuestionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const parsedQuestionDetails = questionDetails ? JSON.parse(questionDetails) : '';
  const groupedTags = parsedQuestionDetails ? parsedQuestionDetails.tags.map((tag: any) => tag.name) : [];

  const form = useForm<z.infer<typeof QuestionsSchema>>({
    resolver: zodResolver(QuestionsSchema),
    defaultValues: {
      title: parsedQuestionDetails.title || '',
      explanation: parsedQuestionDetails.content || '',
      tags: groupedTags || [],
    },
  });

  // Submit handler that integrates with the new Editor
  async function onSubmit(values: z.infer<typeof QuestionsSchema>) {
    setIsSubmitting(true);
    try {
      const editorContent = await(window as any).editorInstance?.save();

      if (type === 'Edit') {
        await updateQuestion({
          questionId: parsedQuestionDetails._id,
          title: values.title,
          content: editorContent, // Updated with content from EditorJS
          path: pathname,
        });
        router.push(`/question/${parsedQuestionDetails._id}`);
      } else {
        await createQuestion({
          title: values.title,
          content: editorContent, // Updated with content from EditorJS
          tags: values.tags,
          author: JSON.parse(userId),
          path: pathname,
        });
        router.push('/');
      }
    } catch (error) {
      console.error('Error submitting question', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle tags logic
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
    if (e.key === 'Enter' && field.name === 'tags') {
      e.preventDefault();
      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== '') {
        if (tagValue.length > 15) {
          return form.setError('tags', {
            type: 'required',
            message: 'Tags should be less than 15 characters',
          });
        }
        if (!field.value.includes(tagValue as never)) {
          form.setValue('tags', [...field.value, tagValue]);
          tagInput.value = '';
          form.clearErrors('tags');
        }
      } else {
        form.trigger();
      }
    }
  };

  const handleTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag);
    form.setValue('tags', newTags);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-10">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
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
                <FormDescription className="body-regular text-invert-3 mt-2.5">
                  Ask your question here.
                </FormDescription>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          {/* EditorJS for Explanation */}
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-invert">
                  Detailed explanation of your problem <span className="text-primary-main">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Editor onSubmit={function (data: { title: string; explanation: string; tags: string[]; }): void {
                    throw new Error('Function not implemented.');
                  } }/>
                </FormControl>
                <FormDescription className="body-regular text-invert-3 mt-2.5">
                  Describe your question here, the more specific, the better the answers you&apos;ll get.
                </FormDescription>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          {/* Tags Field */}
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
                      disabled={type === 'Edit'}
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
                            items-center justify-center gap-2 rounded-md px-3 py-2 uppercase duration-300 ease-in-out hover:border-red-500"
                            onClick={() =>
                              type !== 'Edit' ? handleTagRemove(tag, field) : () => {}
                            }
                          >
                            {tag}
                            {type !== 'Edit' && (
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
                <FormDescription className="body-regular text-invert-3 mt-2.5">
                  Add up to 3 tags. Press Enter to add each tag.
                </FormDescription>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className={`primary-gradient px-3 py-4 text-white ${isSubmitting && 'cursor-progress'}`} disabled={isSubmitting}>
            {isSubmitting ? (type === 'Edit' ? 'Updating...' : 'Posting...') : (type === 'Edit' ? 'Edit Question' : 'Ask Question')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Question;
