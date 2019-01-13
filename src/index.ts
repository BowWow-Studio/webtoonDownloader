var rp = require('request-promise');
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import download from 'download';
// const download = require('download');
import mergeImg from 'merge-img';

const no = 352;
const titleId = 651673;
const url = 'https://comic.naver.com/webtoon/detail.nhn?titleId='+titleId+'&no=';
const userAgent = {'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'}
const option = {headers:userAgent};

function getURL(no:number){
    return url + no;
}
async function downloadOnePage(no:number,name:string) { 
    try{
        const dist = 'dist/' + no;
        const html = await rp(getURL(no));
        const $ = cheerio.load(html);
        let imgList:Array<string> = $('#comic_view_area > div.wt_viewer > img').toArray().map((i)=>{
            return ($(i).attr('src'));
        })
        imgList = imgList.filter(value=>!value.includes('guide'));
        await Promise.all(imgList.map(async (value,index)=>{            
            return download(value, dist,{...option,filename:index+'.jpg'});
        }))
        await mergeImage(imgList,no,name);
    }
    catch(err){
            console.error(err);
    }
    return;   
}
async function mergeImage(imgList:Array<string>,no:number,Id:string){
    try{
        const dist = 'dist/'+no+'/';
        const outDir = Id+'/';
        if(!fs.readdirSync('./').includes(Id)){
            fs.mkdirSync(Id);
        }
        let newArray:Array<string> = new Array(imgList.length).fill('',0,imgList.length);
        newArray = newArray.map((value,index)=>{
            return dist + index + '.jpg';
        });
        const img = await mergeImg(newArray,{direction:true});
        img.write(outDir+no+'.png');
        console.log('done');
    }
    catch(err){
        console.error(err);
    }
    return
}

async function downloadMultiple(start:number,end:number,name:string){
    for(let i = start; i <= end; ++i){
        console.log(`page ${i}`)
        await downloadOnePage(i,name);
    }
}
downloadMultiple(11,352,'유미');