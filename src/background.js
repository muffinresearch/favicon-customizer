const SETTINGS_KEY = 'mrl-favicon-customizer';
let faviconData = [];

function onError(error) {
  console.error(`Error: ${error}`);
}

function handleTabChange(tabId, changeInfo, tab) {
  // Inspect the tab when it's completely loaded and find out if we need
  // to make a favicon change.
  if (changeInfo && changeInfo.status && changeInfo.status === 'complete' && faviconData) {
    faviconData.forEach((item) => {
      let tabMatched = false;
      if (tab.url.startsWith(item.origin)) {
        tabMatched = true;
        if (item['title-pattern'] && tab.title.indexOf(item['title-pattern']) === -1) {
          tabMatched = false;
        }
      }

      if (tabMatched && item.base64) {
        browser.tabs.executeScript({ file: '/change-favicon.js' })
          .then(() => {
            return browser.tabs.sendMessage(tab.id, { dataURI: item.base64 });
          })
          .catch(onError);
      }
    });
  }
}

function handleStorageChange(changes) {
  if (changes[SETTINGS_KEY]) {
    faviconData = changes[SETTINGS_KEY].newValue;
  }
}

browser.tabs.onUpdated.addListener(handleTabChange);
browser.tabs.onCreated.addListener(handleTabChange);
browser.storage.onChanged.addListener(handleStorageChange);
browser.storage.local.get(SETTINGS_KEY)
  .then((results) => {
    faviconData = results[SETTINGS_KEY];
  })
  .catch(onError);
