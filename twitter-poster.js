const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class TwitterPoster {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.browser = null;
    this.page = null;
    this.sessionPath = path.join(__dirname, 'twitter-session');
  }

  async initBrowser() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      userDataDir: this.sessionPath
    });
    this.page = await this.browser.newPage();
  }

  async checkLoggedIn() {
    try {
      await this.page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });
      await this.page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async login() {
    await this.initBrowser();
    
    if (await this.checkLoggedIn()) {
      console.log('Already logged in, using existing session');
      return;
    }

    console.log('Logging in...');
    await this.page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });
    
    await this.page.waitForSelector('input[name="text"]');
    await this.page.type('input[name="text"]', this.username);
    
    await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('Next'));
      if (nextButton) nextButton.click();
    });
    
    await this.page.waitForSelector('input[name="password"]');
    await this.page.type('input[name="password"]', this.password);
    
    await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginButton = buttons.find(btn => btn.textContent.includes('Log in'));
      if (loginButton) loginButton.click();
    });
    
    await this.page.waitForTimeout(5000);
  }

  async postTweet(content) {
    await this.page.waitForSelector('[data-testid="tweetTextarea_0"]');
    await this.page.click('[data-testid="tweetTextarea_0"]');
    await this.page.type('[data-testid="tweetTextarea_0"]', content);
    await this.page.click('[data-testid="tweetButtonInline"]');
    await this.page.waitForTimeout(3000);
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = TwitterPoster;
