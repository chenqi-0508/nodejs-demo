const request = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');

//目标网址
const targetUrl = "https://www.csdn.net/";
//请求头
const headers = { 'User-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' }

//存放文本
let content = '';
//存放图片路径
let imgs = [];

//爬取数据
function start(targetUrl) {
    request.get(targetUrl)
        .set('User-agent', headers['User-agent'])
        .end((err, resp) => {
            if (err) {
                console.log("爬取异常：", err);
                return;
            }
            cheerioData(resp.text);
            // console.log(resp.text)
        })
}

//解析数据
function cheerioData(data) {
    const $ = cheerio.load(data);
    //抓取需要的数据,each为cheerio提供的方法用来遍历
    $('.company_list li').each((index, element) => {
        //分析所需要的数据的DOM结构
        //通过选择器定位到目标元素，再获取到数据
        let temp = {
            '标题': $(element).find('.content h3 a').text(),
            // '作者': $(element).find('.post_item_foot > a').text(),
            // '阅读数': $(element).find('.article_view a').text().slice(3, -2),
            // '推荐数': $(element).find('.diggnum').text()
        }
        //拼接数据
        content += JSON.stringify(temp) + '\n';
        //同样的方式获取图片地址
        if ($(element).find('.img_box a img').length > 0) {
            imgs.push($(element).find('.img_box a img').attr('src'));
        }
    })
    console.log(content)
    //创建目录并存储数据
    mkdir('./contents', saveContentData);
    //创建目录并下载图片
    mkdir('./imgs', downloadImg);
}

//创建目录
function mkdir(path, callback) {
    if (fs.existsSync(path)) {
        console.log(`${path}目录已存在!`);
        callback();
    } else {
        fs.mkdir(path, err => {
            if (err) {
                console.log(`创建目录${path}失败： ${err}`);
                return;
            }
            console.log(`创建目录${path}成功!`);
            callback();
        })
    }
}

//存储数据
function saveContentData() {
    if (content) {
        fs.writeFile('./contents/content.txt', content.toString(), err => {
            if (err) {
                console.log(`存储content数据时异常：${err}`);
                return;
            }
            console.log(`content存储完毕!`)
        });
    } else {
        console.log('未搜索到数据!')
    }

}

//下载图片
function downloadImg() {
    if (imgs.length > 0) {
        imgs.map((img, index) => {
            //弹出数组最后一项作为图片名称
            const imgName = img.split('/').pop();
            let stream = fs.createWriteStream(`./imgs/img${index}.jpg`);
            request.get(img).pipe(stream);
            console.log(`开始下载图片：${img} --> ./imgs/img${index}.jpg`)
        })
        console.log('图片下载完成！')
    } else {
        console.log('未搜索到图片!')
    }

}

//启动
start(targetUrl);

