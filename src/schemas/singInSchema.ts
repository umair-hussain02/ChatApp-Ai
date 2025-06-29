import { z } from "zod";

export const SignInSchema = z.object({
  indentifier: z.string().min(1, { message: "Identifier is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
