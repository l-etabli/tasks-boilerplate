export type MiddlewareContext = {
  request: Request;
  response?: Response;
};

export type NextFunction = () => Promise<Response>;

export type Middleware = (context: MiddlewareContext, next: NextFunction) => Promise<Response>;
