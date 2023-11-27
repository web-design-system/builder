import { Ref, ref } from "vue";

const changeEvent = "C";

export type State = any;
export class Action<T extends any = any> {
  readonly type: string;
  constructor(public readonly payload: T) {}
}

export type Reducer<S extends State, A extends Action> = (
  state: S,
  action: A
) => S | Promise<S> | void | Promise<void>;

export type Selector<T extends State, U extends any> = (state: T) => U;

class SetterAction<S extends State = any> extends Action {
  readonly type = ":set:";
  readonly payload: { key: keyof S; value: S[keyof S] };

  constructor(key: keyof S, value: S[keyof S]) {
    super(null);
    this.payload = { key, value };
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
    reducers.push({ type: action.prototype.type, R: reducer });
  }

  async function dispatch<A extends Action>(action: A) {
    const { type } = action;

    for (const reducer of reducers) {
      if (reducer.type === type) {
        state = await reducer.R(state, action) || state;
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
