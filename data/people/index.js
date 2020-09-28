const { AppCrud } = require("../baseCrud");

class People extends AppCrud {
  constructor() {
    super("people");
  }
  async createPeople(people) {
    if (people.name) {
      people.name = people.name.replace(" ✔", "");
    }
    return this.create(people);
  }

  async createOrUpdate(people) {
    let dbPeople;
    if (people.linkedin_profile_link) {
      dbPeople = await this.getByField(
        "linkedin_profile_link",
        people.linkedin_profile_link
      );
    }
    if (!dbPeople.length) {
      return await this.createPeople(people);
    }
    return dbPeople[0];
  }
}

exports.People = People;
