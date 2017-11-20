const SETTINGS_KEY = 'mrl-favicon-customizer';
const $form = document.getElementById('custom-favicons');
const $addButton = document.getElementById('add-favicon');

function onError(error) {
  console.error(`Error: ${error}`);
}

$form.onclick = (e) => {
  const $target = e.target;
  if ($target.className === 'placeholder') {
    const img = $target.querySelector('img');
    if (img) {
      $target.removeChild(img);
      const $base64 = $target.parentNode.querySelector('[name="base64"]');
      if ($base64) {
        $base64.value = '';
      }
    }
  }
};

$form.onchange = (e) => {
  const $target = e.target;

  // Deal with the file element.
  if ($target.nodeName === 'INPUT' && $target.type === 'file') {
    const $wrapper = $target.closest('.wrapper');
    const file = $target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const placeholder = $wrapper.querySelector('.placeholder');
      let img = placeholder.querySelector('img');
      let newImage = false;

      // If the format is wrong show an alert and bail.
      if (!reader.result.startsWith('data:image/png')) {
        $target.value = '';
        // eslint-disable-next-line no-alert
        window.alert('Invalid image format - only *.png accepted.');
        return;
      }

      $wrapper.querySelector('.base64').value = reader.result;
      if (!img) {
        img = document.createElement('img');
        newImage = true;
      }
      img.src = reader.result;
      if (newImage) {
        img.width = 64;
        img.height = 64;
        $wrapper.querySelector('.placeholder').appendChild(img);
      }
    };
    reader.onerror = onError;
  }
};

function getFormData() {
  const faviconForms = $form.querySelectorAll('.favicon-form');
  const dataFromForm = [];

  faviconForms.forEach((form) => {
    const formData = {};
    formData.title = form.querySelector('[name="title"]').value;
    formData.origin = form.querySelector('[name="origin"]').value;
    formData['title-pattern'] = form.querySelector('[name="title-pattern"]').value;
    formData.base64 = form.querySelector('[name="base64"]').value;
    dataFromForm.push(formData);
  });
  return dataFromForm;
}

function saveOptions(event) {
  browser.storage.local.set({ [SETTINGS_KEY]: getFormData() })
    .then(null, onError);
  if (event) {
    event.preventDefault();
  }
}

function deleteForm(e) {
  e.preventDefault();
  e.stopPropagation();
  const $target = e.target;
  const $targetParent = $target.parentNode;
  $targetParent.parentNode.removeChild($targetParent);
  saveOptions();
}

function addForm(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const $faviconForms = document.querySelectorAll('#custom-favicons .favicon-form');
  const $lastForm = Array.prototype.slice.call($faviconForms, -1)[0];
  const $newForm = $lastForm.cloneNode(true);
  let $removeButton = $newForm.querySelector('.remove-button');
  if ($removeButton === null) {
    $removeButton = document.createElement('button');
    $removeButton.textContent = 'Remove';
    $removeButton.className = 'remove-button';
    $newForm.appendChild($removeButton);
  }
  $removeButton.onclick = deleteForm;
  $newForm.querySelector('h2').textContent = `Custom Favicon ${$faviconForms.length + 1}`;
  $newForm.querySelector('[name="title"]').value = '';
  $newForm.querySelector('[name="origin"]').value = '';
  $newForm.querySelector('[name="title-pattern"]').value = '';
  $newForm.querySelector('[name="file"]').value = '';
  $newForm.querySelector('[name="base64"]').value = '';

  const $img = $newForm.querySelector('.placeholder img');
  if ($img !== null) {
    $newForm.querySelector('.placeholder').removeChild($img);
  }
  $form.insertBefore($newForm, $lastForm.nextSibling);
}

function restoreOptions() {
  browser.storage.local.get(SETTINGS_KEY)
    .then((results) => {
      const resultData = results[SETTINGS_KEY];
      let $faviconForms = $form.querySelectorAll('.favicon-form');
      const missingCount = resultData.length - $faviconForms.length;
      for (let i = 0; i < missingCount; i++) {
        addForm();
      }
      // Refresh forms lookup.
      $faviconForms = $form.querySelectorAll('.favicon-form');
      resultData.forEach((item, idx) => {
        const currentForm = $faviconForms[idx];
        currentForm.querySelector('[name="title"]').value = item.title;
        currentForm.querySelector('[name="origin"]').value = item.origin;
        currentForm.querySelector('[name="title-pattern"]').value = item['title-pattern'];
        currentForm.querySelector('[name="base64"]').value = item.base64;
        const $wrapper = currentForm.querySelector('.wrapper');

        if (item.base64) {
          const img = document.createElement('img');
          img.src = item.base64;
          img.width = 64;
          img.height = 64;
          $wrapper.querySelector('.placeholder').appendChild(img);
        }
      });
    })
    .catch(onError);
}

(function init() {
  restoreOptions();
  document.querySelector('#custom-favicons')
    .addEventListener('submit', saveOptions);
  $addButton.onclick = addForm;
}());
