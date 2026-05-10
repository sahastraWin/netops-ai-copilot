"use client";
import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;
const listeners: Array<(toasts: Toast[]) => void> = [];
let toastState: Toast[] = [];

function dispatch(toasts: Toast[]) {
  toastState = toasts;
  listeners.forEach((l) => l(toasts));
}

export function toast(opts: Omit<Toast, "id">) {
  const id = String(++toastCount);
  dispatch([...toastState, { ...opts, id }]);
  setTimeout(() => {
    dispatch(toastState.filter((t) => t.id !== id));
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastState);

  // Register listener
  if (!listeners.includes(setToasts)) {
    listeners.push(setToasts);
  }

  return { toasts, toast };
}
