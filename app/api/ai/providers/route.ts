import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth } from "@/lib/auth/session";
import { ProviderRegistry } from "@/services/ai/provider-registry.service";

export async function GET() {
  try {
    await requireAuth();
    
    const registry = new ProviderRegistry();
    const providers = registry.listProviders().map(p => ({
      id: p.name,
      name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      isDefault: p.name === registry.getDefaultProvider().name,
    }));

    return apiSuccess(providers);
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Internal server error",
      status: 500
    });
  }
}
