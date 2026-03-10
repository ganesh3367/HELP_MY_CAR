/**
 * api.js
 * Shared API utility with retry logic and timeout handling.
 */

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s per attempt

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) return response;

            // If server error (5xx), retry
            if (response.status >= 500 && i < retries - 1) {
                console.log(`[API Retry ${i + 1}] Retrying ${url} due to server error ${response.status}`);
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                continue;
            }
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (i === retries - 1) throw error;
            console.log(`[API Retry ${i + 1}] Retrying ${url} due to network error: ${error.message}`);
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
};
