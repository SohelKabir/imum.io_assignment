import * as cheerio from 'cheerio';
import axios from 'axios';
import chalk from 'chalk';

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
const scrapeTruckItem = ($) => {
  const itemsArr = [];

  // Anyone of these three lines will returns the same result
  // const $items = $('.ooa-1hab6wx').children('article');
  const $items = $('main[data-testid="search-results"]').children('article');
  //   const $items = $('ooa-1bmnxg7');

  $items.each(function (i, element) {
    // const id = $(element).attr('data-id');
    // const url = $(element).find('a').attr('href');
    // const price = $(element).find('.ooa-1bmnxg7').text();

    // const item = {
    //   itemId: id,
    //   itemURL: url,
    //   itemPrice: price,
    // };
    // itemsArr.push(item);

    const adTitle = $(element).find('h2[data-testid="ad-title"]').text();

    console.log(adTitle);
  });

  return itemsArr;
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

    const struckItem = scrapeTruckItem($);

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

scrapeData();
