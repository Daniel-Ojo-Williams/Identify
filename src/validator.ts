import { z } from "zod";

export const identifyDto = z.object({
  body: z.object({
    email: z.string().email().transform((email, ctx) => {
      if (email) {
        return email.toLowerCase();
      }
    }),
    phoneNumber: z.string()
  }).partial().superRefine((obj, ctx) => {
    if (Object.keys(obj).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Empty request body not allowed"
      })
    }
  })
});

export type IdentifyDto = z.infer<typeof identifyDto>['body'];

