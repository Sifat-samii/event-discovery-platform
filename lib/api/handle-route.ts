import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppRole, getUserRole } from "@/lib/auth/roles";
import { logApiError, logApiInfo, logApiWarn } from "@/lib/utils/logger";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

type RouteContext<TParams = Record<string, string>> = {
  params?: Promise<TParams>;
};

type AuthContext = {
  userId: string | null;
  role: AppRole | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

type HandlerContext<TParams = Record<string, string>> = RouteContext<TParams> &
  AuthContext & {
    correlationId: string;
  };

type HandleRouteOptions = {
  route: string;
  action?: string;
  requireAuth?: boolean;
  requiredRole?: AppRole;
  rateLimitKey?: string;
  rateLimitWindowMs?: number;
  rateLimitLimit?: number;
};

type RouteHandler<TParams = Record<string, string>> = (
  request: NextRequest,
  context: HandlerContext<TParams>
) => Promise<NextResponse>;

function readCorrelationId(request: NextRequest) {
  return request.headers.get("x-correlation-id") || crypto.randomUUID();
}

export function handleRoute<TParams = Record<string, string>>(
  options: HandleRouteOptions,
  handler: RouteHandler<TParams>
) {
  return async (request: NextRequest, routeContext: RouteContext<TParams>) => {
    const correlationId = readCorrelationId(request);
    try {
      if (options.rateLimitKey && options.rateLimitLimit) {
        const limiter = rateLimit({
          key: `${options.rateLimitKey}:${getClientIp(request)}`,
          limit: options.rateLimitLimit,
          windowMs: options.rateLimitWindowMs || 60_000,
        });
        if (!limiter.allowed) {
          logApiWarn(
            {
              route: options.route,
              correlationId,
              action: options.action,
              status: 429,
            },
            "Rate limit exceeded"
          );
          return NextResponse.json({ error: "Too many requests", correlationId }, { status: 429 });
        }
      }

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role: AppRole | null = null;
      if (user?.id) {
        role = await getUserRole(supabase, user.id);
      }

      if (options.requireAuth && !user) {
        return NextResponse.json({ error: "Unauthorized", correlationId }, { status: 401 });
      }
      if (options.requiredRole && role !== options.requiredRole) {
        return NextResponse.json({ error: "Forbidden", correlationId }, { status: 403 });
      }

      const response = await handler(request, {
        ...(routeContext || {}),
        correlationId,
        userId: user?.id || null,
        role,
        supabase,
      });

      logApiInfo(
        {
          route: options.route,
          correlationId,
          action: options.action,
          userId: user?.id || null,
          role,
          status: response.status,
        },
        "Request handled"
      );
      return response;
    } catch (error) {
      logApiError(options.route, error, {
        correlationId,
        action: options.action,
      });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal server error", correlationId },
        { status: 500 }
      );
    }
  };
}

