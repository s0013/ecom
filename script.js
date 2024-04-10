document.addEventListener("DOMContentLoaded", async function() {
    const productsData = await fetch('https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json')
        .then(response => response.json());

    renderProducts(['Men', 'Women', 'Kids'], productsData);

    document.querySelectorAll('.checkboxes input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedCategories = Array.from(document.querySelectorAll('.checkboxes input:checked'))
                .map(checkbox => checkbox.id); 
            renderProducts(selectedCategories, productsData);
        });
    });

    document.getElementById('search').addEventListener('keyup', handleSearch);

    function renderProducts(categories, data) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        categories.forEach(categoryId => {
            const category = data.categories.find(cat => cat.category_name.toLowerCase() === categoryId.toLowerCase());
            if (!category) return;
            category.category_products.forEach(product => {
                productList.appendChild(createProductCard(product));
            });
        });
    }

    function handleSearch() {
        const searchText = document.getElementById('search').value.toLowerCase();
        const filteredProducts = productsData.categories.flatMap(category =>
            category.category_products.filter(product =>
                product.title.toLowerCase().includes(searchText) ||
                product.vendor.toLowerCase().includes(searchText) ||
                category.category_name.toLowerCase().includes(searchText)
            )
        );
        renderFilteredProducts(filteredProducts);
    }

    function renderFilteredProducts(products) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        products.forEach(product => {
            productList.appendChild(createProductCard(product));
        });
    }

    function createProductCard(product) {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">₹${product.price}</p>
                <p class="vendor">${product.vendor}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        `;
        return productCard;
    }

    let cart = {};

    // Add to cart button event listener
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productTitle = event.target.closest('.product-card').querySelector('.product-title').innerText;
            if (cart[productTitle]) {
                cart[productTitle]++;
            } else {
                cart[productTitle] = 1;
            }
            updateCartIconQuantity();
            renderCartItems();
        }
    });

    function updateCartIconQuantity() {
        const cartQuantitySpan = document.querySelector('.cart-quantity');
        const totalItems = Object.values(cart).reduce((acc, val) => acc + val, 0);
        cartQuantitySpan.textContent = totalItems;
    }

    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;
        Object.entries(cart).forEach(([title, quantity]) => {
            const product = productsData.categories.flatMap(category =>
                category.category_products.filter(product =>
                    product.title.toLowerCase() === title.toLowerCase()
                )
            )[0]; // Assuming each product title is unique
    
            if (product) {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                const itemPrice = product.price * quantity;
                totalPrice += itemPrice;
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${product.title}</h4>
                        <p>Vendor: ${product.vendor}</p>
                        <p>Price: ₹${product.price}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-title="${product.title}">-</button>
                            <span class="quantity">${quantity}</span>
                            <button class="quantity-btn plus" data-title="${product.title}">+</button>
                        </div>
                        <p>Total: ₹${itemPrice}</p>
                        <button class="remove-btn" data-title="${product.title}">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItem);
            }
        });
    
        // Display total price
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.textContent = `Total Price: ₹${totalPrice}`;
        cartItemsContainer.appendChild(totalElement);
    
        // Add event listeners for quantity controls and remove buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveItem);
        });
    }
    
    function handleQuantityChange(event) {
        const title = event.target.getAttribute('data-title');
        const action = event.target.classList.contains('plus') ? 'increase' : 'decrease';
        if (action === 'increase') {
            cart[title]++;
        } else if (cart[title] > 1) {
            cart[title]--;
        }
        renderCartItems();
    }
    
    function handleRemoveItem(event) {
        const title = event.target.getAttribute('data-title');
        delete cart[title];
        renderCartItems();
    }
    
    
});