const { mysql } = require("./index");

class AppCrud {
  constructor(name) {
    this.name = name;
  }

  async create(entity) {
    const conn = mysql.connection();
    entity = await conn.query(`INSERT INTO ${this.name} set ?`, entity);
    conn.close();
    console.log("insertId====" + this.name + "===========", entity.insertId);
    return entity;
  }

  async getAll() {
    const conn = mysql.connection();
    let entities = await conn.query(`select * from ${this.name}`);
    conn.close();
    return entities;
  }

  async getById(id) {
    const conn = mysql.connection();
    let entities = await conn.query(`select * from ${this.name} where id = ?`, [
      id,
    ]);
    conn.close();
    return entities;
  }

  async getByField(fieldName, value) {
    const conn = mysql.connection();
    let entity = await conn.query(
      `select * from ${this.name} where ${fieldName} = ?`,
      [value]
    );
    conn.close();
    return entity;
  }

  async count() {
    const conn = mysql.connection();
    let entity = await conn.query(`select count(id) from ${this.name}`);
    conn.close();
    console.log(entity[0]["count(id)"]);
    return entity[0]["count(id)"];
  }
  async getAllWithPagination(req) {
    let { page, limit } = req;
    let offset = (page > 0 ? page - 1 : 0) * limit;
    const conn = mysql.connection();
    console.log(`select * from ${this.name} limit ${limit} offset ${offset}`);
    let entities = await conn.query(
      `select * from ${this.name} limit ${limit} offset ${offset}`
    );
    conn.close();
    return {
      data: entities,
      page,
      limit,
      total: await this.count(),
      end: page * limit,
    };
  }

  async update(id, params) {
    // let entity = await this.getById(id);
    // entity = { ...entity[0], ...params };
    // console.log("updated=======", entity);
    const conn = mysql.connection();
    let response = await conn.query(
      `update ${this.name} set website = ? where id = ?`,
      [params.website, id]
    );
    conn.close();
    console.log(response);
    return response;
  }
}

exports.AppCrud = AppCrud;
