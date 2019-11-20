"use strict";

const { test, trait } = use("Test/Suite")("Session");

const Mail = use("Mail");
const Hash = use("Hash");
const Database = use("Database");
const { format, subHours } = require("date-fns");

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");

trait("DatabaseTransactions");
trait("Test/ApiClient");

test("it should send an email with reset password", async ({
  assert,
  client
}) => {
  Mail.fake();
  const email = "njoao97710@gmail.com";
  const user = await Factory.model("App/Models/User").create({ email });

  await client
    .post("/forgot")
    .send({ email })
    .end();

  const token = await user.tokens().first();
  const recentEmail = Mail.pullRecent();

  assert.equal(recentEmail.message.to[0].address, email);

  assert.include(token.toJSON(), {
    type: "forgotpassword"
  });

  Mail.restore();
});

test("it should be able to reset password", async ({ assert, client }) => {
  const email = "njoao97710@gmail.com";

  const user = await Factory.model("App/Models/User").create({ email });
  const userToken = await Factory.model("App/Models/Token").make();

  await user.tokens().save(userToken);

  await client
    .post("/reset")
    .send({
      token: userToken.token,
      password: "joaoneto456",
      password_confirmation: "joaoneto456"
    })
    .end();

  await user.reload();

  const checkPassword = await Hash.verify("joaoneto456", user.password);

  assert.isTrue(checkPassword);
});

test("it cannot reset password after 2h", async ({ client }) => {
  const email = "njoao97710@gmail.com";

  const user = await Factory.model("App/Models/User").create({ email });
  const userToken = await Factory.model("App/Models/Token").make();

  await user.tokens().save(userToken);

  const dateWithSub = format(subHours(new Date(), 2), "yyy-MM-dd HH:ii:ss");

  await Database.table("tokens")
    .where("token", userToken.token)
    .update("created_at", dateWithSub);

  await userToken.reload();

  const response = await client
    .post("/reset")
    .send({
      token: userToken.token,
      password: "joaoneto456",
      password_confirmation: "joaoneto456"
    })
    .end();

  response.assertStatus(400);
});
