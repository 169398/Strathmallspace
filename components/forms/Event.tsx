"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/lib/actions/event.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import type EditorJS from "@editorjs/editorjs";
import { EventSchema } from "@/lib/validation";

interface Props {
  userId: string;
}

const EventForm = ({ userId }: Props) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof EventSchema>>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      poster: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const initializeEditor = useCallback(async () => {
    try {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;

      if (!editorRef.current) {
        const editor = new EditorJS({
          holder: "editor",
          onReady() {
            editorRef.current = editor;
          },
          onChange: async () => {
            const blocks = await editor.save();
            const content = JSON.stringify(blocks);
            form.setValue("content", content);
            form.setValue("description", content);
          },
          placeholder: "Write your event details here...",
          inlineToolbar: true,
          data: { blocks: [] },
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
        });
      }
    } catch (error) {
      console.error("Failed to initialize editor:", error);
    }
  }, [form]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      initializeEditor();

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }
  }, [isMounted, initializeEditor]);

  const onSubmit = async (values: z.infer<typeof EventSchema>) => {
    try {
      if (!file) {
        toast({
          title: "Error",
          description: "Please select an event poster",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("content", values.content);
      formData.append("location", values.location);
      formData.append("startDate", values.startDate.toISOString());
      formData.append("endDate", values.endDate.toISOString());
      formData.append("authorId", userId);
      formData.append("poster", file);

      await createEvent(formData);

      toast({
        title: "Success! 🎉",
        description: "Your event has been submitted for approval.",
      });

      router.push("/events/success");
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Event Title</FormLabel>
              <FormControl className="dark:bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-slate-600">
                <Input className="text-black dark:text-white" placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="poster"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Event Poster</FormLabel>
              <FormControl className="dark:bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-slate-600 cursor-pointer">
                <Input 
                  className="text-black dark:text-white"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      onChange(e.target.files);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {file && (
                <p className="text-sm text-black dark:text-white cursor-pointer">
                  Selected file: {file.name}
                </p>
              )}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl className="dark:bg-slate-900 border-slate-700  placeholder:text-slate-500 text-black dark:text-white focus:border-slate-600 cursor-pointer">
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        // If end date is before start date, update end date
                        const endDate = form.getValues("endDate");
                        if (date && endDate && date > endDate) {
                          form.setValue("endDate", date);
                        }
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const startDate = form.getValues("startDate");
                        return date < (startDate || new Date());
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter event location" 
                  className="dark:bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-slate-600"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Description</FormLabel>
              <FormControl>
                <div className="min-h-[200px] w-full rounded-lg border border-zinc-200 bg-background p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="prose prose-stone dark:prose-invert">
                    <div
                      id="editor"
                      className="min-h-[200px] text-invert dark:text-zinc-200"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full event-gradient"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Submitting...
            </div>
          ) : (
            "Submit Event for Approval"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
