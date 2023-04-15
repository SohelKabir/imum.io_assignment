import * as cheerio from 'cheerio';
import axios from 'axios';
import chalk from 'chalk';
import puppeteer from 'puppeteer';
import {
  addItems,
  getAllPagesAds,
  getNextPageUrl,
  getTotalAdsCount,
  scrapeTruckItem,
} from './helper.js';

const log = console.log;

const scrapeData = async () => {
  const initURL =
    'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-+2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at+%3Adesc';
  try {
    const res = await axios.get(initURL);

    const $ = cheerio.load(res.data);

    log(chalk.bgCyan('-----getNextPageUrl------'));

    const nextPageUrl = getNextPageUrl($);

    console.log('nextPageUrl:: ', nextPageUrl);

    log(chalk.bgCyan('-----addItems------'));

    const addItemsList = addItems($);

    console.log('itemlist:: ', addItemsList);

    log(chalk.bgCyan('-----getTotalAdsCount------'));

    const totalAdsCount = getTotalAdsCount($);
    console.log('totalAdsCount:: ', totalAdsCount);

    const browser = await puppeteer.launch();

    log(chalk.bgCyan('-----scrapeTruckItem------'));

    const truckItem = await scrapeTruckItem($, browser);
    console.log('truckItem:: ', truckItem);

    log(chalk.bgCyan('-----getAllPagesAds------'));

    const allAds = await getAllPagesAds(initURL, browser);
    console.log('allAds:: ', allAds);

    await browser.close();
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
