const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://github.com';

const STORE = {};

//? USER INPUTS
const noOfRepos = 3;
const noOfIssues = 5;

// const __dirname = path.resolve;
const p = path.join(__dirname, '/data.json');
// console.log(p);

request(`${baseUrl}/topics`, async (err, res, html) => {
  if (err) {
    return console.error(err);
  }

  scrape(html);
  setTimeout(() => {
    const storeText = JSON.stringify(STORE);
    fs.writeFileSync(p, storeText);
  }, 4000);
});

const scrape = async (data) => {
  const $ = cheerio.load(data);
  const gitTopics = $('.topic-box > a');
  for (let i = 0; i < gitTopics.length; i++) {
    const linkToTopicPage = $(gitTopics[i]).attr('href');
    STORE[linkToTopicPage] = {};
    scrapeRepo(linkToTopicPage, noOfRepos);
  }
};

const scrapeRepo = (link) => {
  request(`${baseUrl}${link}`, (err, res, html) => {
    if (err) {
      return console.error(err);
    }

    const $ = cheerio.load(html);
    const repoLinks = $('.text-bold.wb-break-word');
    for (let i = 0; i < noOfRepos; i++) {
      const repoLink = $(repoLinks[i]).attr('href');
      STORE[link][repoLink] = [];
      scrapeIssues(repoLink, link);
    }
  });
};

const scrapeIssues = (link, topicLink) => {
  const arr = [];
  request(`${baseUrl}${link}/issues`, (err, res, html) => {
    if (err) {
      return console.error(err);
    }

    const $ = cheerio.load(html);
    const issuesArr = $(
      '.Link--primary.v-align-middle.no-underline.js-navigation-open.markdown-title'
    );
    for (let i = 0; i < noOfIssues; i++) {
      issueLink = $(issuesArr[i]).attr('href');
      STORE[topicLink][link].push(`${baseUrl}${issueLink}`);
    }
    if (STORE[topicLink][link].length == 0) {
      STORE[topicLink][link].push('NO ISSUES FOUND');
    }
  });
  // return arr;
};
