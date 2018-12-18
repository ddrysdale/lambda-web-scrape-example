require('dotenv').config();

var phantomjs = require('./phantomjs');
const cheerio = require('cheerio');
const striptags = require('striptags');

async function getHtml(url, wait) {
    return new Promise(function (resolve, reject) {
        phantomjs.scrape(url, wait, function (err, html) {
            if (err) {
                reject(err);
            } else {
                resolve({ html, url });
            }
        });
    });
}

async function findLinks(html, linkSelector, postedDateSelector, baseUrl) {
    return new Promise(function (resolve, reject) {
        if (!html || !html.length) {
            reject('html was null or empty');
        }

        var $ = cheerio.load(html);

        var urls = [];
        $(linkSelector).filter(function () {
            var url = `${baseUrl}${$(this).attr("href")}`;

            urls.push({
                postedDate: $(this).find(postedDateSelector).text().replace('Posted ', ''),
                url
            });
        });

        if (urls.length === 0) {
            console.error(`no links found using linkSelector: ${linkSelector}. html length: ${(html ? html.length : 0)}`);
            reject(`no links found using linkSelector: ${linkSelector}`);
        } else {
            console.log(`found ${urls.length} links`);
            resolve(urls);
        }
    });
}

async function scrapeUrl(url, titleSelector, contentSelector, postedDate) {
    var pageWait = process.env.PAGEWAIT;

    return new Promise(async function (resolve, reject) {
        var htmlResult = null;
        try {
            htmlResult = await getHtml(url, pageWait);
            var html = htmlResult.html;

            if (!html || !html.length) {
                reject('scrape url failed to load html data for: ' + url);
            }

            var $ = cheerio.load(html);

            var title = null;
            $(titleSelector).filter(function () {
                title = striptags($(this).html());
                title = title
                    .replace(/&amp;/g, '&')
                    .replace(/&#xA0;/g, ' ')
                    .replace(/\n/g, '');
            });

            var content = null;
            $(contentSelector).filter(function () {
                content = $(this).html();
            });

            if (!postedDate) {
                $(postedDateSelector).filter(function () {
                    postedDate = striptags($(this).html());
                });
            }

            if (postedDate) {
                try {
                    var dateObj = new Date(postedDate);
                    postedDate = dateObj.toISOString();
                } catch (e) {
                    console.error('Bad posted date:' + postedDate + ' for url: ' + url);
                }
            }

            resolve({ title, content, url, postedDate });
        } catch (e) {
            reject(e);
            return
        }
    });
};

module.exports = { getHtml, findLinks, scrapeUrl };
