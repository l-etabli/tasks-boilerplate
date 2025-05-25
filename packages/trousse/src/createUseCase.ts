type WhenNotVoid<K extends string, V, NewType = void> = V extends void
  ? {}
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

// type UnknownCallback<Uow, CurrentUser> = (args: {
//       input: any;
//       currentUser: CurrentUser;
//       uow: Uow;
//     }) => any

// export type ConfigureCreateUseCase = <Uow = void, CurrentUser = void>() => <
//   Cb extends UnknownCallback<Uow, CurrentUser>,
// >(
//   cb: Cb,
// ) => (
//   setupParams: { withUow: <T>(uowCb: (uow: Uow) => T) => T },
// ) => (params: WhenNotVoid<"input", Parameters<Cb>[0]["input"]> & { currentUser: CurrentUser }) => ReturnType<Cb>

// type UnknownCallback<Uow, CurrentUser> = (args: {
//   currentUser: CurrentUser;
//   uow: Uow;
//   [key: string]: any; // Allow additional properties like 'input'
// }) => any;

type UnknownCallback<Uow, CurrentUser> =
  | ((args: { currentUser: CurrentUser; uow: Uow }) => any)
  | ((args: { input: any; currentUser: CurrentUser; uow: Uow }) => any);

export function configureCreateUseCase<Uow = void, CurrentUser = void>(): <
  Cb extends UnknownCallback<Uow, CurrentUser>,
>(
  cb: Cb,
) => (setupParams: {
  withUow: <T>(uowCb: (uow: Uow) => T) => T;
}) => (
  params: Cb extends (args: { input: infer I; [K: string]: any }) => any
    ? {
        input: I;
        currentUser: CurrentUser;
      }
    : {
        currentUser: CurrentUser;
      },
) => ReturnType<Cb>;

// Implementation
export function configureCreateUseCase() {
  return (cb: any) =>
    ({ withUow = (uowCb: any) => uowCb() }: any) =>
    (params: any) =>
      withUow((uow: any) => cb({ input: params.input, uow, currentUser: params.currentUser }));
}
