const SETTINGS_KEY = 'mrl-favicon-customizer';
let faviconData = [];

function onError(error) {
  console.error(`Error: ${error}`);
}

function changeFavicon(tab, faviconItem) {
  browser.tabs.executeScript({ file: '/change-favicon.js' })
    .then(() => {
      return browser.tabs.sendMessage(tab.id, { dataURI: faviconItem.base64 });
    })
    .catch(onError);
}

function handleTabChange(tabId, changeInfo, tab) {
  // Inspect the tab when it's completely loaded and find out if we need
  // to make a favicon change.
  if (!faviconData || !changeInfo) {
    return;
  }

  const isComplete = changeInfo.status && changeInfo.status === 'complete';
  const isFavIconUpdate = !!changeInfo.favIconUrl; // don't let the site reset the icon

  if (isComplete || isFavIconUpdate) {
    faviconData.forEach((item) => {
      let tabMatched = false;
      if (tab.url.startsWith(item.origin)) {
        tabMatched = true;
        if (item['title-pattern'] && tab.title.indexOf(item['title-pattern']) === -1) {
          tabMatched = false;
        }
      }

      if (tabMatched && item.base64) {
        changeFavicon(tab, item);

        // watch for the <link> favicon changing dynamically
        const link = document.querySelector('link[rel="shortcut icon"]');
        if (link) {
          const MutationObserver = window.MutationObserver
                                   || window.WebKitMutationObserver
                                   || window.MozMutationObserver;
          const observer = new MutationObserver(() => changeFavicon(tab, item));
          observer.observe(link, { attributes: true });
        }
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
