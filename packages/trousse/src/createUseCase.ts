import type { StandardSchemaV1 } from "@standard-schema/spec";
import { standardValidate } from "./standardSchemaValidate.js";

type WhenNotVoid<K extends string, V, NewType = void> = V extends void
  ? Record<string, never>
  : { [k in K]: NewType extends void ? V : NewType };

// export type CreateUseCase<U = void, CU = void> = <
//   Cb extends (
//     args: {
//       input: unknown;
//       currentUser: CurrentUser;
//     } & WhenNotVoid<"deps", Deps> &
//       WhenNotVoid<"uow", Uow>,
//   ) => unknown,
//   Uow,
//   CurrentUser,
//   Deps,
// >(
//   cb: Cb,
// ) => (
//   setupParams: WhenNotVoid<"deps", Deps> &
//     WhenNotVoid<"withUow", Uow, <T>(uowCb: (uow: Uow) => T) => T>,
// ) => (
//   params: WhenNotVoid<"input", Parameters<Cb>[0]["input"]> & {
//     currentUser: CurrentUser;
//   },
// ) => ReturnType<Cb>;

// export const createUseCase: CreateUseCase =
//   (cb) =>
//   ({ deps, withUow = (uowCb: any) => uowCb() }: any) =>
//   (params: any) =>
//     withUow((uow: any) =>
//       cb({
//         deps,
//         input: params.input,
//         uow,
//         currentUser: params.currentUser,
//       } as any),
//     );

// // Function overloads for configureCreateUseCase
// export function configureCreateUseCase<Uow = void, CurrentUser = void>(): {
//   // Method to specify Input type first, then infer Output from callback
//   withInput<Input>(): <Output>(
//     cb: (args: { input: Input; currentUser: CurrentUser; uow: Uow }) => Output,
//   ) => (setupParams: {
//     withUow: <T>(uowCb: (uow: Uow) => T) => T;
//   }) => (params: { input: Input; currentUser: CurrentUser }) => Output;

//   // Direct call for callbacks without input parameter
//   <Output>(
//     cb: (args: { currentUser: CurrentUser; uow: Uow }) => Output,
//   ): (setupParams: {
//     withUow: <T>(uowCb: (uow: Uow) => T) => T;
//   }) => (params: { currentUser: CurrentUser }) => Output;
// };

// // Implementation
// export function configureCreateUseCase() {
//   const baseFunction =
//     (cb: any) =>
//     ({ withUow = (uowCb: any) => uowCb() }: any) =>
//     (params: any) =>
//       withUow((uow: any) => cb({ input: params.input, uow, currentUser: params.currentUser }));

//   // Add the withInput method that returns a function that takes the callback
//   baseFunction.withInput = () => baseFunction;

//   return baseFunction;
// }

type UseCaseBuilder<Output, Input, Deps, Uow, CurrentUser> = {
  withInput: <I>(schema?: StandardSchemaV1<I>) => UseCaseBuilder<Output, I, Deps, Uow, CurrentUser>;
  withOutput: <O>() => UseCaseBuilder<O, Input, Deps, Uow, CurrentUser>;
  withDeps: <D>() => UseCaseBuilder<Output, Input, D, Uow, CurrentUser>;
  withUow: <U>() => UseCaseBuilder<Output, Input, Deps, U, CurrentUser>;
  withCurrentUser: <CU>(
    schema?: StandardSchemaV1<CU>,
  ) => UseCaseBuilder<Output, Input, Deps, Uow, CU>;
  build: <
    Cb extends (
      args: WhenNotVoid<"inputParams", Input> &
        WhenNotVoid<"currentUser", CurrentUser> &
        WhenNotVoid<"deps", Deps> &
        WhenNotVoid<"uow", Uow>,
    ) => Output,
  >(
    cb: Cb,
  ) => (
    setupParams: WhenNotVoid<"deps", Deps> &
      WhenNotVoid<"withUow", Uow, <T>(uowCb: (uow: Uow) => T) => T>,
  ) => (runtimeParams: { inputParams: Input; currentUser: CurrentUser }) => ReturnType<Cb>;
};

export const useCaseBuilder = <Output, Input = void, Deps = void, Uow = void, CurrentUser = void>(
  options: {
    inputSchema?: StandardSchemaV1<Input>;
    currentUserSchema?: StandardSchemaV1<CurrentUser>;
  } = {},
): UseCaseBuilder<Output, Input, Deps, Uow, CurrentUser> => ({
  withInput: <I>(inputSchemaOverload?: StandardSchemaV1<I>) =>
    useCaseBuilder<Output, I, Deps, Uow, CurrentUser>({
      ...options,
      inputSchema: inputSchemaOverload,
    }),
  withOutput: <O>() => useCaseBuilder<O, Input, Deps, Uow, CurrentUser>(options),
  withDeps: <D>() => useCaseBuilder<Output, Input, D, Uow, CurrentUser>(options),
  withUow: <U>() => useCaseBuilder<Output, Input, Deps, U, CurrentUser>(options),
  withCurrentUser: <CU>(currentUserSchemaOverload?: StandardSchemaV1<CU>) =>
    useCaseBuilder<Output, Input, Deps, Uow, CU>({
      ...options,
      currentUserSchema: currentUserSchemaOverload,
    }),
  build:
    (cb) =>
    ({ deps, withUow = (uowCb: any) => uowCb() }) =>
    ({ inputParams, currentUser }) => {
      return withUow((uow: any) => {
        const parsedInputParams = options.inputSchema
          ? standardValidate(options.inputSchema, inputParams)
          : inputParams;
        return cb({ uow, inputParams: parsedInputParams, currentUser, deps } as any);
      });
    },
});
