type WhenNotVoid<K extends string, V, NewType = void> = V extends void
  ? {}
  : { [k in K]: NewType extends void ? V : NewType };

export type CreateUseCase<U = void, CU = void> = <
  Input,
  Output,
  Uow = U,
  CurrentUser = CU,
  Deps = void,
>(
  cb: (
    args: {
      input: Input;
      currentUser: CurrentUser;
    } & WhenNotVoid<"deps", Deps> &
      WhenNotVoid<"uow", Uow>,
  ) => Output,
) => (
  setupParams: WhenNotVoid<"deps", Deps> &
    WhenNotVoid<"withUow", Uow, <T>(uowCb: (uow: Uow) => T) => T>,
) => (params: WhenNotVoid<"input", Input> & { currentUser: CurrentUser }) => Output;

export const createUseCase: CreateUseCase =
  (cb) =>
  ({ deps, withUow = (uowCb: any) => uowCb() }: any) =>
  (params: any) =>
    withUow((uow: any) =>
      cb({ deps, input: params.input, uow, currentUser: params.currentUser } as any),
    );
