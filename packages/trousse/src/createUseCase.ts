type WhenNotVoid<K extends string, V, NewType = void> = V extends void
  ? {}
  : { [k in K]: NewType extends void ? V : NewType };

export type CreateUseCase<U = void, CU = void> = <
  InputParams,
  Output,
  Uow = U,
  CurrentUser = CU,
  Deps = void,
>(
  cb: (
    args: {
      inputParams: InputParams;
      currentUser: CurrentUser;
    } & WhenNotVoid<"deps", Deps> &
      WhenNotVoid<"uow", Uow>,
  ) => Output,
) => (
  setupParams: WhenNotVoid<"deps", Deps> &
    WhenNotVoid<"withUow", Uow, <T>(uowCb: (uow: Uow) => T) => T>,
) => (params: { inputParams: InputParams; currentUser: CurrentUser }) => Output;

export const createUseCase: CreateUseCase =
  (cb) =>
  ({ deps, withUow = (uowCb: any) => uowCb() }: any) =>
  ({ inputParams, currentUser }) =>
    withUow((uow: any) => cb({ deps, inputParams, uow, currentUser } as any));
