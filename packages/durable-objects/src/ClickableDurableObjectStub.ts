type ClickableStubProperties<T extends Rpc.DurableObjectBranded | undefined> = {
  [K in keyof T]: K extends keyof DurableObjectStub<T>
    ? DurableObjectStub<T>[K]
    : never
}
type OtherStubProperties<T extends Rpc.DurableObjectBranded | undefined> = {
  [K in keyof DurableObjectStub<T> as K extends keyof T
    ? never
    : K]: DurableObjectStub<T>[K]
}
/**
 * Exactly the same as DurableObjectStub, except that TypeScript knows the
 * relationship between properties of the Durable Object class and the stub
 * properties, so they can be clicked on in an editor. Purely a DX
 * convenience.
 */
export type ClickableDurableObjectStub<
  T extends Rpc.DurableObjectBranded | undefined = undefined,
> = ClickableStubProperties<T> & OtherStubProperties<T>

//

// type ClickableStubProperties2<S extends Rpc.Provider<object>> =
//   S extends Rpc.Provider<infer T>
//     ? {
//         [K in keyof T]: K extends keyof S ? S[K] : never
//       }
//     : never

// type OtherStubProperties2<S extends Rpc.Provider<object>> =
//   S extends Rpc.Provider<infer T>
//     ? {
//         [K in keyof S as K extends keyof T ? never : K]: S[K]
//       }
//     : never
// /**
//  * Exactly the same as DurableObjectStub, except that TypeScript knows the
//  * relationship between properties of the Durable Object class and the stub
//  * properties, so they can be clicked on in an editor. Purely a DX
//  * convenience.
//  */
// export type ClickableDurableObjectStub2<S extends Rpc.Provider<object>> =
//   ClickableStubProperties2<S> & OtherStubProperties2<S>
