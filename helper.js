import * as cheerio from 'cheerio';
import axios from 'axios';

export const getAllPagesAds = async (initURL, browser) => {
  let allAdsData = [];
  const page = await browser.newPage();

  await page.goto(initURL);
  await page.waitForSelector('.pagination-list', { timeout: 0 });

  const allPageList = [];
  allPageList.push(initURL);

  let currentPageUrl = initURL;
  while (true) {
    const nextPageUrl = await getNextPageUrlByEvaluate(page);
    if (!nextPageUrl) {
      break;
    }

    currentPageUrl = nextPageUrl;
    console.log('current page:: ', currentPageUrl);
    allPageList.push(currentPageUrl);
    await page.goto(currentPageUrl);
    await page.waitForSelector('.pagination-list', { timeout: 0 });
  }

  console.log('allPageList:: ', allPageList);

  const uniquePages = [...new Set(allPageList)]; // remove duplicates if there's any

  for (const page of uniquePages) {
    const res = await axios.get(page);
    const $ = cheerio.load(res.data);

    const truckItem = await scrapeTruckItem($, browser);

    allAdsData = [...allAdsData, ...truckItem];
  }

  return allAdsData;
};
export const getNextPageUrlByEvaluate = async (page) => {
  const nextButton = await page.$('li[data-testid="pagination-step-forwards"]');

  if (!nextButton) {
    return null;
  }

  const ariaDisabledValue = await nextButton.evaluate((element) =>
    element.getAttribute('aria-disabled')
  );

  if (ariaDisabledValue === 'true') {
    return null;
  }

  const nextUrl = await page.evaluate(async (nextButton) => {
    nextButton.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return window.location.href;
  }, nextButton);

  return nextUrl;
};

export const addItems = ($) => {
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
export const getTotalAdsCount = ($) => {
  return $('main[data-testid="search-results"]').children('article').length;
};

export const getNextPageUrl = ($) => {
  const nextPageUrl = $('.pagination-item__active')
    .nextAll('li:has(a)')
    .first()
    .find('a')
    .attr('href');

  if (nextPageUrl) {
    return nextPageUrl;
  } else if ($('.pagination-item__disabled[title="Next Page"]').length) {
    console.log('This is the last page');
    return undefined;
  } else {
    console.log('No pagination links found');
    return undefined;
  }
};

export const scrapeTruckItem = async ($, browser) => {
  const itemsArr = [];

  const $items = $('main[data-testid="search-results"]').children('article');

  try {
    const adsURL = [];
    $items.each(async function (i, element) {
      const url = $(element).find('a').attr('href').trim();

      adsURL.push(url);
    });

    for (let i = 0; i < adsURL.length; i++) {
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
      await page.close();
    }
  } catch (error) {
    console.log('error: ', error);
  }

  return itemsArr;
};
