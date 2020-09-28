const { AppCrud } = require("../baseCrud");

class Company extends AppCrud {
  constructor() {
    super("company");
  }
  async byLinkedInId(id) {
    return this.getByField("linkedin_profile_id", id);
  }
  async byName(name) {
    return this.getByField("name", name);
  }
  async createOrUpdateByLinkedInID(company) {
    const linkedInId = company.linkedin_profile_id;
    let dbCompany = [];
    console.log(linkedInId);
    if (linkedInId) {
      dbCompany = await this.byLinkedInId(company.linkedin_profile_id);
    } else {
      dbCompany = await this.byName(company.name);
    }
    if (!dbCompany.length) {
      company = await this.create(company);
      return company;
    }
    console.log(dbCompany[0]);
    return dbCompany[0];
  }
}

exports.Company = Company;
