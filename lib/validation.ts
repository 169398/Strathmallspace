import * as z from 'zod'

export const QuestionsSchema = z.object({
    title: z.string().min(5, "Title must contain at least 5 characters").max(150),
    explanation: z.string().optional(), // Make this optional since Editor.js handles the content
    tags: z.array(z.string().min(1).max(15)).min(1, "Add at least 1 Tag").max(3),
});


export const AnswersSchema = z.object({
})

export const ProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  portfolioWebsite: z.string().url().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal(''))
});


// USER
export const signInFormSchema = z.object({
  email: z.string().email().min(3, "Email must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export const JobSchema = z.object({
  title: z.string().min(5, "Title must contain at least 5 characters").max(150),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().min(1, "Price must be at least 1"),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  deadline: z.date().min(new Date(), "Deadline must be in the future"),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email().min(3, "Email must be at least 3 characters"),
    password: z.string().min(3, "Password must be at least 3 characters"),
    confirmPassword: z
      .string()
      .min(3, "Confirm password must be at least 3 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email().min(3, "Email must be at least 3 characters"),
});

export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, "Id is required"),
  role: z.string().min(1, "Role is required"),
});
export const EventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string(),
    content: z.string(),
    location: z.string().min(3, "Location must be at least 3 characters"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    poster: z
      .any()
      .optional()
      .refine((files) => {
        if (files instanceof FileList) {
          return files.length > 0;
        }
        return true;
      }, "Please select a poster image"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

