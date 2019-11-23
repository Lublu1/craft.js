import produce, { PatchListener } from 'immer';
import { createStore, Unsubscribe } from 'redux';
import { useMemo, useEffect } from 'react';

type Subscriber = (listener: () => void) => Unsubscribe;

export type SubscriberAndCallbacksFor<M extends MethodsOrOptions, Q extends QueryMethods = null> = {
  subscribe: Subscriber,
  getState: () => { prev: StateFor<M>, current: StateFor<M> },
  actions: CallbacksFor<M>,
  query: QueryCallbacksFor<Q>
};

export type StateFor<M extends MethodsOrOptions> = M extends MethodsOrOptions<infer S, any>
  ? S
  : never;

export type CallbacksFor<M extends MethodsOrOptions> = M extends MethodsOrOptions<any, infer R>
  ? {
    [T in ActionUnion<R>['type']]: (
      ...payload: ActionByType<ActionUnion<R>, T>['payload']
    ) => void
  }
  : never;

export type Methods<S = any, R extends MethodRecordBase<S> = any, Q = any> = (state?: S, query?: Q) => R;

export type Options<S = any, R extends MethodRecordBase<S> = any, Q=any> = {
  methods: Methods<S, R, Q>;
  patchListener?: PatchListener;
};

export type MethodsOrOptions<S = any, R extends MethodRecordBase<S> = any, Q=any> =
  | Methods<S, R, Q>
  | Options<S, R, Q>;

export type MethodRecordBase<S = any> = Record<
  string,
  (...args: any[]) => S extends object ? S | void : S
>;

export type ActionUnion<R extends MethodRecordBase> = {
  [T in keyof R]: { type: T; payload: Parameters<R[T]> }
}[keyof R];

export type ActionByType<A, T> = A extends { type: infer T2 } ? (T extends T2 ? A : never) : never;


export type QueryMethods<S = any, O = any, R extends MethodRecordBase<S> = any> = (state?: S, options?: O) => R;
export type QueryCallbacksFor<M extends QueryMethods> = M extends QueryMethods<any, any, infer R>
  ? {
    [T in ActionUnion<R>['type']]: (...payload: ActionByType<ActionUnion<R>, T>['payload']) => ReturnType<R[T]>
  }
  : never;



export function createReduxMethods<S, R extends MethodRecordBase<S>, Q extends QueryMethods>(
  methodsOrOptions: Methods<S, R, QueryCallbacksFor<Q>>, // methods to manipulate the state
  initialState: any,
  queryMethods?: Q // methods to perform some queries/transformation on the current state
): SubscriberAndCallbacksFor<MethodsOrOptions<S, R>, Q> {

  let prevState = initialState;
  let methods: Methods<S, R>;
  let patchListener: PatchListener | undefined;
  if (typeof methodsOrOptions === 'function') {
    methods = methodsOrOptions;
  } else {
    // methods = methodsOrOptions.methods;
    // patchListener = methodsOrOptions.patchListener;
  }

  const reducer = (state: S, action: ActionUnion<R>) => {
    return (produce as Function)(
      state,
      (draft: S) => {
        if (methods(draft, queryMethods && queryMethods(state))[action.type]) {
          return methods(draft, queryMethods && queryMethods(state))[action.type](...action.payload)
        }
      },
      patchListener,
    );
  }
  const methodsFactory = methods;

  const { state, dispatch, subscribe, getState } = createStore(reducer, initialState);

  let currentState = getState();

  const query = queryMethods ? (Object.keys(queryMethods()) as Array<keyof QueryCallbacksFor<typeof methods>>).reduce((accum, key) => {
    return {
      ...accum,
      [key]: (...args: any) => queryMethods(currentState)[key](...args)
    };
  }, {} as QueryCallbacksFor<typeof queryMethods>) : null;

  const actionTypes: ActionUnion<R>['type'][] = Object.keys(methodsFactory(state, query)),
        actions = actionTypes.reduce(
          (accum, type) => {
            accum[type] = (...payload) => {

              prevState = { ...getState() };

              return dispatch({ type, payload } as ActionUnion<R>)
            };
            return accum;
          },
          {} as CallbacksFor<typeof methodsFactory>,
        );


  const unsubscribe = useMemo(() => {
    return subscribe(() => {
      currentState = getState();
    });
  }, []);

  useEffect(() => {
    return (() => {
      unsubscribe();
    })
  })
  
  return {
    subscribe,
    getState: () => ({ prev: prevState, current: currentState }),
    actions,
    query
  };
}