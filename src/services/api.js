/**
 * api.js
 * Shared API utility with retry logic and timeout handling.
 */

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log(`[API Timeout] ${url} took more than 60s, aborting.`);
            controller.abort();
        }, 60000); // 60s per attempt for Render cold starts

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) return response;

            // Log non-ok responses
            const errorText = await response.text().catch(() => 'No error body');
            console.warn(`[API Error] ${url} status ${response.status}: ${errorText}`);

            // If server error (5xx), retry
            if (response.status >= 500 && i < retries - 1) {
                console.log(`[API Retry ${i + 1}] Retrying ${url} due to server error ${response.status}`);
                await new Promise(r => setTimeout(r, 2000 * (i + 1))); // Increased delay
                continue;
            }
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (i === retries - 1) {
                console.error(`[API Final Failure] ${url} after ${retries} attempts:`, error.message);
                throw error;
            }
            console.log(`[API Retry ${i + 1}] Retrying ${url} due to: ${error.message}`);
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
    }
};
