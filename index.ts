import { Wechaty, Message, Contact } from "wechaty"; // import { Wechaty } from 'wechaty'
import QRTerminal from "qrcode-terminal";
import axios from "axios";
import schedule from "node-schedule";
import config from "./config";

const bot = new Wechaty();

bot
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
        handleOneAPI(msg);
        break;
      case "poem":
        handlePoem(msg);
        break;
      case "en":
        handleEn(msg);
        break;
      case "weather":
        handleWeather(msg);
        break;
      case "test":
        // const contact:any = await bot.Contact.find({name: '八月'})
        // contact.say('hello')
        const room: any = await bot.Room.find({ topic: "801" });
        await room.say("Hello world!");
        break;
      default:
        break;
    }
  })
  .start();

async function handleOneAPI(msg: Message) {
  const url = `http://api.tianapi.com/txapi/one/index?key=${config.tianXingKey}`;
  const res: any = await axios.get(url);

  msg.say(res.data.newslist[0].word);
}

async function handlePoem(msg: Message) {
  const url = `http://api.tianapi.com/txapi/verse/index?key=${config.tianXingKey}`;
  const res: any = await axios.get(url);
  const { content, source } = res.data.newslist[0];

  msg.say(`${content}——${source}`);
}

async function handleEn(msg: Message) {
  const url = `http://api.tianapi.com/txapi/ensentence/index?key=${config.tianXingKey}`;
  const res: any = await axios.get(url);
  const { en, zh } = res.data.newslist[0];

  msg.say(`${en}\n${zh}`);
}
async function handleWeather(msg?: Message) {
  // {
  //   "area": "西湖",
  //   "date": "2021-10-10",
  //   "week": "星期日",
  //   "weather": "小雨",
  //   "weatherimg": "xiaoyu.png",
  //   "real": "31℃",
  //   "lowest": "21℃",
  //   "highest": "31℃",
  //   "wind": "北风",
  //   "winddeg": "0",
  //   "windspeed": "31",
  //   "windsc": "4-5级",
  //   "sunrise": "05:58",
  //   "sunset": "17:35",
  //   "moonrise": "09:56",
  //   "moondown": "20:28",
  //   "pcpn": "3.8",
  //   "pop": "72",
  //   "uv_index": "4",
  //   "vis": "19",
  //   "humidity": "94",
  //   "tips": "天气炎热，适宜着短衫、短裙、短裤、薄型T恤衫、敞领短袖棉衫等夏季服装。雨天外出请注意携带雨具，并注意安全。"
  // },
  const url = `http://api.tianapi.com/txapi/tianqi/index?key=${config.tianXingKey}&city=%E8%A5%BF%E6%B9%96%E5%8C%BA`;
  const res: any = await axios.get(url);
  const { area, weather, highest, lowest, windsc, tips } = res.data.newslist[0];
  console.log(res);
  const text = `今日${area}区天气${weather} 最高气温:${highest} 最低气温:${lowest} 风力:${windsc}\n${tips}`;
  if (msg) {
    msg.say(text);
  }

  return text;
}

async function main() {
  // const weatherUrl = `https://devapi.qweather.com/v7/weather/3d?key=${config.weatherKey}&location=${config.location}`;
  // const lifeUrl = `https://devapi.qweather.com/v7/indices/1d?key=${config.weatherKey}&location=${config.location}&type=${config.type}`;

  // // const url = `http://api.tianapi.com/txapi/one/index?key=${config.tianXingKey}`;
  // const url = `http://api.tianapi.com/txapi/verse/index?key=${config.tianXingKey}`;
  // const { data } = await axios.get(url);
  // console.log(JSON.stringify(data));

  // 定义规则
  let rule = new schedule.RecurrenceRule();
  // rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次
  rule.hour = 23;
  rule.minute = 30;
  rule.second = 0;

  // 启动任务
  let job = schedule.scheduleJob(rule, async () => {
    console.log(`${"-------"}\n${new Date()}`);
    const room: any = await bot.Room.find({ topic: "801" });
    const weatherText = await handleWeather();
    await room.say(weatherText);
  });
}

main();
