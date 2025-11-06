import type { FileRouteTypes } from "@/routeTree.gen";

type RoutePaths = FileRouteTypes["to"];

type ExtractParams<T extends string> = T extends `${string}$${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractParams<Rest>]: string }
  : T extends `${string}$${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

export function buildUrl<TRoute extends RoutePaths>(
  routePath: TRoute,
  ...params: ExtractParams<TRoute> extends Record<string, never>
    ? []
    : [params: ExtractParams<TRoute>]
): string {
  const [paramObj] = params;
  let result = routePath as string;

  if (paramObj && typeof paramObj === "object") {
    for (const [key, value] of Object.entries(paramObj)) {
      result = result.replace(`$${key}`, String(value));
    }
  }

  return result;
}
