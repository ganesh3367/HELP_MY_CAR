

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log(`[API Timeout] ${url} took more than 60s, aborting.`);
            controller.abort();
        }, 60000); 

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) return response;

            
            try {
                const cloned = response.clone();
                const errorText = await cloned.text().catch(() => 'No error body');
                console.warn(`[API Error] ${url} status ${response.status}: ${errorText}`);
            } catch (_e) {
                console.warn(`[API Error] ${url} status ${response.status} (could not read body)`);
            }

            
            const contentType = response.headers.get('content-type') || '';
            const isHtml = contentType.includes('text/html');

            if ((response.status >= 500 || (response.status === 404 && isHtml)) && i < retries - 1) {
                console.log(`[API Retry ${i + 1}] Retrying ${url} due to server error or dormant backend (${response.status})`);
                await new Promise(r => setTimeout(r, 2000 * (i + 1))); 
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
