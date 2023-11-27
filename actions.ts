import { Action } from "./useState";

export type HistoryEntry = {
  message: string;
  snippet: string;
};

export class UndoAction extends Action {
  static readonly type = "code:undo";
}

export class ApplyUpdateAction extends Action<string> {
  static readonly type = "code:update";
}

export class ViewportSizeAction extends Action<string> {
  static readonly type = "viewport:size";
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
  static readonly type = "layout";
  static readonly layouts = {
    preview: "preview",
    code: "code",
    both: "both",
  };
}

export class HistoryLoadAction extends Action<null> {
  static readonly type = "history:load";
}

export class HistoryLoadedAction extends Action {
  static readonly type = "history:loaded";
  readonly payload: {
    history: HistoryEntry[];
    input: string;
    snippet: string;
  };
}

export class PublishAction extends Action {
  static readonly type = "publish";
}

export class HistorySaveAction extends Action {
  static readonly type = "history:save";
}

export class HistorySavedAction extends Action {
  static readonly type = "history:saved";
}

export class UpdateAction extends Action {
  static readonly type = "code:update";
}

export class UpdateCompletedAction extends Action {
  static readonly type = "code:updated";
}
