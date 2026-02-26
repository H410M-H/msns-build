"use client";

import * as React from "react";

const TOAST_LIMIT = 1;
const DEFAULT_DISMISS_DELAY = 5000; // 5 seconds

interface ToasterToast {
  id: string;
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  className?: string;
  variant?: "default" | "destructive";
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const clearTimeoutForToast = (toastId: string) => {
  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }
};

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, DEFAULT_DISMISS_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      const newToasts = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT);
      newToasts.forEach((t) => clearTimeoutForToast(t.id));
      return { ...state, toasts: newToasts };
    }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case "DISMISS_TOAST": {
      const toastIds = action.toastId
        ? [action.toastId]
        : state.toasts.map((t) => t.id);

      toastIds.forEach((id) => {
        clearTimeoutForToast(id);
        addToRemoveQueue(id);
      });

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          toastIds.includes(t.id) ? { ...t, open: false } : t,
        ),
      };
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter((t) => t.id !== action.toastId)
          : [],
      };
  }
};

let count = 0;
function genId(): string {
  return (count++).toString();
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToasterToast, "id" | "open">;

function toast(props: Toast) {
  const id = genId();

  const update = (updateProps: Partial<ToasterToast>) => {
    dispatch({ type: "UPDATE_TOAST", toast: { ...updateProps, id } });
  };

  const dismiss = () => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  };

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      duration: props.duration ?? DEFAULT_DISMISS_DELAY,
    },
  });

  if (props.duration !== Infinity) {
    const delay = props.duration ?? DEFAULT_DISMISS_DELAY;
    const timeoutId = setTimeout(() => {
      dismiss();
    }, delay);
    toastTimeouts.set(id, timeoutId);
  }

  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        dispatch({ type: "DISMISS_TOAST", toastId });
      } else {
        dispatch({ type: "DISMISS_TOAST" });
      }
    },
  };
}

export { useToast, toast };
