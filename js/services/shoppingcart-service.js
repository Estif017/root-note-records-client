let cartService;

class ShoppingCartService {
	cart = {
		items: [],
		total: 0,
	};

	/* =========================
     Helpers
  ========================= */

	showSuccess(message) {
		templateBuilder.append('message', { message }, 'messages');

		setTimeout(() => {
			const container = document.getElementById('messages');
			if (container?.lastElementChild) {
				container.lastElementChild.remove();
			}
		}, 2000);
	}

	showError(message) {
		templateBuilder.append('error', { error: message }, 'errors');
	}

	/* =========================
     API Calls
  ========================= */

	addToCart(productId) {
		const url = `${config.baseUrl}/cart/products/${productId}`;

		axios
			.post(url, {})
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
				this.showSuccess('Added to cart.');
				// this.loadCartPage();
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Add to cart failed.';
				this.showError(msg);
			});
	}

	updateQuantity(productId, quantity) {
		const url = `${config.baseUrl}/cart/products/${productId}`;

		axios
			.put(url, { quantity })
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
				this.loadCartPage();
				this.showSuccess('Cart updated.');
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Update cart failed.';
				this.showError(msg);
			});
	}

	removeFromCart(productId) {
		this.updateQuantity(productId, 0);
	}

	clearCart() {
		const url = `${config.baseUrl}/cart`;

		axios
			.delete(url)
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
				this.loadCartPage();
				this.showSuccess('Cart cleared.');
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Clear cart failed.';
				this.showError(msg);
			});
	}

	loadCart() {
		const url = `${config.baseUrl}/cart`;

		axios
			.get(url)
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Load cart failed.';
				this.showError(msg);
			});
	}

	/* =========================
     State Management
  ========================= */

	setCart(data) {
		this.cart = {
			items: [],
			total: data.total || 0,
		};

		for (const value of Object.values(data.items || {})) {
			this.cart.items.push(value);
		}
	}

	updateCartDisplay() {
		try {
			const cartControl = document.getElementById('cart-items');
			// show total quantity including duplicates
			const totalQty = (this.cart.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
			if (cartControl) cartControl.innerText = totalQty;
		} catch (e) {}
	}

	/* =========================
     Cart Page Rendering
  ========================= */

	loadCartPage() {
		const main = document.getElementById('main');
		main.innerHTML = '';

		const contentDiv = document.createElement('div');
		contentDiv.id = 'content';
		contentDiv.classList.add('content-form');

		const header = document.createElement('div');
		header.classList.add('cart-header');

		const h1 = document.createElement('h1');
		h1.innerText = 'Cart';
		header.appendChild(h1);

		const clearBtn = document.createElement('button');
		clearBtn.classList.add('btn', 'btn-danger');
		clearBtn.innerText = 'Clear';
		clearBtn.disabled = this.cart.items.length === 0;
		clearBtn.addEventListener('click', () => this.clearCart());
		header.appendChild(clearBtn);

		contentDiv.appendChild(header);

		if (this.cart.items.length === 0) {
			const empty = document.createElement('p');
			empty.innerText = 'Your cart is empty.';
			contentDiv.appendChild(empty);
			main.appendChild(contentDiv);
			return;
		}

		this.cart.items.forEach((item) => {
			this.buildItem(item, contentDiv);
		});

		const totalDiv = document.createElement('div');
		totalDiv.classList.add('cart-total');

		const totalH3 = document.createElement('h3');
		totalH3.innerText = `Total: $${Number(this.cart.total).toFixed(2)}`;
		totalDiv.appendChild(totalH3);

		contentDiv.appendChild(totalDiv);
		main.appendChild(contentDiv);
	}

	buildItem(item, parent) {
		const productId = item.product.productId;

		const outer = document.createElement('div');
		outer.classList.add('cart-item');

		const img = document.createElement('img');
		img.src = `/images/products/${item.product.imageUrl}`;
		img.alt = item.product.name;

		// details column (name, price, description)
		const details = document.createElement('div');
		details.classList.add('details');

		const name = document.createElement('h4');
		name.innerText = item.product.name;

		const price = document.createElement('p');
		price.classList.add('price');
		price.innerText = `$${Number(item.product.price).toFixed(2)}`;

		const desc = document.createElement('p');
		desc.classList.add('description');
		desc.innerText = item.product.description;

		details.append(name, price, desc);

		const controls = document.createElement('div');
		controls.classList.add('quantity-controls');

		const minus = document.createElement('button');
		minus.classList.add('btn', 'btn-sm');
		minus.innerText = '-';

		const qty = document.createElement('span');
		qty.classList.add('item-qty');
		qty.dataset.productId = productId;
		qty.innerText = item.quantity;

		const plus = document.createElement('button');
		plus.classList.add('btn', 'btn-sm');
		plus.innerText = '+';

		// read current qty from the DOM so clicks reflect current state
		minus.addEventListener('click', () => {
			const current = Number(qty.innerText || 0);
			this.updateQuantity(productId, Math.max(0, current - 1));
		});
		plus.addEventListener('click', () => {
			const current = Number(qty.innerText || 0);
			this.updateQuantity(productId, current + 1);
		});

		const remove = document.createElement('button');
		remove.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn');
		remove.innerText = 'Remove';
		remove.addEventListener('click', () => this.removeFromCart(productId));

		// place controls under price inside details and include Remove next to +
		const controlsRow = document.createElement('div');
		controlsRow.classList.add('quantity-controls');
		controlsRow.append(minus, qty, plus, remove);

		details.append(controlsRow, desc);

		outer.append(img, details);
		parent.appendChild(outer);
	}
}

