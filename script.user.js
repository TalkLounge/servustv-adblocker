// ==UserScript==
// @name            ServusTV Adblocker
// @name:de         ServusTV Werbeblocker
// @version         1.0.0
// @description     Blocks Banner, Preroll & Midroll Ads on ServusTV.com
// @description:de  Blockiert Banner, Preroll & Midroll Werbungen auf ServusTV.com
// @icon            https://external-content.duckduckgo.com/ip3/www.servustv.com.ico
// @author          TalkLounge (https://github.com/TalkLounge)
// @namespace       https://github.com/TalkLounge/servustv-adblocker
// @license         MIT
// @match           https://www.servustv.com/*
// @match           https://www.m3u8player.online/embed/*
// ==/UserScript==

(function () {
    'use strict';
    let lastURL;

    async function init() {
        [...document.querySelectorAll(".ad-wrap")].forEach(item => item.parentNode?.remove());

        if (lastURL == window.location.pathname) {
            return;
        }

        lastURL = window.location.pathname;

        const url = window.location.pathname.split("/").filter(item => item).reverse();
        if (url[1] != "v") {
            return;
        }

        while (true) {
            if (document.querySelector(".theatre-mode>div>picture")) {
                break;
            }

            await new Promise(r => setTimeout(r, 100));
        }

        document.querySelector(".theatre-mode>div>picture").style.display = "none";
        document.querySelector(".theatre-mode>div>div").style.display = "none";

        document.querySelector(".theatre-mode>div>div + div div").style.display = "none";
        document.querySelector(".theatre-mode>div>div + div rbup-video-stv")?.remove();
        document.querySelector(".theatre-mode>div>div + div iframe")?.remove();

        let data = await fetch(`https://api-player.redbull.com/stv/servus-tv-playnet?videoId=${url[0].toUpperCase()}`, {
            "method": "GET",
            "referrer": "https://www.servustv.com/"
        });
        data = await data.json();

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.m3u8player.online/embed/m3u8?url=${encodeURIComponent(data.videoUrl)}`;
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.style.border = "none";
        iframe.style.aspectRatio = "16/9";
        iframe.allowFullscreen = true;

        document.querySelector(".theatre-mode>div>div + div").append(iframe);
    }

    async function deleteCookieBanner() {
        for (let i = 0; i < 4 * 10; i++) {
            if (document.querySelector(".fixed")) {
                document.querySelector(".fixed").remove();
                break;
            }

            await new Promise(r => setTimeout(r, 250));
        }
    }

    if (window.location.href.startsWith("https://www.servustv.com/") && window.top == window.self) { // Main Page
        window.setInterval(init, 250);
    } else if (window.location.href.startsWith("https://www.m3u8player.online/embed/m3u8") && window.top != window.self) { // Iframe
        deleteCookieBanner();
    }
})();