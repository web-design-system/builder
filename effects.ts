import {
  HistorySaveAction,
  HistorySavedAction,
  ViewportSizeAction,
  HistoryLoadedAction,
  UndoAction,
  HistoryLoadAction,
  ApplyUpdateAction,
  UpdateAction,
  UpdateCompletedAction,
  PublishAction,
SetLayoutAction,
} from "./actions";

import { reduce, dispatch, set } from "./state";

reduce(HistorySaveAction, async (state) => {
  try {
    const { history, snippet, input } = state;

    await fetch("/components/" + state.componentId, {
      method: "POST",
      body: JSON.stringify({ history, snippet, input }),
    });
  } finally {
    dispatch(new HistorySavedAction(null));
  }
});

reduce(SetLayoutAction, (_, action) => set("layout", action.payload));
reduce(HistorySaveAction, () => set("saving", true));
reduce(HistorySavedAction, () => set("saving", false));
reduce(HistoryLoadedAction, (state, action) => {
  const { history = [], snippet = "", input = "" } = action.payload;
  return Object.assign({}, state, { history, snippet, input });
});

reduce(ViewportSizeAction, (state, action) => {
  return { ...state, viewportSize: action.payload };
});

reduce(PublishAction, async function (state) {
  if (!confirm("Sure?")) {
    return;
  }

  try {
    set("publishing", true);
    await fetch("/publish/" + state.componentId, { method: "POST" });
  } finally {
    set("publishing", false);
  }
});

reduce(HistoryLoadAction, async function load(state) {
  const history = await fetch("/components/" + state.componentId);
  const json = await history.json();
  dispatch(new HistoryLoadedAction(json));
});

reduce(UndoAction, function undo(state) {
  const list = state.history.slice();

  if (!list.length) {
    return;
  }

  const previous = list.pop()!;
  set("history", list);
  set("snippet", previous.snippet);
  set("input", previous.message);
  set("running", false);
});

reduce(UpdateAction, async () => set("running", true));
reduce(UpdateCompletedAction, async () => set("running", false));

reduce(UpdateAction, async (state) => {
  try {
    const body = JSON.stringify({
      history: state.history.map((h) => h.message),
      code: state.snippet,
      instruction: state.input,
    });

    const req = await fetch("/run", { method: "POST", body });
    const code = await req.text();

    dispatch(new ApplyUpdateAction(code));
  } finally {
    dispatch(new UpdateCompletedAction(null));
  }
});

reduce(ApplyUpdateAction, (state, action) => {
  if (action.payload) {
    state.snippet = sanitize(action.payload);
    state.history = state.history.concat({
      snippet: state.snippet,
      message: state.input,
    });
  }

  state.input = "";

  return { ...state };
});

function sanitize(code) {
  if (code.trim().includes("```")) {
    return code.replaceAll("```html", "").replaceAll("```", "");
  }

  return code;
}