/* =========================
   Init
========================= */

document.addEventListener('DOMContentLoaded', () => {
	cartService = new ShoppingCartService();

	if (userService.isLoggedIn()) {
		cartService.loadCart();
	}
});

// let cartService;

// class ShoppingCartService {
// 	cart = {
// 		items: [],
// 		total: 0,
// 	};

// 	showSuccess(message) {
// 		templateBuilder.append('message', { message }, 'messages');

// 		setTimeout(() => {
// 			const container = document.getElementById('messages');
// 			if (container?.lastElementChild) {
// 				container.lastElementChild.remove();
// 			}
// 		}, 1000);
// 	}

// 	showError(message) {
// 		templateBuilder.append('error', { error: message }, 'errors');

// 		setTimeout(() => {
// 			const container = document.getElementById('errors');
// 			if (container?.lastElementChild) {
// 				container.lastElementChild.remove();
// 			}
// 		}, 1000);
// 	}

// 	addToCart(productId) {
// 		const url = `${config.baseUrl}/cart/products/${productId}`;

// 		axios
// 			.post(url, {})
// 			.then((response) => {
// 				this.setCart(response.data);
// 				this.updateCartDisplay();
// 				this.showSuccess('Added to cart.');
// 				// this.loadCartPage();
// 			})
// 			.catch((error) => {
// 				const msg =
// 					error?.response?.data?.error ||
// 					error?.response?.data?.message ||
// 					error.message ||
// 					'Add to cart failed.';
// 				this.showError(msg);
// 			});
// 	}

// 	// addToCart(productId) {
// 	// 	const url = `${config.baseUrl}/cart/products/${productId}`;
// 	// 	// const headers = userService.getHeaders();

// 	// 	axios
// 	// 		.post(url, {}) // ,{headers})
// 	// 		.then((response) => {
// 	// 			this.setCart(response.data);

// 	// 			this.updateCartDisplay();
// 	// 			this.showSuccess("Added to cart.");
// 	//       this.loadCartPage();

// 	// 			// update quantity & total in-place if present
// 	// 			try {
// 	// 				const qtySpan = document.querySelector(
// 	// 					`.item-qty[data-product-id="${productId}"]`
// 	// 				);
// 	// 				if (qtySpan) {
// 	// 					const updated = this.cart.items.find(
// 	// 						(i) => i.product.id == productId
// 	// 					);
// 	// 					qtySpan.innerText = updated ? updated.quantity : qtySpan.innerText;
// 	// 				}
// 	// 				// update total display if present
// 	// 				const totalH3 = document.querySelector('.cart-total h3');
// 	// 				if (totalH3)
// 	// 					totalH3.innerText = `Total: $${Number(this.cart.total || 0).toFixed(
// 	// 						2
// 	// 					)}`;
// 	// 			} catch (e) {}

