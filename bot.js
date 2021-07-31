const { Wechaty } = require("wechaty"); // import { Wechaty } from 'wechaty'
const Qrterminal = require("qrcode-terminal");

Wechaty.instance() // Global Instance
  .on("scan", (qrcode, status) => {
    Qrterminal.generate(qrcode, { small: true });
    const qrImgUrl = [
      "https://api.qrserver.com/v1/create-qr-code/?data=",
      encodeURIComponent(qrcode),
    ].join("");
    console.log(qrImgUrl);
  })
  .on("login", (user) => console.log(`User ${user} logged in`))
  .on("message", (message) => console.log(`Message: ${message}`))
  .start();
