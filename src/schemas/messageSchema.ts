import { z } from "zod";

export const MessageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Message content is required" })
    .max(500, { message: "Message content must be less than 500 characters" }),
});
