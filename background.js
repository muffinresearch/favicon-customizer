const SETTINGS_KEY = 'mrl-favicon-customizer';
let faviconData = [];

function onExecuted(result) {
  console.log(`Favicon updated`);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function handleTabChange(tabId, changeInfo, tab) {
  if (changeInfo && changeInfo.status && changeInfo.status === 'complete') {
    faviconData.forEach((item) => {
      let tabMatched = false;
      if (tab.url.startsWith(item.origin)) {
        tabMatched = true;
        if (item['title-pattern'] && tab.title.indexOf(item['title-pattern']) === -1) {
          tabMatched = false;
        }
      }

      if (tabMatched && item.base64) {
        var executing = browser.tabs.executeScript({
          code: changeFavicon(item.base64),
        });
        executing.then(onExecuted, onError);
      }
    });
  }
};

function handleStorageChange(changes) {
  console.log(changes);
  if (changes[SETTINGS_KEY]) {
    faviconData = changes[SETTINGS_KEY].newValue;
  }
}

function changeFavicon(base64Data) {
  return `
    (function() {
    const d = document;
    const w = window;
    const h = document.getElementsByTagName('head')[0];

    // Create this favicon
    const lnk = d.createElement('link');
    lnk.rel = 'shortcut icon';
    lnk.type = 'image/x-icon';
    lnk.href = '${base64Data}';
    // Remove any existing favicons
    const links = h.getElementsByTagName('link');
    const listOfRemovals = [];

    for (var i=0, j=links.length; i < j; i++) {
      const curLink = links[i];
      if (curLink && (curLink.rel === "shortcut icon" || curLink.rel === "icon")) {
        listOfRemovals.push(curLink);
      }
    }

    for (var i=0, j=listOfRemovals.length; i < j; i++){
      h.removeChild(listOfRemovals[i]);
    }
    // Add this favicon to the head
    h.appendChild(lnk);
    return false;})();`;
}

browser.tabs.onUpdated.addListener(handleTabChange);
browser.tabs.onCreated.addListener(handleTabChange);
browser.storage.onChanged.addListener(handleStorageChange);
browser.storage.local.get(SETTINGS_KEY)
  .then((results) => {
    faviconData = results[SETTINGS_KEY];
  })
  .catch(onError);
