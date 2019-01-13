"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rp = require('request-promise');
const fs = __importStar(require("fs"));
const cheerio = __importStar(require("cheerio"));
const download_1 = __importDefault(require("download"));
// const download = require('download');
const merge_img_1 = __importDefault(require("merge-img"));
const no = 352;
const titleId = 651673;
const url = 'https://comic.naver.com/webtoon/detail.nhn?titleId=' + titleId + '&no=';
const userAgent = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36' };
const option = { headers: userAgent };
function getURL(no) {
    return url + no;
}
async function downloadOnePage(no, name) {
    try {
        const dist = 'dist/' + no;
        const html = await rp(getURL(no));
        const $ = cheerio.load(html);
        let imgList = $('#comic_view_area > div.wt_viewer > img').toArray().map((i) => {
            return ($(i).attr('src'));
        });
        imgList = imgList.filter(value => !value.includes('guide'));
        await Promise.all(imgList.map(async (value, index) => {
            return download_1.default(value, dist, Object.assign({}, option, { filename: index + '.jpg' }));
        }));
        await mergeImage(imgList, no, name);
    }
    catch (err) {
        console.error(err);
    }
    return;
}
async function mergeImage(imgList, no, Id) {
    try {
        const dist = 'dist/' + no + '/';
        const outDir = Id + '/';
        if (!fs.readdirSync('./').includes(Id)) {
            fs.mkdirSync(Id);
        }
        let newArray = new Array(imgList.length).fill('', 0, imgList.length);
        newArray = newArray.map((value, index) => {
            return dist + index + '.jpg';
        });
        const img = await merge_img_1.default(newArray, { direction: true });
        img.write(outDir + no + '.png');
        console.log('done');
    }
    catch (err) {
        console.error(err);
    }
    return;
}
async function downloadMultiple(start, end, name) {
    for (let i = start; i <= end; ++i) {
        console.log(`page ${i}`);
        await downloadOnePage(i, name);
    }
}
downloadMultiple(11, 352, '유미');
