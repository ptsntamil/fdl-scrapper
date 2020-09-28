const puppeteer = require("puppeteer");
const { constants } = require("./constants");
const { credentials } = require("./credentials");
const { utills } = require("./utils");
const { Company } = require("./data/company/index");
const { People } = require("./data/people/index");
const SOURCE = 1;
function salesNavigator(url) {
  (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(!url ? "https://www.linkedin.com/sales/login" : url, {
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
    await page.waitForSelector(constants.SEARCH_INPUT);
    const search = await page.$(constants.SEARCH_INPUT);
    await search.type("CEO india");
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    await page.waitForSelector(constants.RESULT_ITEM);
    await utills.autoScroll(page);
    await utills.removeDom(page, constants.HELP_NAV_BAR);
    const noOfPage = await utills.getLastPageNumber(
      page,
      constants.PAGINATION_COUNT
    );
    const company = new Company();
    const people = new People();
    let nameSelector,
      peopleName,
      listLength,
      profileLink,
      position,
      companyName,
      companyLink,
      duration,
      city,
      companyID,
      comp;
    for (let currentPage = 1; currentPage < noOfPage; currentPage++) {
      if (currentPage > 1) {
        await page.waitForSelector(constants.RESULT_ITEM);
        await utills.autoScroll(page);
      }
      listLength = await utills.getLength(page, constants.RESULT_ITEM);
      for (let i = 1; i <= listLength; i++) {
        nameSelector = constants.NAME.replace("${INDEX}", i);
        peopleName = await utills.getText(page, nameSelector);
        profileLink = await utills.getHref(page, nameSelector);
        position = await utills.getText(
          page,
          constants.POSITION.replace("${INDEX}", i)
        );
        companyName = await utills.getText(
          page,
          utills.replaceIndex(constants.COMPANY, i)
        );
        companyLink = await utills.getHref(
          page,
          utills.replaceIndex(constants.COMPANYLINK, i)
        );
        duration = await utills.getText(
          page,
          utills.replaceIndex(constants.DURATION, i)
        );
        city = await utills.getText(
          page,
          utills.replaceIndex(constants.CITY, i)
        );
        companyID = companyLink
          ? parseInt(companyLink.split("/").slice(-1))
          : 0;
        comp = await company.createOrUpdateByLinkedInID({
          name: companyName,
          linkedin_profile_link: companyLink,
          city,
          linkedin_profile_id: Number.isNaN(companyID) ? 0 : companyID,
          source: 1,
        });
        await people.createPeople({
          name: peopleName,
          linkedin_profile_link: profileLink,
          position,
          company: comp ? comp.id || comp.insertId : null,
          city,
          duration,
          source: 1,
        });
      }
      await page.waitForSelector(constants.RESULT_ITEM);
      (
        await page.$(
          `.search-results__pagination-list button[data-page-number="${
            currentPage + 1
          }"]`
        )
      ).click();
      await page.waitForNavigation();
    }
  })();
}

//salesNavigator();
//crawlCompanies();
//linkedinProfile();
crawlProfile();
function linkedinProfile(url) {
  (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(!url ? "https://www.linkedin.com/login" : url, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });
    const usernameDom = await page.$("#username");
    await usernameDom.type(credentials.username);
    const passwordDom = await page.$("#password");
    await passwordDom.type(credentials.password);
    page.keyboard.press("Enter");
    page.goto("");
  })();
}

function crawlCompanies() {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
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
    let company = new Company();
    let linkedInUrl,
      response,
      companies,
      end,
      total,
      pageNo = 1;
    do {
      response = await company.getAllWithPagination({
        page: pageNo,
        limit: 20,
      });
      companies = response.data;
      end = response.end;
      total = response.total;
      console.log(`total==${total} end====${end}`);
      for (let i = 0; i < companies.length; i++) {
        linkedInUrl = companies[i].linkedin_profile_link;
        let company1 = companies[i];
        try {
          if (
            linkedInUrl &&
            linkedInUrl.indexOf("/search/") === -1 //&&
            //!company1.website
          ) {
            // await page.goto(companies[i].linkedin_profile_link);
            // let website = await utills.getHref(page, constants.WEBSITE);
            // await company.update(companies[i].id, { website });
            // let allEmp = await page.$(constants.ALL_EMPLOYEES);
            // await allEmp.click();
            // await getResultsFromGrid(page, company1.id);
            await page.goto(companies[i].linkedin_profile_link);
            let decMakers = await page.$(constants.DECISION_MAKERS);
            await decMakers.click();
            await getResultsFromGrid(page, company1.id);
          } else {
            console.log(linkedInUrl);
          }
        } catch (err) {
          console.log(err);
        }
      }
      pageNo++;
    } while (end < total);
  })();
}

