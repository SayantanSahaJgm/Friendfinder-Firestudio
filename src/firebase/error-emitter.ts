
// A simple, typed event emitter for application-wide error handling.
// This allows different parts of the app to emit errors without being
// directly coupled to the component that will display them.

import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': FirestorePermissionError;
};

type Listener<T> = (payload: T) => void;

class TypedEventEmitter {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(
      (l) => l !== listener
    );
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => listener(payload));
  }
}

export const errorEmitter = new TypedEventEmitter();
