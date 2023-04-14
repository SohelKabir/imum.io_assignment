import * as cheerio from 'cheerio';
import axios from 'axios';
import chalk from 'chalk';
import puppeteer from 'puppeteer';

const log = console.log;

const scrapeData = async () => {
  const initURL =
    'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-+2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at+%3Adesc';
  try {
    const res = await axios.get(initURL);

    const $ = cheerio.load(res.data);

    //Question: 1

    // const nextPageUrl = getNextPageUrl($);
    // console.log(nextPageUrl);

    //Question: 2

    // const addItemsList = addItems($);
    // console.log('itemlist:: ', addItemsList);

    //Question: 3

    // const totalAdsCount = getTotalAdsCount($);
    // console.log('totalAdsCount:: ', totalAdsCount);

    // Question 4

    // const truckItem = await scrapeTruckItem($);
    // console.log("truckItem:: ", truckItem);

    // Question 5

    let allAdsData = [];
    const allAds = await getALlPagesAds(initURL, allAdsData);

    console.log('===========allAds=========================');
    console.log(allAds);
    console.log('============allAds========================');
  } catch (error) {
    log(
      chalk.redBright('Something went wrong! Check below logs for more info!')
    );
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('error-response');
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      console.log('error-response');
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js

      console.log('error.request:: ', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error:: ', error.message);
    }

    console.log('error.config:: ', error.config);
  }
};
scrapeData();

const getALlPagesAds = async (initURL, allAdsData) => {
  const res = await axios.get(initURL);

  const $ = cheerio.load(res.data);

  let truckItem = await scrapeTruckItem($);
  allAdsData.push(truckItem);

  if (getNextPageUrl($)) {
    const newURL = `https://www.otomoto.pl/${getNextPageUrl($)}`;
    await getALlPagesAds(newURL, allAdsData);
  }

  return allAdsData;
};

const addItems = ($) => {
  const itemsArr = [];

  // Anyone of these three lines will returns the same result
  // const $items = $('.ooa-1hab6wx').children('article');
  // const $$items = $('main[data-testid="search-results"]').children('article');
  const $items = $('.ooa-1hab6wx > article');

  $items.each(function (i, element) {
    const id = $(element).attr('data-id');
    const url = $(element).find('a').attr('href');

    const item = {
      itemId: id,
      itemURL: url,
    };
    itemsArr.push(item);
  });

  return itemsArr;
};
const getTotalAdsCount = ($) => {
  return $('main[data-testid="search-results"]').children('article').length;
};

const getNextPageUrl = ($) => {
  const nextPageUrl = $('.pagination-item__active')
    .nextAll('li:has(a)')
    .first()
    .find('a')
    .attr('href');

  if (nextPageUrl) {
    console.log(`Found next page link: ${nextPageUrl}`);
    return nextPageUrl;
  } else if ($('.pagination-item__disabled[title="Next Page"]').length) {
    console.log('This is the last page');
    return undefined;
  } else {
    console.log('No pagination links found');
    return undefined;
  }
};

const scrapeTruckItem = async ($) => {
  const itemsArr = [];

  const $items = $('main[data-testid="search-results"]').children('article');

  const browser = await puppeteer.launch();
  try {
    const adsURL = [];
    $items.each(async function (i, element) {
      // const id = $(element).attr('data-id');
      const url = $(element).find('a').attr('href').trim();
      // const price = $(element).find('.ooa-1bmnxg7').text();
      // const adTitle = $(element).find('h2[data-testid="ad-title"]').text();

      adsURL.push(url);
    });

    //TODO make it i <length before final submission, for testing i reduced loading data

    for (let i = 0; i < 3; i++) {
      const page = await browser.newPage();
      await page.goto(adsURL[i]);
      const html = await page.content();

      const $htmlData = cheerio.load(html);

      const id = $htmlData('#ad_id').first().text().trim();
      const price = $htmlData('.offer-price__number').first().text().trim();
      const title = $htmlData('.offer-title').first().text().trim();
      const details = $htmlData('ul.offer-params__list li');

      const data = {};

      data.id = id;
      data.price = price;
      data.title = title;

      details.each(function () {
        const label = $(this).find('span.offer-params__label').text().trim();
        let value = $(this).find('div.offer-params__value').text().trim();
        if (value === '') {
          value = $(this).find('div.offer-params__value a').text().trim();
        }
        // data[label] = value

        if (label === 'Rok produkcji') {
          data['Years of producton'] = value;
        }
        if (label === 'Przebieg') {
          data['mileage'] = value;
        }
        if (label === 'Moc') {
          data['power'] = value;
        }
      });

      itemsArr.push(data);
    }
  } catch (error) {
    console.log('error: ', error);
  }
  await browser.close();

  return itemsArr;
};
