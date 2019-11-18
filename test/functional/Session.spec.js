"use strict";

const { test, trait } = use("Test/Suite")("Session");
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use("App/Models/User");

trait("DatabaseTransactions");
trait("Test/ApiClient");

test("it should ", async ({ assert, client }) => {
  const user = await User.create({
    name: "João Alves",
    email: "njoao97710@gmail.com",
    password: "joaoneto456",
    profession: "Programmer"
  });

  const response = await client
    .post("/session")
    .send(user.email, user.password)
    .end();

  response.assertStatus(200);
});
