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
  .on("message", async (msg: Message) => {
    console.log(`Message: ${msg}`);
    switch (msg.text()) {
      case "one":
        handleOneAPI(msg)
        break;
      case "poem":
        const url = `http://api.tianapi.com/txapi/verse/index?key=${config.tianXingKey}`
        handlePoem(msg)


      default:
        break;
    }

  }).start();

async function handleOneAPI(msg: Message) {
  const url = `http://api.tianapi.com/txapi/one/index?key=${config.tianXingKey}`;
  const res: any = await axios.get(url);

  msg.say(res.data.newslist[0].word);

}

async function handlePoem(msg: Message) {
  const url = `http://api.tianapi.com/txapi/verse/index?key=${config.tianXingKey}`;
  const res: any = await axios.get(url);
  const {content,source} = res.data.newslist[0]

  msg.say(`${content}——${source}`);
}



async function main() {
  const weatherUrl = `https://devapi.qweather.com/v7/weather/3d?key=${config.weatherKey}&location=${config.location}`;
  const lifeUrl = `https://devapi.qweather.com/v7/indices/1d?key=${config.weatherKey}&location=${config.location}&type=${config.type}`;

  // const url = `http://api.tianapi.com/txapi/one/index?key=${config.tianXingKey}`;
  const url = `http://api.tianapi.com/txapi/verse/index?key=${config.tianXingKey}`;
  const { data } = await axios.get(url);
  console.log(JSON.stringify(data));
}
main();
