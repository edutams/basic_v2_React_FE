export const makePayment = async (data, hash = null) => {
    const gatewayCode = (data[0]?.gateway_code || '').toLowerCase();
    switch (gatewayCode) {
        case 'skoolpay':
            await skoolpay(data);
            break;
        case 'xpress_pay':
        case 'xpresspay':
            await xpress_pay(data, hash);
            break;
        default:
            await skoolpay(data);
    }
};

const skoolpay = async (data) => {
    const items = data.map((d, i) => ({
        [`split_items[${i}][item_description]`]: d.paymentname?.name,
        [`split_items[${i}][item_amount]`]: d.instValue,
        [`split_items[${i}][item_revenue_code]`]: d.paymentname?.rev_code,
    }));

    const params = new URLSearchParams();
    params.append('transaction_id', data[0].bulk_orderid);
    params.append('public_key', data[0].pub_key);
    params.append('merchant_code', data[0].merchant_id);
    params.append('fee_bearer', data[0].fee_bearer);
    params.append('customer[unique_id]', data[0].admin_email);
    params.append('customer[first_name]', data[0].fname);
    params.append('customer[last_name]', data[0].lname);
    params.append('customer[middle_name]', data[0].lname);
    params.append('customer[email]', data[0].admin_email);
    params.append('customer[phone]', data[0].admin_phone || '');
    params.append('hash_type', 'sha256');
    params.append('hash', data[0].hash || '');
    params.append('callback_url', `${window.location.origin}/bursary/confirm/cardpay?transref=${data[0].bulk_orderid}&user_id=${data[0].user_id}`);

    // Append split items
    items.forEach((item) => {
        Object.entries(item).forEach(([key, val]) => params.append(key, val));
    });

    const url = `https://live.skoolpay.ng/init?${params.toString()}`;
    // console.log('Opening SkoolPay URL:', url);

    // Open in popup like V1 does
    window.open(url, '_blank', 'width=600,height=700,scrollbars=yes');
};

const xpress_pay = async (data, hash) => {
    const body = {
        publicKey: data[0].pub_key,
        transactionId: data[0].bulk_orderid || data[0].bulk_order_id,
        amount: data[0].instValue,
        currency: 'NGN',
        country: 'NG',
        email: data[0].admin_email,
        phoneNumber: data[0].admin_phone,
        firstName: data[0].fname,
        lastName: data[0].lname,
        hash,
        callbackUrl: `${window.location.origin}/bursary/confirm/cardpay?transref=${data[0].bulk_orderid}&user_id=${data[0].user_id}`,
    };

    if (window.xpressPayonlineSetup) {
        window.xpressPayonlineSetup(body);
    } else {
        console.error('XpressPay SDK not loaded');
    }
};



// export const makePayment = (data, hash = null) => {
//     const gatewayCode = data[0]?.gateway_code;

//     switch (gatewayCode.toLowerCase()) {
//         case 'skoolpay':
//             skoolpay(data);
//             break;

//         case 'xpress_pay':
//         case 'xpresspay':
//             xpress_pay(data, hash);
//             break;

//         default:
//             skoolpay(data); // fallback
//     }
// };

// const skoolpay = (data) => {
//     let items = [];

//     data.forEach((d) => {
//         items.push({
//             item_description: d.paymentname?.name || d.description,
//             item_amount: d.instValue,
//             item_revenue_code: d.paymentname?.rev_code || '',
//         });
//     });

//     const options = {
//         transaction_id: data[0].bulk_orderid || data[0].bulk_order_id,
//         public_key: data[0].pub_key,
//         merchant_code: data[0].merchant_id,
//         customer: {
//             unique_id: data[0].admin_email,
//             first_name: data[0].fname,
//             last_name: data[0].lname,
//             email: data[0].admin_email,
//             phone: data[0].admin_phone,
//         },
//         split_items: items,
//         callback_url: `${window.location.origin}/bursary/confirm/cardpay?transref=${data[0].bulk_orderid}&user_id=${data[0].user_id}`,
//         onSuccess: (response) => {
//             console.log("SkoolPay Success:", response);
//             // You can call your confirmation endpoint here if needed
//             window.location.href = `/bursary/confirm/cardpay?transref=${response.data.transactionReference}&user_id=${data[0].user_id}`;
//         },
//         onClose: () => console.log("SkoolPay closed"),
//         onError: (error) => console.error("SkoolPay Error:", error),
//     };

//     // Assuming SkoolPay script is loaded globally
//     if (window.SkoolPay) {
//         const skoolPay = new window.SkoolPay(options);
//         skoolPay.init();
//     } else {
//         console.error("SkoolPay SDK not loaded");
//     }
// };

// const xpress_pay = (data, hash) => {
//     const body = {
//         publicKey: data[0].pub_key,
//         transactionId: data[0].bulk_orderid || data[0].bulk_order_id,
//         amount: data[0].instValue,
//         currency: "NGN",
//         country: "NG",
//         email: data[0].admin_email,
//         phoneNumber: data[0].admin_phone,
//         firstName: data[0].fname,
//         lastName: data[0].lname,
//         hash: hash,
//         callbackUrl: `${window.location.origin}/bursary/confirm/cardpay?transref=${data[0].bulk_orderid}&user_id=${data[0].user_id}`,
//     };

//     if (window.xpressPayonlineSetup) {
//         window.xpressPayonlineSetup(body);
//     } else {
//         console.error("XpressPay SDK not loaded");
//     }
// };