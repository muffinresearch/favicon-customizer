const d = document;
const w = window;
const h = document.getElementsByTagName('head')[0];

function createFavicon(dataURI) {
  const lnk = d.createElement('link');
  lnk.rel = 'shortcut icon';
  lnk.type = 'image/x-icon';
  lnk.href = dataURI;
  h.appendChild(lnk);
}

// Remove any existing favicons
function clearFavicons() {
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
}

function handleMessage(request, sender) {
  if (request.dataURI) {
    clearFavicons();
    createFavicon(request.dataURI);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
