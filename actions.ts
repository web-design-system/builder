import { Action } from "./useState";

export type HistoryEntry = {
  message: string;
  snippet: string;
};

export class UndoAction extends Action {
  readonly type = "code:undo";
}

export class ApplyUpdateAction extends Action<string> {
  readonly type = "code:update";
}

export class ViewportSizeAction extends Action<string> {
  readonly type = "viewport:size";
  static readonly sizes = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    full: "100%",
  };
}

export class SetLayoutAction extends Action<string> {
  readonly type = "layout";
  static readonly layouts = {
    preview: "preview",
    code: "code",
    both: "both",
  };
}

export class HistoryLoadAction extends Action<null> {
  readonly type = "history:load";
}

export class HistoryLoadedAction extends Action {
  readonly type = "history:loaded";
  readonly payload: {
    history: HistoryEntry[];
    input: string;
    snippet: string;
  };
}

export class PublishAction extends Action {
  readonly type = "publish";
}

export class HistorySaveAction extends Action {
  readonly type = "history:save";
}

export class HistorySavedAction extends Action {
  readonly type = "history:saved";
}

export class UpdateAction extends Action {
  readonly type = "code:update";
}

export class UpdateCompletedAction extends Action {
  readonly type = "code:updated";
}
