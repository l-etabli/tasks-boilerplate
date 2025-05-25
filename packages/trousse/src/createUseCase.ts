type WhenNotVoid<K extends string, V, NewType = void> = V extends void
  ? Record<string, never>
  : { [k in K]: NewType extends void ? V : NewType };

export type CreateUseCase<U = void, CU = void> = <
  Cb extends (
    args: {
      input: unknown;
      currentUser: CurrentUser;
    } & WhenNotVoid<"deps", Deps> &
      WhenNotVoid<"uow", Uow>,
  ) => unknown,
  Uow = U,
  CurrentUser = CU,
  Deps = void,
>(
  cb: Cb,
) => (
  setupParams: WhenNotVoid<"deps", Deps> &
    WhenNotVoid<"withUow", Uow, <T>(uowCb: (uow: Uow) => T) => T>,
) => (
  params: WhenNotVoid<"input", Parameters<Cb>[0]["input"]> & {
    currentUser: CurrentUser;
  },
) => ReturnType<Cb>;

export const createUseCase: CreateUseCase =
  (cb) =>
  ({ deps, withUow = (uowCb: any) => uowCb() }: any) =>
  (params: any) =>
    withUow((uow: any) =>
      cb({
        deps,
        input: params.input,
        uow,
        currentUser: params.currentUser,
      } as any),
    );

// Function overloads for configureCreateUseCase
export function configureCreateUseCase<Uow = void, CurrentUser = void>(): {
  // Overload for callbacks with input
  <Input, Output>(
    cb: (args: { input: Input; currentUser: CurrentUser; uow: Uow }) => Output,
  ): (setupParams: {
    withUow: <T>(uowCb: (uow: Uow) => T) => T;
  }) => (params: { input: Input; currentUser: CurrentUser }) => Output;

  // Overload for callbacks without input
  <Output>(
    cb: (args: { currentUser: CurrentUser; uow: Uow }) => Output,
  ): (setupParams: {
    withUow: <T>(uowCb: (uow: Uow) => T) => T;
  }) => (params: { currentUser: CurrentUser }) => Output;
};

// Implementation
export function configureCreateUseCase() {
  return (cb: any) =>
    ({ withUow = (uowCb: any) => uowCb() }: any) =>
    (params: any) =>
      withUow((uow: any) =>
        cb({ input: params.input, uow, currentUser: params.currentUser }),
      );
}
