import type { StandardSchemaV1 } from "@standard-schema/spec";
import { standardValidate } from "./standardSchemaValidate.js";

type WhenNotVoid<K extends string, V, NewType = void> = V extends void
  ? { [k in K]?: never }
  : // ? Record<string, unknown>
    { [k in K]: NewType extends void ? V : NewType };

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
      args: WhenNotVoid<"input", Input> &
        WhenNotVoid<"currentUser", CurrentUser> &
        WhenNotVoid<"deps", Deps> &
        WhenNotVoid<"uow", Uow>,
    ) => Output,
  >(
    cb: Cb,
  ) => (
    setupParams: WhenNotVoid<"deps", Deps> &
      WhenNotVoid<"withUow", Uow, <T>(uowCb: (uow: Uow) => T) => T>,
  ) => (
    runtimeParams: WhenNotVoid<"input", Input> & WhenNotVoid<"currentUser", CurrentUser>,
  ) => ReturnType<Cb>;
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
    ({ deps, withUow = ((uowCb: any) => uowCb()) as any }) =>
    ({ input, currentUser }) =>
      withUow((uow: any) => {
        const parsedInput = options.inputSchema
          ? standardValidate(options.inputSchema, input as any)
          : input;
        return cb({ uow, input: parsedInput, currentUser, deps } as any);
      }),
});
