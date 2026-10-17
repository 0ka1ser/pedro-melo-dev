import { z } from "zod";

// As mensagens são códigos (ContactErrorCode): o texto vem de content/{pt,en}.ts, no idioma da página.
export const contactSchema = z.object({
  name: z.string().trim().min(2, "invalid_name").max(120, "invalid_name"),
  email: z.email("invalid_email").max(200, "invalid_email"),
  message: z.string().trim().min(10, "invalid_message").max(1500, "invalid_message"),
});

export type ContactInput = z.infer<typeof contactSchema>;