// 	// 			templateBuilder.append(
// 	// 				'message',
// 	// 				{ message: 'Added to cart successfully.' },
// 	// 				'messages'
// 	// 			);
// 	// 		})
// 	// 		.catch((error) => {
// 	// 			const msg =
// 	// 				(error &&
// 	// 					error.response &&
// 	// 					error.response.data &&
// 	// 					(error.response.data.error || error.response.data.message)) ||
// 	// 				error.message ||
// 	// 				'Add to cart failed.';
// 	// 			templateBuilder.append('error', { error: msg }, 'errors');
// 	// 		});
// 	// }

// 	setCart(data) {
// 		this.cart = {
// 			items: [],
// 			total: 0,
// 		};

// 		this.cart.total = data.total;

// 		for (const [key, value] of Object.entries(data.items)) {
// 			this.cart.items.push(value);
// 		}
// 	}

// 	loadCart() {
// 		const url = `${config.baseUrl}/cart`;

// 		axios
// 			.get(url)
// 			.then((response) => {
// 				this.setCart(response.data);

// 				this.updateCartDisplay();
// 			})
// 			.catch((error) => {
// 				const msg =
// 					(error &&
// 						error.response &&
// 						error.response.data &&
// 						(error.response.data.error || error.response.data.message)) ||
// 					error.message ||
// 					'Load cart failed.';
// 				templateBuilder.append('error', { error: msg }, 'errors');
// 			});
// 	}

// 	loadCartPage() {
// 		// templateBuilder.build("cart", this.cart, "main");

// 		const main = document.getElementById('main');
// 		main.innerHTML = '';

// 		let div = document.createElement('div');
// 		div.classList = 'filter-box';
// 		main.appendChild(div);

// 		const contentDiv = document.createElement('div');
// 		contentDiv.id = 'content';
// 		contentDiv.classList.add('content-form');

// 		const cartHeader = document.createElement('div');
// 		cartHeader.classList.add('cart-header');

// 		const h1 = document.createElement('h1');
// 		h1.innerText = 'Cart';
// 		cartHeader.appendChild(h1);

// 		const button = document.createElement('button');
// 		button.classList.add('btn');
// 		button.classList.add('btn-danger');
// 		button.innerText = 'Clear';
// 		button.addEventListener('click', () => this.clearCart());
// 		cartHeader.appendChild(button);

// 		contentDiv.appendChild(cartHeader);
// 		main.appendChild(contentDiv);

// 		// let parent = document.getElementById("cart-item-list");
// 		this.cart.items.forEach((item) => {
// 			this.buildItem(item, contentDiv);
// 		});

// 		// show total amount
// 		let totalDiv = document.createElement('div');
// 		totalDiv.classList.add('cart-total');
// 		let totalH3 = document.createElement('h3');
// 		totalH3.innerText = `Total: $${Number(this.cart.total || 0).toFixed(2)}`;
// 		totalDiv.appendChild(totalH3);
// 		contentDiv.appendChild(totalDiv);
// 	}

// 	buildItem(item, parent) {
// 		let outerDiv = document.createElement('div');
// 		outerDiv.classList.add('cart-item');
// 		outerDiv.dataset.productId = item.product.id;

// 		// product info (image, name, price, description)
// 		let infoDiv = document.createElement('div');
// 		infoDiv.classList.add('photo');

// 		let img = document.createElement('img');
// 		const imageUrl =
// 			item.product && item.product.imageUrl
// 				? item.product.imageUrl
// 				: 'no-image.jpg';
// 		img.src = `/images/products/${imageUrl}`;
// 		img.alt = item.product && item.product.name ? item.product.name : '';
// 		img.addEventListener('click', () => {
// 			if (window.showImageDetailForm)
// 				showImageDetailForm(item.product.name, img.src);
// 		});

