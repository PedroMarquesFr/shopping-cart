const changeLoadingState = () => {
  if (document.querySelector('.loading')) {
    document.querySelector('.loading').remove();
  } else {
    let loading = document.createElement('div');
    loading.classList.add('loading');
    document.querySelector('.items').appendChild(loading);
  }
};

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

const showAlert = (message) => {
  console.log(message);
};

const addToHTML = (parent, child) => {
  document.querySelector(parent).appendChild(child);
};

const displayOnHTML = (element, content) => {
  document.querySelector(element).innerText = content;
};

let toBePayed = 0;
const totalSum = (value = 0) => {
  toBePayed += value;
  displayOnHTML('.total-price', toBePayed);
  return toBePayed;
};

const setLocalSave = () => {
  localStorage.setItem(
    'Cart_Items',
    document.querySelector('.cart__items').innerHTML,
  );
  localStorage.setItem('Cart_Sum', totalSum());
};

function cartItemClickListenerRemove(event) {
  const price = parseInt(event.target.innerHTML.split('$')[1]);
  totalSum(-price);
  event.target.remove();
  setLocalSave();
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');

  const formatPrice = parseInt(salePrice);

  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', (event) => {
    cartItemClickListenerRemove(event);
  });

  totalSum(formatPrice);
  return li;
}

const handleAPIRequestToPrice = (API_REQ) => {
  fetch(API_REQ)
    .then(function (response) {
      return response.json();
    })
    .then((res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      addToHTML('.cart__items', createCartItemElement(res));
      setLocalSave();
    })
    .catch(showAlert);
};

const productItemClickListener = (event) => {
  const itemSection = event.target.parentNode;
  const id = getSkuFromProductItem(itemSection);
  handleAPIRequestToPrice(`https://api.mercadolibre.com/items/${id}`);
};

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  if (element === 'button') {
    e.addEventListener('click', productItemClickListener);
  }
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'),
  );
  console.log(section);
  return section;
}

const handleAmountOfElementsOnHTML = (res) => {
  const product = Object.entries(res);

  product.forEach((entry) => {
    const elementCreated = createProductItemElement(entry[1]);
    addToHTML('.items', elementCreated);
  });
};

const handleAPIRequest = async (API_REQ) => {
  try {
    const req = await fetch(API_REQ);
    const jso = await req.json();
    changeLoadingState();
    if (jso.error) {
      throw new Error(jso.error);
    }
    handleAmountOfElementsOnHTML(jso.results);
  } catch (error) {
    showAlert(error);
  }
};

const getLocalSave = () => {
  const currentSave = localStorage.getItem('Cart_Items');
  const sumPrices = parseInt(localStorage.getItem('Cart_Sum'));

  const list = document.querySelector('.cart__items');
  list.innerHTML = currentSave;
  document.querySelectorAll('.cart__item').forEach((item) => {
    item.addEventListener('click', cartItemClickListenerRemove);
  });
  totalSum(sumPrices);
  return currentSave;
};

const setupEventHandlers = () => {
  document.querySelector('.empty-cart').addEventListener('click', () => {
    document.querySelector('.cart__items').innerHTML = '';
    totalSum(-totalSum());
    setLocalSave();
  });
  document.querySelector('.searcher-button').addEventListener('click', () => {
    const key = document.querySelector('.searcher').value;
    document.querySelector('.items').innerHTML = '';
    changeLoadingState();
    handleAPIRequest(`https://api.mercadolibre.com/sites/MLB/search?q=${key}`);
  });
};
window.onload = function onload() {
  handleAPIRequest(
    'https://api.mercadolibre.com/sites/MLB/search?q=computador',
  );
  getLocalSave();
  setupEventHandlers();
};
