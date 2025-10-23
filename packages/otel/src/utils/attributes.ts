import {
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_ROUTE,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_URL,
} from "@opentelemetry/semantic-conventions";

export const createHttpAttributes = (
  method: string,
  url: string,
  route?: string,
  statusCode?: number,
) => {
  const attributes: Record<string, string | number> = {
    [SEMATTRS_HTTP_METHOD]: method,
    [SEMATTRS_HTTP_URL]: url,
  };

  if (route) {
    attributes[SEMATTRS_HTTP_ROUTE] = route;
  }

  if (statusCode) {
    attributes[SEMATTRS_HTTP_STATUS_CODE] = statusCode;
  }

  return attributes;
};

export const createFunctionAttributes = (functionName: string, executionTime?: number) => {
  const attributes: Record<string, string | number> = {
    "function.name": functionName,
  };

  if (executionTime !== undefined) {
    attributes["function.execution_time_ms"] = executionTime;
  }

  return attributes;
};

export const createDatabaseAttributes = (operation: string, table?: string) => {
  const attributes: Record<string, string> = {
    "db.operation": operation,
  };

  if (table) {
    attributes["db.sql.table"] = table;
  }

  return attributes;
};
