const { Given, When, Then } = require('@wdio/cucumber-framework');

const LoginPage = require('../pageobjects/login.page');

const pages = {
    login: LoginPage
}

Given(/^I am on the (\w+) page$/, async (page) => {
    await pages[page].open();
});

When(/^I login with (\w+) and (.+)$/, async (username, password) => {
    await browser.pause(3000);
    await LoginPage.login(username, password);
});

Then(/^I should see available conversations$/, async () => {
    await browser.pause(10000);
});

