import { useEffect, useRef, useState } from 'react';

// PUBLIC_INTERFACE
function useTimer(initialSeconds, running) {
    /**
     * Lightweight timer that increments once per second while running.
     * @param {number} initialSeconds
     * @param {boolean} running
     */
    const [seconds, setSeconds] = useState(Number(initialSeconds || 0));
    const runningRef = useRef(running);
    runningRef.current = running;

    useEffect(() => {
        const id = setInterval(() => {
            if (runningRef.current) {
                setSeconds((s) => s + 1);
            }
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // PUBLIC_INTERFACE
    function setSecondsPublic(next) {
        /** Imperatively set timer seconds (used when importing/resetting). */
        setSeconds(Number(next || 0));
    }

    return { seconds, setSeconds: setSecondsPublic };
}

export { useTimer };
