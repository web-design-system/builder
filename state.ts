import { useState } from "./useState";
import {
  HistoryEntry,
  SetViewportSizeAction,
  SetLayoutAction,
} from "./actions";

const { select, set, reduce, dispatch } = useState({
  layoutOptions: Object.entries(SetLayoutAction.layouts).map(([a, b]) => ({
    value: b,
    label: a,
  })),
  viewportSizes: Object.entries(SetViewportSizeAction.sizes).map(([a, b]) => ({
    value: b,
    label: a,
  })),
  viewportSize: SetViewportSizeAction.sizes.full,
  layout: SetLayoutAction.layouts.both,
  showCode: true,
  showConsole: true,
  history: [] as HistoryEntry[],
  input: "",
  snippet: "",
  running: false,
  publishing: false,
  saving: false,
  componentId: window.location.pathname.replace("/edit/", ""),
});

export { select, dispatch, reduce, set };