// 		let infoText = document.createElement('div');
// 		let nameH4 = document.createElement('h4');
// 		nameH4.innerText =
// 			item.product && item.product.name ? item.product.name : 'Product';
// 		let priceH4 = document.createElement('h4');
// 		priceH4.classList.add('price');
// 		priceH4.innerText = `$${Number(
// 			item.product && item.product.price ? item.product.price : 0
// 		).toFixed(2)}`;

// 		let descP = document.createElement('p');
// 		descP.innerText =
// 			item.product && item.product.description ? item.product.description : '';

// 		infoText.appendChild(nameH4);
// 		infoText.appendChild(priceH4);
// 		infoText.appendChild(descP);

// 		infoDiv.appendChild(img);
// 		infoDiv.appendChild(infoText);

// 		outerDiv.appendChild(infoDiv);

// 		let controlsDiv = document.createElement('div');
// 		controlsDiv.classList.add('quantity-controls');

// 		let minusBtn = document.createElement('button');
// 		minusBtn.classList.add('btn');
// 		minusBtn.classList.add('btn-sm');
// 		minusBtn.innerText = '-';
// 		minusBtn.addEventListener('click', () => {
// 			this.optimisticRemove(item.product.id);
// 		});

// 		let qtySpan = document.createElement('span');
// 		qtySpan.classList.add('item-qty');
// 		qtySpan.dataset.productId = item.product.id;
// 		qtySpan.innerText = item.quantity;

// 		let plusBtn = document.createElement('button');
// 		plusBtn.classList.add('btn');
// 		plusBtn.classList.add('btn-sm');
// 		plusBtn.innerText = '+';
// 		plusBtn.addEventListener('click', () => {
// 			this.optimisticAdd(item.product.id);
// 		});

// 		controlsDiv.appendChild(minusBtn);
// 		controlsDiv.appendChild(qtySpan);
// 		controlsDiv.appendChild(plusBtn);

// 		outerDiv.appendChild(controlsDiv);

// 		parent.appendChild(outerDiv);
// 	}

// 	// clearCart() {
// 	// 	const url = `${config.baseUrl}/cart`;

// 	// 	axios
// 	// 		.delete(url)
// 	// 		.then((response) => {
// 	// 			this.cart = {
// 	// 				items: [],
// 	// 				total: 0,
// 	// 			};

// 	// 			this.cart.total = response.data.total;

// 	// 			for (const [key, value] of Object.entries(response.data.items)) {
// 	// 				this.cart.items.push(value);
// 	// 			}

// 	// 			this.updateCartDisplay();
// 	// 			this.loadCartPage();
// 	// 		})
// 	// 		.catch((error) => {
// 	// 			const msg =
// 	// 				(error &&
// 	// 					error.response &&
// 	// 					error.response.data &&
// 	// 					(error.response.data.error || error.response.data.message)) ||
// 	// 				error.message ||
// 	// 				'Empty cart failed.';
// 	// 			templateBuilder.append('error', { error: msg }, 'errors');
// 	// 		});
// 	// }

// 	// // optimistic UI helpers
// 	// optimisticAdd(productId) {
// 	// 	// increment displayed qty if present
// 	// 	try {
// 	// 		const qtySpan = document.querySelector(
// 	// 			`.item-qty[data-product-id="${productId}"]`
// 	// 		);
// 	// 		if (qtySpan) {
// 	// 			qtySpan.innerText = Number(qtySpan.innerText || 0) + 1;
// 	// 		}
// 	// 	} catch (e) {}

// 	// 	this.addToCart(productId);
// 	// }

// 	// optimisticRemove(productId) {
// 	// 	// decrement displayed qty if present
// 	// 	try {
// 	// 		const qtySpan = document.querySelector(
// 	// 			`.item-qty[data-product-id="${productId}"]`
// 	// 		);
// 	// 		if (qtySpan) {
// 	// 			const current = Number(qtySpan.innerText || 0);
// 	// 			if (current > 1) qtySpan.innerText = current - 1;
// 	// 			else {
// 	// 				// remove item from DOM immediately
// 	// 				const outer = document.querySelector(
// 	// 					`.cart-item[data-product-id="${productId}"]`
// 	// 				);
// 	// 				if (outer && outer.parentNode) outer.parentNode.removeChild(outer);
// 	// 			}
// 	// 		}
// 	// 	} catch (e) {}

