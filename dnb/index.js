const puppeteer = require("puppeteer");
const { constants } = require("./constants");
const { credentials } = require("./credentials");
// const { utills } = require("./utils");
// const { Company } = require("./data/company/index");
// const { People } = require("./data/people/index");

function salesNavigator(url) {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(!url ? "https://app.dnbhoovers.com/login" : url, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });
    await page.waitForSelector("#login");
    const username = await page.$(constants.USERNAME);
    const password = await page.$(constants.PASSWORD);
    await username.type(credentials.username);
    await page.keyboard.press("Enter");
    await page.waitForSelector(constants.PASSWORD_SLIDE);
    await password.type(credentials.password);
    await (await page.$(".continue-btn")).click();
  })();
}

salesNavigator();
