const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fetch = require('node-fetch');

async function testFrontend() {
  console.log("Fetching /store...");
  const res = await fetch('http://localhost:3000/store');
  const html = await res.text();
  
  console.log("Setting up JSDOM...");
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.on("error", (e) => console.error("JSDOM error:", e));
  virtualConsole.on("jsdomError", (e) => console.error("JSDOM jsdomError:", e));
  virtualConsole.on("log", (msg) => console.log("JSDOM log:", msg));
  
  const dom = new JSDOM(html, {
    url: "http://localhost:3000/store",
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
  });

  // Polyfill IntersectionObserver and fetch
  dom.window.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  dom.window.fetch = fetch;

  dom.window.document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded! Waiting 3 seconds for loadProducts()...");
    setTimeout(() => {
      console.log("Finding Buy Now button...");
      const buttons = dom.window.document.querySelectorAll('button.btn-accent');
      let buyNowBtn = null;
      for (let btn of buttons) {
        if (btn.textContent.includes('Buy Now')) {
          buyNowBtn = btn;
          break;
        }
      }
      
      if (buyNowBtn) {
        console.log("Clicking Buy Now button...");
        try {
          buyNowBtn.click();
          console.log("Click executed! Checking window.location...");
          console.log("Location:", dom.window.location.href);
        } catch (e) {
          console.error("Click threw error:", e);
        }
      } else {
        console.log("Buy Now button not found! HTML:");
        console.log(dom.window.document.getElementById('products-container')?.innerHTML);
      }
    }, 3000);
  });
}

testFrontend().catch(console.error);
