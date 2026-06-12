import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  xp: z.number(),
  streak: z.number(),
  learnedCount: z.number(),
  weakLetters: z.array(z.string()).max(10),
  certificationScore: z.number().nullable(),
});

export const getCoachFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        message:
          "Great work showing up today! Practice your weakest letters with the Practice mode and you'll improve fast.",
        recommendation: "Try a 2-minute Practice round.",
      };
    }

    const system =
      "You are Dash, an encouraging Morse code coach. Reply in 2 short sentences max. Mention the learner's streak or XP when motivating. Be warm, never condescending. Then propose ONE specific next action.";
    const user = `Stats: XP=${data.xp}, streak=${data.streak} days, letters learned=${data.learnedCount}/26, weak letters=${data.weakLetters.join(",") || "none"}, certification=${data.certificationScore ?? "not taken"}.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limited — please try again in a moment.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in your workspace.");
        throw new Error(`AI error ${res.status}`);
      }
      const json = await res.json();
      const text: string = json.choices?.[0]?.message?.content ?? "";
      const recommendation =
        data.weakLetters.length > 0
          ? `Drill: ${data.weakLetters.join(", ")}`
          : "Try a Word Challenge.";
      return { message: text.trim(), recommendation };
    } catch (err) {
      return {
        message:
          err instanceof Error ? err.message : "Coach unavailable right now — keep practicing!",
        recommendation: "Try a Practice round.",
      };
    }
  });