async function getResultsFromGrid(page, companyId) {
  await page.waitForSelector(constants.RESULT_ITEM);
  await utills.autoScroll(page);
  await utills.removeDom(page, constants.HELP_NAV_BAR);
  const noOfPage = await utills.getLastPageNumber(
    page,
    constants.PAGINATION_COUNT
  );
  //const company = new Company();
  const people = new People();
  let nameSelector,
    peopleName,
    listLength,
    profileLink,
    position,
    duration,
    city;
  for (let currentPage = 1; currentPage < noOfPage; currentPage++) {
    if (currentPage > 1) {
      await page.waitForSelector(constants.RESULT_ITEM);
      await utills.autoScroll(page);
    }
    listLength = await utills.getLength(page, constants.RESULT_ITEM);
    for (let i = 1; i <= listLength; i++) {
      nameSelector = constants.NAME.replace("${INDEX}", i);
      peopleName = await utills.getText(page, nameSelector);
      profileLink = await utills.getHref(page, nameSelector);
      position = await utills.getText(
        page,
        constants.POSITION.replace("${INDEX}", i)
      );
      // companyName = await utills.getText(
      //   page,
      //   utills.replaceIndex(constants.COMPANY, i)
      // );
      // companyLink = await utills.getHref(
      //   page,
      //   utills.replaceIndex(constants.COMPANYLINK, i)
      // );
      duration = await utills.getText(
        page,
        utills.replaceIndex(constants.DURATION, i)
      );
      city = await utills.getText(page, utills.replaceIndex(constants.CITY, i));
      // companyID = companyLink ? parseInt(companyLink.split("/").slice(-1)) : 0;
      // comp = await company.createOrUpdateByLinkedInID({
      //   name: companyName,
      //   linkedin_profile_link: companyLink,
      //   city,
      //   linkedin_profile_id: Number.isNaN(companyID) ? 0 : companyID,
      //   source: 1,
      // });
      await people.createOrUpdate({
        name: peopleName,
        linkedin_profile_link: profileLink,
        position,
        company: companyId,
        city,
        duration,
        source: 1,
      });
    }
    await page.waitForSelector(constants.RESULT_ITEM);
    (
      await page.$(
        `.search-results__pagination-list button[data-page-number="${
          currentPage + 1
        }"]`
      )
    ).click();
    try {
      await page.waitForNavigation();
    } catch (err) {
      console.log(err);
    }
  }
}

function crawlProfile() {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
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
    const people = new People();
    let linkedInUrl,
      response,
      peoples,
      end,
      total,
      pageNo = 1;
    do {
      response = await people.getAllWithPagination({
        page: pageNo,
        limit: 1,
      });
      peoples = response.data;
      end = response.end;
      total = response.total;
      console.log(`total==${total} end====${end}`);
      for (let i = 0; i < peoples.length; i++) {
        linkedInUrl = peoples[i].linkedin_profile_link;
        let company1 = peoples[i];
        try {
          if (linkedInUrl && linkedInUrl.indexOf("/search/") === -1) {
            // await page.goto(peoples[i].linkedin_profile_link);
            if (!company1.website) {
              // let website = await utills.getHref(page, constants.WEBSITE);
              // await company.update(peoples[i].id, { website });
            }
            // let allEmp = await page.$(constants.ALL_EMPLOYEES);
            // await allEmp.click();
            // await getResultsFromGrid(page, company1.id);
            await page.goto(peoples[i].linkedin_profile_link);
            // let decMakers = await page.$(constants.DECISION_MAKERS);
            // await decMakers.click();
            // await getResultsFromGrid(page, company1.id);
          } else {
            console.log(linkedInUrl);
          }
        } catch (err) {
          console.log(err);
        }
      }
      pageNo++;
    } while (false); //end < total);
  })();
}
