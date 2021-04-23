const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});

afterAll(async () => {
  await db.destroy();
})

describe("Auth Router", () => {

  describe("register a user", () => {
    let res;
    const user = {username: "nico", password: "1234"}

    test('it registers a user', async () => {
      res = await request(server).post('/api/auth/register').send(user);
      expect(res.body.username).toEqual('nico');
    })

    test('returns 201', async () => {
      res = await request(server).post('/api/auth/register').send(user);
      expect(res.status).toBe(201);
    })
  })

  describe("logging in a user", () => {
    let res;
    const credentials = {username: "nico", password: "1234"}

    test("logs a user in", async () => {
      await request(server).post('/api/auth/register').send(credentials);
      res = await request(server).post('/api/auth/login').send(credentials);
      expect(res.body.message).toEqual('welcome, nico')
    })

    test("returns 200", async () => {
      await request(server).post('/api/auth/register').send(credentials);
      res = await request(server).post('/api/auth/login').send(credentials);
      expect(res.status).toBe(200)
    })
  })
}) 

describe("Jokes router", () => {

  // beforeAll(async () => {
  //   await request(server).post('/api/auth/register').send({username: 'nico', password: '1234'});
  //   let response = await request(server).post('/api/auth/login').send({username: 'nico', password: '1234'});
  //   let token = response.body.token
  //   console.log(token)
  // })

  describe("GET jokes", () => {
  
    test("retrieves dads jokes", async () => {
      await request(server).post('/api/auth/register').send({username: 'nico', password: '1234'});
      let response = await request(server).post('/api/auth/login').send({username: 'nico', password: '1234'});
      let token = response.body.token
      const headers = {authorization: `bearer ${token}`}

      let res = await request(server).get('/api/jokes').set(headers);
      expect(res.body.length).toEqual(3);
    })

    test("returns 200", async () => {
      await request(server).post('/api/auth/register').send({username: 'nico', password: '1234'});
      let response = await request(server).post('/api/auth/login').send({username: 'nico', password: '1234'});
      let token = response.body.token
      const headers = {authorization: `bearer ${token}`}

      let res = await request(server).get('/api/jokes').set(headers);
      expect(res.status).toBe(200);
    })

    // test("returns ")
  })
})
