import { useState, useCallback } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoActions<T> {
  set: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  reset: (newPresent: T) => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * A hook for managing undo/redo state.
 *
 * @param initialState - The initial state value
 * @param maxHistory - Maximum number of history entries to keep (default: 50)
 * @returns A tuple of [currentState, actions]
 *
 * @example
 * const [components, { set, undo, redo, canUndo, canRedo }] = useUndoRedo(initialComponents);
 *
 * // Update state (adds to history)
 * set(newComponents);
 *
 * // Undo last change
 * if (canUndo) undo();
 *
 * // Redo undone change
 * if (canRedo) redo();
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistory: number = 50
): [T, UndoRedoActions<T>] {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback(
    (newPresent: T) => {
      setState((currentState) => {
        // Don't add to history if value hasn't changed
        if (JSON.stringify(currentState.present) === JSON.stringify(newPresent)) {
          return currentState;
        }

        const newPast = [...currentState.past, currentState.present].slice(
          -maxHistory
        );

        return {
          past: newPast,
          present: newPresent,
          future: [], // Clear future on new action
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  return [
    state.present,
    {
      set,
      undo,
      redo,
      reset,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    },
  ];
}
