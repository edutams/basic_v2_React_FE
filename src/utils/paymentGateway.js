export const makePayment = (data, hash = null) => {
    const gatewayCode = data[0]?.gateway_code;

    switch (gatewayCode.toLowerCase()) {
        case 'skoolpay':
            skoolpay(data);
            break;

        case 'xpress_pay':
        case 'xpresspay':
            xpress_pay(data, hash);
            break;

        default:
            skoolpay(data); // fallback
    }
};

const skoolpay = (data) => {
    let items = [];

    data.forEach((d) => {
        items.push({
            item_description: d.paymentname?.name,
            item_amount: d.instValue,
            item_revenue_code: d.paymentname?.rev_code,
        });
    });

    const options = {
        transaction_id: data[0].bulk_orderid,
        public_key: data[0].pub_key,
        merchant_code: data[0].merchant_id,
        fee_bearer: data[0].fee_bearer,
        customer: {
            unique_id: data[0].admin_email,
            first_name: data[0].fname,
            last_name: data[0].lname,
            middle_name: data[0].lname,
            email: data[0].admin_email,
            phone: data[0].admin_phone,
        },
        split_items: items,
        hash_type: "sha256",
        hash: data[0].hash,
        callback_url: "https://my_callback_url.test",
        onSuccess: (response) => {
            console.log("SkoolPay Success:", response);
            // You can call your confirmation endpoint here if needed
            window.location.href = `/bursary/confirm/cardpay?transref=${response.data.transactionReference}&user_id=${data[0].user_id}`;
        },
        onClose: () => console.log("SkoolPay closed"),
        onError: (error) => console.error("SkoolPay Error:", error),
    };

    // Assuming SkoolPay script is loaded globally
    if (window.SkoolPay) {
        const skoolPay = new window.SkoolPay(options);
        skoolPay.init();
    } else {
        console.error("SkoolPay SDK not loaded");
    }
};

const xpress_pay = (data, hash) => {
    const body = {
        publicKey: data[0].pub_key,
        transactionId: data[0].bulk_orderid || data[0].bulk_order_id,
        amount: data[0].instValue,
        currency: "NGN",
        country: "NG",
        email: data[0].admin_email,
        phoneNumber: data[0].admin_phone,
        firstName: data[0].fname,
        lastName: data[0].lname,
        hash: hash,
        callbackUrl: `${window.location.origin}/bursary/confirm/cardpay?transref=${data[0].bulk_orderid}&user_id=${data[0].user_id}`,
    };

    if (window.xpressPayonlineSetup) {
        window.xpressPayonlineSetup(body);
    } else {
        console.error("XpressPay SDK not loaded");
    }
};