const puppeteer = require("puppeteer");
const { constants } = require("./constants");
const { credentials } = require("./credentials");
const { utills } = require("./utils");
const csvWriter = require('csv-writer');
const csv1 = require('csvtojson');
const fs = require('fs');

function salesNavigatorFindByIndustry(url) {
    (async () => {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(!url ? "https://www.linkedin.com/sales/search/company?savedSearchId=41426&searchSessionId=mfDBDu1JQjGO9Hr9rItk1w%3D%3D" : url, {
            waitUntil: "load",
            // Remove the timeout
            timeout: 0,
        });
        await page.waitForSelector(constants.IFRAME);
        const elementHandle = await page.$(constants.IFRAME);
        const frame = await elementHandle.contentFrame();
        await frame.waitForSelector(constants.USERNAME);
        const username = await frame.$(constants.USERNAME);
        const password = await frame.$(constants.PASSWORD);
        await username.type(credentials.username);
        await password.type(credentials.password);
        await page.keyboard.press("Enter");
        await page.waitForNavigation();
        await page.waitForSelector(constants.RESULT_ITEM);
        await utills.autoScroll(page);
        await utills.removeDom(page, constants.HELP_NAV_BAR);
        const noOfPage = await utills.getLastPageNumber(
            page,
            constants.PAGINATION_COUNT
        );
        let details = [];
        let detail;
        let
            listLength,
            companyName,
            companyLink;

        for (let currentPage = 1; currentPage < noOfPage; currentPage++) {
            if (currentPage > 1) {
                await page.waitForSelector(constants.RESULT_ITEM);
                await utills.autoScroll(page);
            }
            listLength = await utills.getLength(page, constants.RESULT_ITEM);
            for (let i = 1; i <= listLength; i++) {
                companyName = await utills.getText(
                    page,
                    utills.replaceIndex("#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__company-info .result-lockup__name a", i)
                );
                companyLink = await utills.getHref(
                    page,
                    utills.replaceIndex("#results .search-results__result-item:nth-of-type(${INDEX}) .result-lockup__company-info .result-lockup__name a", i)
                );

                detail = {
                    company: companyName,
                    linkedin_company_link: companyLink,
                }

                details.push(detail);
            }
            await page.waitForSelector(constants.RESULT_ITEM);
            (
                await page.$(
                    `.search-results__pagination-list button[data-page-number="${currentPage + 1
                    }"]`
                )
            ).click();
            await page.waitForNavigation();
        }

        const filename = 'output.csv';
        fs.writeFile(filename, extractheaders(details), err => {
            if (err) {
                console.log('Error writing to csv file', err);
            } else {
                console.log(`saved as ${filename}`);
            }
        });

    })();
}

  salesNavigatorFindByIndustry();

  function extractheaders(details) {
    const header = ["CompanyName, linkedin_Company_Link"];
    const rows = details.map(user =>
       `${user.company}, ${user.linkedin_company_link}`
    );
    return header.concat(rows).join("\n");
  
  }

  
  