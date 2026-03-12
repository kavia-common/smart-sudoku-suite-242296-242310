import React, { useEffect } from 'react';

// PUBLIC_INTERFACE
function ToastRegion({ toasts, onDismiss }) {
    /** Toast notifications shown at the bottom of the screen. */
    useEffect(() => {
        const timers = toasts.map((t) =>
            setTimeout(() => {
                onDismiss(t.id);
            }, 3500)
        );
        return () => timers.forEach((id) => clearTimeout(id));
    }, [onDismiss, toasts]);

    return (
        <div className="toastRegion" aria-live="polite" aria-relevant="additions">
            {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.kind}`} role="status">
                    {t.message}
                </div>
            ))}
        </div>
    );
}

export { ToastRegion };
