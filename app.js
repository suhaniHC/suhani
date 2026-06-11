// ১. আপনার Supabase এর সঠিক তথ্য ও আসল অ্যাক্সেস কী (১০০% নিখুঁত)
const SUPABASE_URL = "https://cuyijewingnzhkcyptfb.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_Lmoh901ezA0pIc-1H3Qknw_ug0ykWUNscHhBcnI2M3pTNXh0Z0o5WUpvdyI4ZTA5ODhiMi01OTMwLTQ5MWUtOTMwNC1kMDYyZDYzNDNiYTMi";

let products = [];
let cart = [];
let selectedPayment = 'bKash';

// ২. Supabase ডেটাবেস থেকে পণ্য নিয়ে আসার আসল ফাংশন
async function fetchProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error("ডেটা লোড করতে সমস্যা হয়েছে:", error);
        document.getElementById('productGrid').innerHTML = '<p class="text-gray-500 col-span-full text-center py-10">পণ্য লোড হতে সমস্যা হচ্ছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।</p>';
    }
}

// ৩. প্রোডাক্ট গ্রিড ডাইনামিকালি তৈরি করা
function displayProducts(productsToRender) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    if(!productsToRender || productsToRender.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 col-span-full text-center py-10">দোকানে কোনো পণ্য পাওয়া যায়নি। সুপাবেস টেবিলে পণ্য যোগ করুন।</p>';
        return;
    }

    productsToRender.forEach(prod => {
        grid.innerHTML += `
            <div class="bg-white p-4 rounded shadow border border-gray-100 flex flex-col justify-between">
                <img src="${prod.img || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'}" alt="${prod.title}" class="w-full h-48 object-cover rounded mb-4">
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${prod.title}</h3>
                    <p class="text-sm text-gray-500 my-1">${prod.desc || 'কোনো বিবরণ নেই।'}</p>
                    <div class="text-orange-600 font-bold text-xl my-2">৳${prod.price}</div>
                    <div class="text-xs text-gray-400 mb-3">স্টক আছে: ${prod.stock || 0} টি</div>
                </div>
                <div class="border-t border-gray-100 pt-2 mb-3">
                    <span class="text-yellow-500 text-sm">★★★★★ <span class="text-gray-500 text-xs">(৪.৮)</span></span>
                </div>
                <button onclick="addToCart(${prod.id})" class="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition cursor-pointer">
                    <i class="fa-solid fa-cart-plus mr-1"></i> কার্টে যুক্ত করুন
                </button>
            </div>
        `;
    });
}

// ৪. সার্চ ও সাজেশন লজিক
function showSuggestions(query) {
    const box = document.getElementById('suggestionBox');
    if (!query) { box.innerHTML = ''; return; }

    const filtered = products.filter(p => 
        p.title && p.title.toLowerCase().includes(query.toLowerCase())
    );

    box.innerHTML = '';
    if(filtered.length === 0) {
        box.innerHTML = `<div class="p-2 text-gray-400 text-sm">কোনো পণ্য পাওয়া যায়নি</div>`;
        return;
    }

    filtered.forEach(p => {
        box.innerHTML += `
            <div onclick="selectProduct('${p.title}')" class="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 border-b border-gray-50 text-sm">
                <div><strong>${p.title}</strong> - ৳${p.price}</div>
            </div>
        `;
    });
}

function selectProduct(title) {
    document.getElementById('searchInput').value = title;
    const filtered = products.filter(p => p.title === title);
    displayProducts(filtered);
}

// ৫. কার্ট লজিক
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const itemInCart = cart.find(item => item.id === id);

    if (itemInCart) {
        itemInCart.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateTotal();
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    
    cartCount.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center text-sm">কার্ট খালি আছে</p>';
        return;
    }

    cartItems.innerHTML = '';
    cart.forEach(item => {
        cartItems.innerHTML += `
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                <div>
                    <p class="font-bold">${item.title}</p>
                    <p class="text-gray-500">৳${item.price} x ${item.qty}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 text-sm"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateTotal();
}

function updateTotal() {
    updateCartUI();
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shipping = cart.length > 0 ? parseInt(document.getElementById('deliveryZone').value) : 0;
    const grandTotal = subTotal + shipping;

    document.getElementById('subTotal').innerText = `৳${subTotal}`;
    document.getElementById('shippingCost').innerText = `৳${shipping}`;
    document.getElementById('grandTotal').innerText = `৳${grandTotal}`;
}

function setPayment(method) {
    selectedPayment = method;
    const txField = document.getElementById('txIdField');
    if (method === 'COD') {
        txField.style.display = 'none';
    } else {
        txField.style.display = 'block';
    }
}

// ৬. অর্ডার সরাসরি Supabase-এ পাঠানো
async function placeOrder(e) {
    e.preventDefault();
    if(cart.length === 0) { alert('আপনার কার্ট খালি!'); return; }

    const itemDetails = cart.map(item => `${item.title} (পরিমাণ: ${item.qty}টি)`).join(", ");

    const orderData = {
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value,
        payment_method: selectedPayment,
        txid: document.getElementById('custTxID').value || 'N/A',
        items: itemDetails,
        total_bill: document.getElementById('grandTotal').innerText,
        status: 'Pending'
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert(`ধন্যবাদ ${orderData.name}! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।`);
            cart = [];
            document.getElementById('orderForm').reset();
            updateTotal();
        } else {
            alert("দুঃখিত, অর্ডার সম্পন্ন করা যায়নি।");
        }
    } catch (error) {
        console.error("অর্ডার সমস্যা:", error);
    }
}

window.onload = () => fetchProducts();
