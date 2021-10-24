import { Wechaty, Message, Contact } from "wechaty";
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
  .on("logout", (user) => console.log(`User ${user} logout`))
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
        handleWeather(msg, "today");
        break;
      case "fund":
        handleFund(msg);
        break;
      case "test":
        await msg.say("Hello world!");
        // const contact:any = await bot.Contact.find({name: '八月'})
        // contact.say('hello')

        // const room: any = await bot.Room.find({ topic: "801" });
        // await room.say("Hello world!");
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
async function handleWeather(msg?: Message, type?: "today" | "tomorrow") {
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
  const isToady = type === "today";
  const url = `http://api.tianapi.com/txapi/tianqi/index?key=${config.tianXingKey}&city=%E8%A5%BF%E6%B9%96%E5%8C%BA`;
  const res: any = await axios.get(url);
  const { area, weather, highest, lowest, windsc, tips } =
    res.data.newslist[isToady ? 0 : 1];
  console.log(res);
  const text = `${
    isToady ? "今日" : "明日"
  }${area}区天气${weather}\n最高气温:${highest}\n最低气温:${lowest}\n风力:${windsc}\n${tips}`;

  sendMsg(text, msg);
}

async function handleFund(msg?: Message) {
  const fundCodeList = [
    "005609", // 富国军工主题混合A
    "002190", // 农银新能源主题
    "004746", // 易方达上证50
    "001631", // 天弘中证食品饮料A
    "161725", // 招商中证白酒A
    "320007", // 诺安成长混合
    "003095", // 中欧医疗混合
    "008099", // 广发价值领先混合A
    "005827", // 易方达蓝筹混合
    "166002", // 中欧新蓝筹A
    "163406", // 兴全合润混合
    "000083", // 汇添富消费行业混合
    "001874", // 前海开源沪港深价值精选
    "001182", // 易方达安心回馈混合
    "004241", // 中欧时代先锋C
  ];

  const res: any = await axios.get(
    ` https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=100&appType=ttjj&product=EFund&plat=Android&deviceid=9e16077fca2fcr78ep0ltn98&Version=1&Fcodes=${fundCodeList.join(
      ","
    )}`
  );

  const fundText = res.data.Datas.map((item: any) => {
    return `${item.SHORTNAME} ${item.GSZZL.includes("-") ? "💚" : "❤️"} ${
      item.GSZZL
    }`;
  }).join("\n");

  sendMsg(fundText, msg);
}

async function sendMsg(text: string, msg?: Message) {
  if (msg) {
    msg.say(text);
  } else {
    const room: any = await bot.Room.find({ topic: "801" });
    await room.say(text);
  }
}

async function main() {
  schedule.scheduleJob("0 30 23 * * ?", async () => {
    console.log("天气" + new Date());

    await handleWeather(undefined, "today");
  });

  schedule.scheduleJob("0 30 10 * * ?", async () => {
    console.log("天气" + new Date());

    await handleWeather(undefined, "tomorrow");
  });

  schedule.scheduleJob("0 30 6 * * ?", () => {
    console.log("基金" + new Date());
    handleFund();
  });
}

main();
