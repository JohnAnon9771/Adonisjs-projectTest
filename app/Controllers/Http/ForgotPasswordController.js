"use strict";

const { randomBytes } = require("crypto");
const { promisify } = require("util");

const Mail = use("Mail");
const Env = use("Env");

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use("App/Models/User");

class ForgotPasswordController {
  async store({ request }) {
    //obtem o email
    const email = request.input("email");
    //procura em usuarios pelo email
    const user = await User.findByOrFail("email", email);
    //promisify - retorna uma promise
    const random = await promisify(randomBytes)(24);
    //converte o random em hexadecimal
    const token = random.toString("hex");

    await user.tokens().create({
      token,
      type: "forgotpassword"
    });

    const resetPassword = `${Env.get("FRONT_URL")}/reset?token=${token}`;

    await Mail.send(
      "mails.mail",
      { name: user.name, resetPassword },
      message => {
        message
          .to(user.email)
          .from("oi@servisso.gmail.com")
          .subject("Welcome to yardstick");
      }
    );
  }
}

module.exports = ForgotPasswordController;
