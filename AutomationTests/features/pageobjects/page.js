/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
module.exports = class Page {
    /**
    * Opens a sub page of the page
    */
    open () {
        return browser.url(`http://localhost:3000/`)
    }
}
