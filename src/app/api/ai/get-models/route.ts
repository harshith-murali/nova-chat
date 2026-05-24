import { auth } from "@/lib/auth";
import { CLAUDE_MODELS } from "@/modules/chat/lib/models";
import {
  fetchOpenRouterFreeModels,
  getOpenRouterFallbackModels,
} from "@/modules/chat/lib/openrouter";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = [...CLAUDE_MODELS];
    let openRouterWarning: string | undefined;

    try {
      const openRouterModels = await fetchOpenRouterFreeModels();
      models.push(...openRouterModels);
    } catch (error) {
      openRouterWarning =
        error instanceof Error
          ? error.message
          : "Failed to fetch OpenRouter models.";
      console.warn(
        "[nova/models] OpenRouter model fetch failed; using fallback option:",
        error,
      );
      models.push(...getOpenRouterFallbackModels());
    }

    return NextResponse.json({
      models,
      warning: openRouterWarning,
      providers: {
        anthropic: {
          configured: Boolean(process.env.ANTHROPIC_API_KEY),
        },
        openrouter: {
          configured: Boolean(process.env.OPENROUTER_API_KEY),
        },
      },
    });
  } catch (error) {
    console.error("Error in models GET handler:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
