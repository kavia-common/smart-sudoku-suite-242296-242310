import { useMemo, useRef, useState } from 'react';

// PUBLIC_INTERFACE
function useUndoRedo(initialState) {
    /**
     * Simple undo/redo state manager.
     * Keeps past/present/future and exposes set/undo/redo/reset.
     */
    const initial = useMemo(() => initialState, [initialState]);
    const [past, setPast] = useState([]);
    const [present, setPresent] = useState(initial);
    const [future, setFuture] = useState([]);
    const presentIdRef = useRef(0);

    // PUBLIC_INTERFACE
    function set(next) {
        /** Push a new present state, adding current to past and clearing future. */
        setPast((p) => [...p, present]);
        setPresent(next);
        setFuture([]);
        presentIdRef.current += 1;
    }

    // PUBLIC_INTERFACE
    function undo() {
        /** Revert to previous state if available. */
        setPast((p) => {
            if (!p.length) {
                return p;
            }
            const prev = p[p.length - 1];
            setFuture((f) => [present, ...f]);
            setPresent(prev);
            presentIdRef.current += 1;
            return p.slice(0, -1);
        });
    }

    // PUBLIC_INTERFACE
    function redo() {
        /** Re-apply a future state if available. */
        setFuture((f) => {
            if (!f.length) {
                return f;
            }
            const next = f[0];
            setPast((p) => [...p, present]);
            setPresent(next);
            presentIdRef.current += 1;
            return f.slice(1);
        });
    }

    // PUBLIC_INTERFACE
    function reset(next) {
        /** Reset history and set a new present. */
        setPast([]);
        setFuture([]);
        setPresent(next);
        presentIdRef.current += 1;
    }

    return {
        past,
        present,
        future,
        set,
        undo,
        redo,
        reset,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        presentId: presentIdRef.current,
    };
}

export { useUndoRedo };
