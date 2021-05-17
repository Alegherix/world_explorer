// Used for loadtesting the socket server
const { chromium } = require('playwright');

const TTK = 20000;

const openBrowser = async () => {
  const startTime = new Date().getTime();
  console.log('Opening Browser');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  while (true) {
    if (new Date().getTime() > startTime + TTK) {
      console.log('Should kill browser');
      await browser.close();
      break;
    }
  }
};

// Returns a Promise that resolves after "ms" Milliseconds
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function load() {
  // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < 5; i++) {
    openBrowser();
    await timer(200); // then the created Promise can be awaited
  }
}

load();
