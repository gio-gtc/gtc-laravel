import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

export function ToastHost() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    if (!ready) {
        return null;
    }

    return (
        <ToastContainer
            position="top-right"
            autoClose={8000}
            closeOnClick
            pauseOnHover
            newestOnTop
            rtl={false}
        />
    );
}
