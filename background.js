const scanningURLs = new Set();
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status !== "complete" || !tab.url) {
        return;
    }

    if (
        tab.url.startsWith("about:") ||
        tab.url.startsWith("moz-extension://")
    ) {
        return;
    }

    const fullURL = tab.url;

    console.log("Checking URL:", fullURL);

    const cached= await browser.storage.local.get(fullURL);

    console.log("Cache checked:", cached);

    if (cached[fullURL]) {
        const cacheEntry = cached[fullURL];
        console.log( "Using cached result:", cacheEntry.result );
       
        const result = cacheEntry.result;

        if (result.risk === "SUSPICIOUS" || result.risk === "HIGH") {
            browser.tabs.sendMessage(tabId, {
                type: "PHISHING_DETECTED",
                risk: result.risk,
                malicious: result.malicious,
                suspicious: result.suspicious
            }).catch((error) => {
                console.log("Could not send warning:", error.message);
            });
        }
        return;
    }
    
    if (scanningURLs.has(fullURL)) { 
        console.log( "Already scanning this URL:", fullURL );
         return; 
        }
    
    scanningURLs.add(fullURL);

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/check?url=${encodeURIComponent(fullURL)}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Phishing Finder result:", result);

        if (result.risk!=="UNKNOWN"){

            const cacheEntry = {
                result: result,
                timestamp: Date.now()
            };

            await browser.storage.local.set({ [fullURL]: cacheEntry });
            console.log("Result cached for URL:", fullURL);
        }
        else {
            console.log("Result is UNKNOWN, not caching for URL:", fullURL);
        }


        if (result.risk === "SUSPICIOUS" || result.risk === "HIGH") {

            browser.tabs.sendMessage(tabId, {
                type: "PHISHING_DETECTED",
                risk: result.risk,
                malicious: result.malicious,
                suspicious: result.suspicious
            }).catch((error) => {
                console.log("Could not send warning:", error.message);
    });

        }


    } catch (error) {

        console.error("Backend error:", error);
    }
});
