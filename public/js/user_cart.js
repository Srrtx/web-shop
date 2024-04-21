// total product price
let totalPrice = 0;
// get user
async function getUser() {
    try {
        const response = await fetch('/userInfo');
        if (response.ok) {
            const data = await response.json();
            document.querySelector('#username').textContent = data.username;
        }
        else if (response.status == 500) {
            const data = await response.text();
            throw Error(data);
        }
        else {
            throw Error('Connection error');
        }
    } catch (err) {
        console.error(err.message);
        Notiflix.Report.failure('Error', err.message, 'Close');
    }
}

// get product from localStorage
// show product table
function showProduct() {
    let data = [];
    if(localStorage.cart !== undefined) {
        data = JSON.parse(localStorage.cart);
    }
    const tbody = document.querySelector('#tbody');
    let temp = '';
    totalPrice = 0;
    data.forEach(function(product) {
        temp += `<tr>`;
        temp += `<td>${product.product_id}</td>`;
        temp += `<td><img src="/public/img/${product.img}" width="64px"></td>`;
        temp += `<td>${product.name}</td>`;
        temp += `<td>${product.price}</td>`;
        temp += `</tr>`;
        totalPrice += product.price;
    });
    // total price
    if(data.length !== 0) {
        temp += `<tr class="table-warning"><td></td> <td></td> <td class="text-end">Total price</td> <td>${totalPrice}</td></tr>`;
    }
    tbody.innerHTML = temp;
}

// clear cart
document.querySelector('#btnClear').onclick = function() {
    try {
        localStorage.removeItem('cart');
        Notiflix.Report.success('Success', 'Cart is clear', 'OK',
            function cb(){
                showProduct();
            }
        );
    } catch (error) {
        Notiflix.Report.failure('Error', error.message, 'Close');
    }
}

// checkout
document.querySelector('#btnCheckout').onclick = async function() {
    if(localStorage.cart !== undefined) {
        // load JSON
        const data = localStorage.cart;
        try {
            const options = {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: data,
            };
            const response = await fetch('/user/checkout/' + totalPrice, options);
            if (response.ok) {
                const data = await response.text();
                Notiflix.Report.success('Success', data, 'OK', 
                    function cb(){
                        localStorage.removeItem('cart');
                        showProduct();
                    }
                );
            }
            else if (response.status == 500) {
                const data = await response.text();
                throw Error(data);
            }
            else {
                throw Error('Connection error');
            }
        } catch (err) {
            console.error(err.message);
            Notiflix.Report.failure('Error', err.message, 'Close');
        }
    }
    else {
        Notiflix.Report.failure('Error', 'Nothing in cart!', 'Close');
    } 
}

// get user info
getUser();
// get and show product
showProduct();