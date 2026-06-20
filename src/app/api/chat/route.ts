import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a helpful AI assistant for Tilago, a professional video editing and motion graphics service platform.
      Tilago sells: Stream Alerts (animated notifications for donations/subs/follows/raids), Stream Overlays (complete overlay packages for Twitch/YouTube/Kick), Full Packages (bundle deals with overlays+alerts+panels), and 3D Motion Graphics (logo reveals, cinematic intros, product renders).
      Be friendly, enthusiastic, and knowledgeable. Keep responses concise (2-3 sentences max).
      If asked about pricing, mention packages start from $17.99 for alerts, $29.99 for overlays, $59.99 for full packages, and $79.99 for 3D work.`,
    },
    ...history.slice(-6).map((m: any) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 200,
    temperature: 0.7,
  });

  return NextResponse.json({ reply: completion.choices[0].message.content });
}
