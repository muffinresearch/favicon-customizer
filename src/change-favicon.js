function createFavicon(dataURI) {
  const h = document.getElementsByTagName('head')[0];
  const lnk = document.createElement('link');
  lnk.rel = 'shortcut icon';
  lnk.type = 'image/x-icon';
  lnk.href = dataURI;
  h.appendChild(lnk);
}

// Remove any existing favicons
function clearFavicons() {
  const h = document.getElementsByTagName('head')[0];
  const links = h.getElementsByTagName('link');
  const listOfRemovals = [];
  for (let i = 0, j = links.length; i < j; i++) {
    const curLink = links[i];
    if (curLink && (curLink.rel === 'shortcut icon' || curLink.rel === 'icon')) {
      listOfRemovals.push(curLink);
    }
  }
  for (let i = 0, j = listOfRemovals.length; i < j; i++) {
    h.removeChild(listOfRemovals[i]);
  }
}

function handleMessage(request, sender) {
  if (sender.id === 'favicon-customizer@muffinresearch.co.uk') {
    if (request.dataURI && request.dataURI.startsWith('data:image/png')) {
      clearFavicons();
      createFavicon(request.dataURI);
    } else {
      console.error(`Content wasn't a png so this is a no-op`);
    }
  }
}

browser.runtime.onMessage.addListener(handleMessage);
