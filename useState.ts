import { Ref, ref } from "vue";

const changeEvent = "C";

export type State = any;
export class Action<T extends any = any> {
  static readonly type: string;
  readonly payload: T;
  constructor(payload?: T) {
    if (payload !== undefined) {
      this.payload = payload;
    }
  }
}

export type Reducer<S extends State, A extends Action> = (
  state: S,
  action: A
) => S | Promise<S> | void | Promise<void>;

export type Selector<T extends State, U extends any> = (state: T) => U;

class SetterAction<S extends State = any> extends Action<{
  key: keyof S;
  value: S[keyof S];
}> {
  static readonly type = ":set:";

  constructor(key: keyof S, value: S[keyof S]) {
    super({ key, value });
  }
}

function setterReducer<S extends State>(state: S, action: SetterAction<S>) {
  return Object.assign({}, state, {
    [action.payload.key]: action.payload.value,
  });
}

export function useState<StateType extends State>(initial: StateType) {
  let state: StateType = initial;
  const events = new EventTarget();
  const reducers: Array<{ type: string; R: Reducer<StateType, any> }> = [];

  function select<U extends any>(f: Selector<StateType, U>) {
    const v = ref<any>(f(state));

    events.addEventListener(changeEvent, () => {
      const newValue = f(state);
      if (v.value !== newValue) {
        v.value = newValue;
      }
    });

    return v as Ref<U>;
  }

  function reduce<
    A extends typeof Action<any>,
    R extends Reducer<StateType, InstanceType<A>>
  >(action: A, reducer: R) {
    reducers.push({ type: action.type, R: reducer });
  }

  async function dispatch<A extends Action>(action: A) {
    const type: string = Object.getPrototypeOf(action).constructor.type;

    for (const reducer of reducers) {
      if (reducer.type === type) {
        state = (await reducer.R(state, action)) || state;
      }
    }

    events.dispatchEvent(new CustomEvent(changeEvent));
  }

  function set<K extends keyof StateType, V extends StateType[K]>(
    key: K,
    value: V
  ) {
    dispatch(new SetterAction<StateType>(key, value));
  }

  reduce(SetterAction as any, setterReducer);

  return { select, dispatch, reduce, set };
}
