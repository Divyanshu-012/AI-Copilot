import Groq from "groq-sdk";
import fs from "fs/promises";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function parseResume(buffer: Buffer) {

  // convert buffer → string safely
  const text = buffer.toString("utf-8");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You extract technical skills from resumes."
      },
      {
        role: "user",
        content: `
Extract all technical skills from this resume.

Return ONLY a JSON array.

Example:
["JavaScript","React","Node.js"]

Resume:
${text}
`
      }
    ]
  });

  let skills: string[] = [];

  try {
    skills = JSON.parse(completion.choices[0].message.content || "[]");
  } catch {
    skills = [];
  }

  return {
    text,
    skills
  };
}
