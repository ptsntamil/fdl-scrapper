const puppeteer = require("puppeteer");
const { constants } = require("./constants");
const { credentials } = require("./credentials");
const { utills } = require("./utils");
const csvWriter = require('csv-writer');
const csv1 = require('csvtojson');
const fs = require('fs');

function crawlEachCompanyDetails(url) {
    (async () => {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto("https://www.linkedin.com/sales/login", {
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

        let linkedInUrl;
        let companyDetails = [];
        let company;
        let jsonData = [];
        const csvFilePath = 'output.csv' // Resource.csv in your case
        await csv1()
            .fromFile(csvFilePath)
            .then((jsonObj) => {
                jsonData = jsonObj;
            });


        for (let i = 0; i < jsonData.length; i++) {
            linkedInUrl = jsonData[i].linkedin_company_link;
            companyName = jsonData[i].Companyname;
            try {
                if (
                    linkedInUrl &&
                    linkedInUrl.indexOf("/search/") === -1 //&&
                ) {
                    await page.goto(linkedInUrl);
                    let website = await utills.getHref(page, constants.WEBSITE);
                    let address = await utills.getText(page, ".entity-card p.muted-copy");
                    let industry = address.split("·")[0].trim();
                    let headquarters = address.split("·")[1].trim();
                    let empCount = await utills.getText(page, constants.ALL_EMPLOYEES);
                    let decMakers = await utills.getText(page, constants.DECISION_MAKERS);

                    company = {
                        companyName,
                        website,
                        empCount,
                        decMakers,
                        headquarters,
                        industry
                    }

                    companyDetails.push(company);
                } else {
                    console.log(linkedInUrl);
                }
            } catch (err) {
                console.log(err);
            }

        }

        const filename = 'outputCompany.csv';
        fs.writeFile(filename, extractCompanyheaders(companyDetails), err => {
            if (err) {
                console.log('Error writing to csv file', err);
            } else {
                console.log(`saved as ${filename}`);
            }
        });
    })();

}

crawlEachCompanyDetails();

function extractCompanyheaders(companyDetails) {
    const header = ["CompanyName, Industry, Website, Headquarters, EmployeeCount, DecisionMakers"];
    const rows = companyDetails.map(user =>
        `"${user.companyName}", "${user.industry}", "${user.website}", "${user.headquarters}", "${user.empCount}", "${user.decMakers}",`
    );
    return header.concat(rows).join("\n");

}