import { z } from "zod";

export const parseJson = <T>(arg: string, ctx: z.RefinementCtx) => {
  try {
    return JSON.parse(arg) as T;
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
};
