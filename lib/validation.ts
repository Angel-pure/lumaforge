import { z } from "zod";

export const generationRequestSchema = z.object({
  workspaceId: z.string().min(1),
  prompt: z.string().trim().min(3).max(4000),
  channel: z.enum(["LINKEDIN", "INSTAGRAM", "EMAIL", "BLOG", "X"]),
  tone: z.enum(["CLEAR", "BOLD", "WARM", "PLAYFUL"]).default("CLEAR"),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;
