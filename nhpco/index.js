const puppeteer = require("puppeteer");
const { utills } = require("../utils");
const csvWriter = require("csv-writer");

let fields = ["name", "address", "link"];
function nhpco(url) {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(
      !url ? "https://www.nhpco.org/find-a-care-provider/" : url,
      {
        waitUntil: "load",
        // Remove the timeout
        timeout: 100000,
      }
    );
    // await page.waitForNavigation();
    await page.waitForSelector(".providers__list #results");
    let listLength = await utills.getLength(page, ".provider__item.all");
    console.log("listLength", listLength);
    let results = [];
    let companyName =
      ".providers__list #results .provider__item.all:nth-of-type(${INDEX}) h3";
    let companyAddress =
      ".providers__list #results .provider__item.all:nth-of-type(${INDEX}) p";
    let companyLink =
      ".providers__list #results .provider__item.all:nth-of-type(${INDEX}) a";
    for (let i = 1; i <= listLength; i++) {
      let name = await utills.getText(
        page,
        utills.replaceIndex(companyName, i)
      );
      let address = await utills.getText(
        page,
        utills.replaceIndex(companyAddress, i)
      );
      let link = await utills.getHref(
        page,
        utills.replaceIndex(companyLink, i)
      );
      results.push({
        name,
        address,
        link,
      });
    }
    let contactInfo =
      ".provider__data__box:first-child .provider__data__box__list p";
    for (let i = 0; i < results.length; i++) {
      console.log("goto" + "  " + i, results[i].link);
      await page.goto(results[i].link);
      await page.waitForSelector(".provider__data__box");
      let newUpdate = await getContactInfo(page, contactInfo);
      results[i] = { ...results[i], ...newUpdate };
      fields = new Set([...fields, ...Object.keys(results[i])]);
    }
    await page.close();
    convertToCSV(results);
  })();
}

nhpco();
async function getContactInfo(page, selector) {
  return await page.evaluate((sel) => {
    var res = {};
    document.querySelectorAll(sel).forEach(async (el) => {
      res[
        el.firstElementChild.innerText.toLowerCase().replace(" ", "")
      ] = el.innerText
        .replace(el.firstElementChild.innerText, "")
        .replace("\n\n", "");
    });
    return res;
  }, selector);
}

let convertToCSV = (content) => {
  let fieldsArr = Array.from(fields);
  let fieldsObj = [];
  for (let j = 0; j < fieldsArr.length; j++) {
    fieldsObj.push({ id: fieldsArr[j], title: fieldsArr[j] });
  }
  const date = new Date();
  const month = date.getMonth() + 1;
  const csv = csvWriter.createObjectCsvWriter({
    path: `./NHPCO-${date.getFullYear()}-${month}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.csv`,
    header: fieldsObj,
  });
  csv
    .writeRecords(content)
    .then(() => console.log("The CSV file was written successfully"));
};
