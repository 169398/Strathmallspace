"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/lib/actions/event.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClockIcon } from "@radix-ui/react-icons";
import EditorJS from "@editorjs/editorjs";

interface Props {
  userId: string;
}

const EventForm = ({ userId }: Props) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  });
  const [endTime, setEndTime] = useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  });
  const { toast } = useToast();
  const router = useRouter();

  const initializeEditor = useCallback(async () => {
    const Header = (await import("@editorjs/header")).default;
    const List = (await import("@editorjs/list")).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          editorRef.current = editor;
        },
        placeholder: "Write your event details here...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          list: List,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (!editorRef.current) {
        toast({
          title: "Error",
          description: "Editor not initialized",
          variant: "destructive",
        });
        return;
      }

      const blocks = await editorRef.current.save();
      formData.append("content", JSON.stringify(blocks));
      formData.append("description", JSON.stringify(blocks));

      await createEvent(formData);

      toast({
        title: "Success! 🎉",
        description: "Your event has been submitted for approval.",
        variant: "default",
      });

      router.push("/events/success");
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      const [hours, minutes] = startTime.split(":");
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setStartDate(newDate);
    } else {
      setStartDate(undefined);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      const [hours, minutes] = endTime.split(":");
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setEndDate(newDate);
    } else {
      setEndDate(undefined);
    }
  };

  const handleTimeChange = (
    timeString: string,
    date: Date | undefined,
    setDate: (date: Date | undefined) => void,
    setTime: (time: string) => void
  ) => {
    setTime(timeString);
    if (date) {
      const newDate = new Date(date);
      const [hours, minutes] = timeString.split(":");
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(newDate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Event Title</label>
        <Input
          name="title"
          required
          placeholder="Enter event title"
          className="w-full dark:bg-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Event Poster</label>
        <Input
          type="file"
          name="poster"
          accept="image/*"
          required
          className="w-full cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Start Date & Time
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "PPP HH:mm")
                ) : (
                  <span>Pick date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
              />
              <input
                type="time"
                value={startTime}
                className="w-full p-2 border-t dark:bg-gray-800 dark:text-gray-100"
                onChange={(e) => {
                  handleTimeChange(
                    e.target.value,
                    startDate,
                    setStartDate,
                    setStartTime
                  );
                }}
              />
            </PopoverContent>
          </Popover>
          <input
            type="hidden"
            name="startDate"
            value={startDate?.toISOString()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(endDate, "PPP HH:mm")
                ) : (
                  <span>Pick date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                initialFocus
              />
              <input
                type="time"
                value={endTime}
                className="w-full p-2 border-t dark:bg-gray-800 dark:text-gray-100"
                onChange={(e) => {
                  handleTimeChange(
                    e.target.value,
                    endDate,
                    setEndDate,
                    setEndTime
                  );
                }}
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="endDate" value={endDate?.toISOString()} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          name="location"
          required
          placeholder="Event location"
          className="w-full dark:bg-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <div className="min-h-[200px] w-full rounded-lg border border-zinc-200 bg-background p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="prose prose-stone dark:prose-invert">
            <div
              id="editor"
              className="min-h-[200px] text-invert dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full event-gradient"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center">
            <span className="animate-spin mr-2">⏳</span>
            Submitting...
          </div>
        ) : (
          "Submit Event for Approval"
        )}
      </Button>
    </form>
  );
};

export default EventForm;
