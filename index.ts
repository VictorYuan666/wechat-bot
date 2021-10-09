import { Wechaty, Message } from "wechaty"; // import { Wechaty } from 'wechaty'
import QRTerminal from "qrcode-terminal";
import axios from "axios";
import config from "./config";

Wechaty.instance() // Global Instance
  .on("scan", (qrcode: string, status: number) => {
    QRTerminal.generate(qrcode, { small: true });

    const qrImgUrl =
      "https://api.qrserver.com/v1/create-qr-code/?data=" +
      encodeURIComponent(qrcode);
    console.log(qrImgUrl);
  })
  .on("login", (user) => console.log(`User ${user} logged in`))
  .on("message", (msg: Message) => {
    console.log(`Message: ${msg}`);
    if (msg.text() == "#test") {
      msg.say("hello");
    }
  });
// .start();
async function main() {
  const weatherUrl = `https://devapi.qweather.com/v7/weather/3d?key=${config.weatherKey}&location=${config.location}`;
  const lifeUrl = `https://devapi.qweather.com/v7/indices/1d?key=${config.weatherKey}&location=${config.location}&type=${config.type}`;

  const url = `http://api.tianapi.com/txapi/one/index?key=${config.tianXingKey}`;
  const { data } = await axios.get(url);
  console.log(JSON.stringify(data));
}
main();
