function showWarning(risk, malicious, suspicious){
    console.log("Showing warning:", risk);
    const warning= document.createElement('div');

    warning.id='phishing-finder-warning';

    if (risk=="HIGH"){
        warning.innerText="🚨 High-risk website detected";
    }else{
        warning.textContent = "⚠️ Suspicious website detected";
    }
    warning.style.position='fixed';
    warning.style.top="20px";
    warning.style.right="20px";
    warning.style.zIndex="2147483647"

    warning.style.padding="16px 20px";
    warning.style.borderRadius="10px";

    warning.style.backgroundColor=risk==="HIGH"? "rgb(173, 0, 0)" : "rgba(0, 47, 133, 0.8)";
    warning.style.color="white";

    warning.style.fontFamily="Arial, sans-serif";
    warning.style.fontSize="16px";
    warning.style.fontWeight="bold";

    warning.style.boxShadow="0 4px 6px rgba(6, 0, 55, 0.1)";

    document.body.appendChild(warning); //adding it to website 

    //remove after 5 seconds
    setTimeout(()=>{
        warning.remove();
    },5000);
}

browser.runtime.onMessage.addListener((message)=>{
    console.log("Received message:", message);
    if(message.type === "PHISHING_DETECTED"){
        showWarning(
            message.risk,
            message.malicious,
            message.suspicious
        );
    }
})
