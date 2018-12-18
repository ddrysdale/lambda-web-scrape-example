require('dotenv').config();

var scrapeFacade = require('./scrapeFacade');
const url = 'https://www.amazon.jobs/en/search?offset=0&result_limit=10&sort=recent&category=software-development&distanceType=Mi&radius=24km&latitude=49.26039&longitude=-123.11336&loc_group_id=&loc_query=Vancouver%2C%20BC%2C%20Canada&base_query=&city=Vancouver&country=CAN&region=British%20Columbia&county=Greater%20Vancouver&query_options=&';

exports.handler = function (event, context, callback) {
  scrape(callback);
};

async function scrape(callback) {
  var initalWait = process.env.INITIALWAIT;
  console.log('Loading initial page...');

  var htmlResult = null;
  try {
    htmlResult = await scrapeFacade.getHtml(url, initalWait);
  } catch (e) {
    callback(new Error('getHtml error: ' + e));
    console.error('getHtml error: ' + e);
  }

  var urlResults = [];
  try {
    urlResults = await scrapeFacade.findLinks(htmlResult.html, '.job-link', '.posting-date', 'https://www.amazon.jobs');
  } catch (e) {
    callback(new Error('findLinks error: ' + e));
    console.error('findLinks error: ' + e);
  }

  var results = [];
  urlResults.forEach(async function (urlResult) {
    let result = null;
    try {
      result = await scrapeFacade.scrapeUrl(urlResult.url, ".title", '#main-content .content', urlResult.postedDate);
      results.push(result);

      if (results.length === urlResults.length) {
        callback(null, { results });
      }
    }
    catch (e) {
      callback(new Error('scrapeUrl error: ' + e));
      console.error('scrapeUrl  error: ' + e);
    }
  });
};
