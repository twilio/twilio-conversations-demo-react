const { Given, When, Then } = require('@wdio/cucumber-framework');

const LoginPage = require('../pageobjects/login.page');
const { Login_variables } = require('../../environments/env_data/test-variables.json');

const pages = {
    login: LoginPage
}

Given(/^I am on the (\w+) page$/, async (page) => {
    await pages[page].open();
});

When(/^I login with username and password$/, async () => {
    await browser.pause(3000);
    await LoginPage.login(Login_variables.username, Login_variables.password);
});

Then(/^I should see available conversations$/, async () => {
    await browser.pause(10000);
});

