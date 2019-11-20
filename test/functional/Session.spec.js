"use strict";

const { test, trait } = use("Test/Suite")("Session");

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use("App/Models/User");

//trait - traz novas funcionalidades
trait("DatabaseTransactions");
trait("Test/ApiClient");

test("it should return JWT token when session created", async ({
  assert,
  client
}) => {
  const sesssionPayload = {
    email: "njoao97710@gmail.com",
    password: "joaoneto456"
  };

  await Factory.model("App/Models/User").create(sesssionPayload);

  const response = await client
    .post("/session")
    .send(sesssionPayload)
    .end();

  response.assertStatus(200);
  assert.exists(response.body.token);
});
