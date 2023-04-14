import * as cheerio from 'cheerio';
import axios from 'axios';
import chalk from 'chalk';
import puppeteer from 'puppeteer';

const log = console.log;

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

const scrapeData = async () => {
  try {
    const res = await axios.get(
      'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-+2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at+%3Adesc'
    );

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

    const struckItem = await scrapeTruckItem($);

    console.log('========struckItem============================');
    console.log(struckItem);
    console.log('===========struckItem=========================');
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
    return `this is the last page`;
  } else {
    console.log('No pagination links found');
    return `No pagination link found`;
  }
};

const scrapeTruckItem = async ($) => {
  // const itemsArr = [];

  // // Anyone of these three lines will returns the same result
  // // const $items = $('.ooa-1hab6wx').children('article');
  // const $items = $('main[data-testid="search-results"]').children('article');
  // //   const $items = $('ooa-1bmnxg7');

  // $items.each(function (i, element) {
  //   const id = $(element).attr('data-id');
  //   const url = $(element).find('a').attr('href');
  //   const price = $(element).find('.ooa-1bmnxg7').text();
  //   const adTitle = $(element).find('h2[data-testid="ad-title"]').text();

  //   const item = {
  //     itemId: id,
  //     itemURL: url,
  //     itemPrice: price,
  //     itemTitle: adTitle,
  //   };
  //   itemsArr.push(item);
  // });

  // return itemsArr;

  const itemsArr = [];

  const $items = $('main[data-testid="search-results"]').children('article');

  const browser = await puppeteer.launch();
  try {
    // $items.each(async function (i, element) {
    //   // const id = $(element).attr('data-id');
    //   const url = $(element).find('a').attr('href');
    //   // const price = $(element).find('.ooa-1bmnxg7').text();
    //   // const adTitle = $(element).find('h2[data-testid="ad-title"]').text();

    //   if (url) {
    //     console.log('=========url===========================');
    //     console.log(url);
    //     console.log('==========url==========================');
    //     const page = await browser.newPage();
    //     await page.goto(url);
    //     const html = await page.content();

    //     console.log('=======html=============================');
    //     console.log(html);
    //     console.log('========html============================');
    //   }
    // });

    const page = await browser.newPage();
    await page.goto(
      'https://www.otomoto.pl/oferta/mercedes-benz-actros-1845-euro-6-acc-stream-space-retarder-ID6Fratg.html'
    );
    const html = await page.content();

    const $htmlData = cheerio.load(html);

    const details = $htmlData('ul.offer-params__list li');

    const data = {};

    const id = $htmlData('#ad_id').first().text().trim();

    const price = $htmlData('.offer-price__number').first().text().trim();
    const title = $htmlData('.offer-title').first().text().trim();

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

    for (let key in data) {
      console.log('=============data=======================');
      console.log(key, ' : ', data[key]);
      console.log('===============data=====================');
    }
  } catch (error) {
    console.log('==========errrr==========================');
    console.log(error);
    console.log('============errrr========================');
  }
  await browser.close();

  return itemsArr;
};

scrapeData();
