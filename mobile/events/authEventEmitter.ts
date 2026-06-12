// events/authEventEmitter.ts
type Listener = () => void;
const listeners: Record<string, Listener[]> = {};

export const authEventEmitter = {
  emit: (event: string) => listeners[event]?.forEach((fn) => fn()),
  on: (event: string, fn: Listener) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  },
  off: (event: string, fn: Listener) => {
    listeners[event] = listeners[event]?.filter((l) => l !== fn) ?? [];
  },
};