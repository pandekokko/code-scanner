const arr = [];

function onScanSuccess(qrCodeMessage) {
  if (!arr.includes(qrCodeMessage)) {
    arr.push(qrCodeMessage);
    document.getElementById("result").innerHTML += '<span class="result">' + qrCodeMessage + "</span> <br>";
  }
}

function onScanError(errorMessage) {
  console.error(`Error scanning QR code: ${errorMessage}`);
}

const html5QrCodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});
html5QrCodeScanner.render(onScanSuccess, onScanError);

const getProductID = async (productUrl) => {
  try {
    const response = await fetch(productUrl);
    if (response.ok) {
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const productId = doc.querySelector("form[action='/cart/add'] input[name='id']").value;
      console.log(`Product ID: ${productId}`);
      return productId;
    } else {
      console.error(`Error fetching product page: ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product page: ${error}`);
    return null;
  }
};

const addToCart = async (productId) => {
  if (productId) {
    const quantity = 1;
    const url = "https://handyman.gocart.ph/cart/add.json";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${productId}&quantity=${quantity}&form_type=product`,
      });
      const data = await response.json();
      console.log(data);
      document.getElementById("result").innerHTML += '<span class="result">' + data.title + ": " + data.price + "</span> <br>";
      if (data.status === "success") {
        console.log(`Product added to cart: ${productId}`);
      } else {
        console.error(`Error adding product to cart: ${data.description}`);
      }
    } catch (error) {
      console.error(`Error adding product to cart: ${error}`);
    }
  }
};

async function listCartItems() {
  const url = "https://handyman.gocart.ph/cart.json";
  
  const response = await fetch(url);
  const { items } = await response.json();
  const products = [];
  for (const item of items) {
    const { product_id, variant_id } = item;
    products.push({ productId: product_id, variantId: variant_id });
  }
  console.log("Cart Items:", products);
}

const addProductsToCart = async () => {
  for (const url of arr) {
    const productId = await getProductID(url);
    await addToCart(productId);
  }
};