// 	// 	this.removeFromCart(productId);
// 	// }

// 	// removeFromCart(productId) {
// 	// 	const url = `${config.baseUrl}/cart/products/${productId}`;

// 	// 	axios
// 	// 		.delete(url)
// 	// 		.then((response) => {
// 	// 			this.setCart(response.data);
// 	// 			this.updateCartDisplay();
// 	// 			// update quantity & total in-place if present
// 	// 			try {
// 	// 				const qtySpan = document.querySelector(
// 	// 					`.item-qty[data-product-id="${productId}"]`
// 	// 				);
// 	// 				if (qtySpan) {
// 	// 					const updated = this.cart.items.find(
// 	// 						(i) => i.product.id == productId
// 	// 					);
// 	// 					if (updated) {
// 	// 						qtySpan.innerText = updated.quantity;
// 	// 					} else {
// 	// 						// removed entirely
// 	// 						const outer = document.querySelector(
// 	// 							`.cart-item[data-product-id="${productId}"]`
// 	// 						);
// 	// 						if (outer && outer.parentNode)
// 	// 							outer.parentNode.removeChild(outer);
// 	// 					}
// 	// 				}
// 	// 				const totalH3 = document.querySelector('.cart-total h3');
// 	// 				if (totalH3)
// 	// 					totalH3.innerText = `Total: $${Number(this.cart.total || 0).toFixed(
// 	// 						2
// 	// 					)}`;
// 	// 			} catch (e) {}

// 	// 			templateBuilder.append(
// 	// 				'message',
// 	// 				{ message: 'Removed from cart.' },
// 	// 				'messages'
// 	// 			);
// 	// 		})
// 	// 		.catch((error) => {
// 	// 			const msg =
// 	// 				(error &&
// 	// 					error.response &&
// 	// 					error.response.data &&
// 	// 					(error.response.data.error || error.response.data.message)) ||
// 	// 				error.message ||
// 	// 				'Remove from cart failed.';
// 	// 			templateBuilder.append('error', { error: msg }, 'errors');
// 	// 		});
// 	// }

// 	updateQuantity(productId, quantity) {
// 		const url = `${config.baseUrl}/cart/products/${productId}`;

// 		axios
// 			.put(url, { quantity })
// 			.then((response) => {
// 				this.setCart(response.data);
// 				this.updateCartDisplay();
// 				this.loadCartPage();
// 				this.showSuccess('Cart updated.');
// 			})
// 			.catch((error) => {
// 				const msg =
// 					error?.response?.data?.error ||
// 					error?.response?.data?.message ||
// 					error.message ||
// 					'Update cart failed.';
// 				this.showError(msg);
// 			});
// 	}

// 	removeFromCart(productId) {
// 		this.updateQuantity(productId, 0);
// 	}
// 	clearCart() {
// 		const url = `${config.baseUrl}/cart`;

// 		axios
// 			.delete(url)
// 			.then((response) => {
// 				this.setCart(response.data);
// 				this.updateCartDisplay();
// 				this.loadCartPage();
// 				this.showSuccess('Cart cleared.');
// 			})
// 			.catch((error) => {
// 				const msg =
// 					error?.response?.data?.error ||
// 					error?.response?.data?.message ||
// 					error.message ||
// 					'Clear cart failed.';
// 				this.showError(msg);
// 			});
// 	}

// 	updateCartDisplay() {
// 		try {
// 			const itemCount = this.cart.items.length;
// 			const cartControl = document.getElementById('cart-items');

// 			cartControl.innerText = itemCount;
// 		} catch (e) {}
// 	}
// }

// document.addEventListener('DOMContentLoaded', () => {
// 	cartService = new ShoppingCartService();

// 	if (userService.isLoggedIn()) {
// 		cartService.loadCart();
// 	}
// });
