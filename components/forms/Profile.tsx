'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { updateUser } from '@/lib/actions/user.action';
import { ProfileSchema } from '@/lib/validation';
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
import { Textarea } from '../ui/textarea';
import { z } from 'zod';
import { useToast } from '../ui/use-toast';

interface Props {
  userId: string;
  user: any;
}

const Profile = ({ userId, user }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      portfolioWebsite: user?.portfolioWebsite || '',
      location: user?.location || '',
      bio: user?.bio || '',
    },
  });

  async function onSubmit(values: z.infer<typeof ProfileSchema>) {
    setIsSubmitting(true);
    try {
      console.log("Submitting form with values:", values);
      
      const response = await updateUser({
        userId,
        updateData: {
          name: values.name,
          username: values.username,
          portfolioWebsite: values.portfolioWebsite,
          location: values.location,
          bio: values.bio,
        },
        path: pathname,
      });

      console.log("Update response:", response);

      if (response.success) {
        toast.toast({
          title: "Success",
          description: response.message,
        });
        router.push(`/profile/${userId}`);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.toast({
        title: "Error",
        description: (error as Error).message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="text-invert">
                Username <span className="primary-text-gradient">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px]"
                  placeholder="Your username"
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="text-invert">
                Name <span className="primary-text-gradient">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px]"
                  placeholder="Your name"
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioWebsite"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="text-invert">Portfolio Website </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px]"
                  placeholder="Your portfolio URL"
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="text-invert">Location</FormLabel>
              <FormControl>
                <Input
                  className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px]"
                  placeholder="Where are you from?"
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="text-invert">Bio</FormLabel>
              <FormControl>
                <Textarea
                  className="no-focus paragraph-regular input_background text-invert-secondary min-h-[56px]"
                  placeholder="Write something special about you."
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <div className="mt-7 flex justify-end">
          <Button
            type="submit"
            className="primary-gradient w-fit text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Profile;
