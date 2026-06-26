function skoolpay(data) {
    let items = []
    data.forEach(d => {
        var person = {
            item_description: d['paymentname']['name'],
            item_amount: d['instValue'],
            item_revenue_code: d['paymentname']['rev_code'],
        }
        items.push(person);
    });

    const myOptions = {
        transaction_id: data[0]['bulk_orderid'], // Replace with your unique request ID
        public_key: data[0]["pub_key"], //MzA2MTlhMTlmNjNmNTQ5NGVhMjkyY2Vk Replace with your OlevelVerify public key
        merchant_code: data[0]["merchant_id"], //SP13760254 Replace with your SkoolPay app code (optional)
        fee_bearer: data[0]['fee_bearer'],
        customer: {
            unique_id: data[0]['admin_email'],
            first_name: data[0]['fname'],
            last_name: data[0]['lname'],
            middle_name: data[0]['lname'],
            email: data[0]['admin_email'],
            phone: data[0]['admin_phone'],
        },
        split_items: items,
        callback_url: "https://my_callback_url.test",
        hash_type: "sha256",
        hash: "bec7cf8e7b43efe53ff87ea42ad52f6262e7639a8ee003cf32d3623c391add5e",
        onSuccess: (response) => {
            console.log("Payment successful! Reference:", response);
            axios
                .get("/bursary/confirm/cardpay?transref=" + response.data.transactionReference + "&user_id=" + data[0]['user_id'])
                .then((response) => {
                    eventBus.$emit("PaymentSuccess", { data: response });
                })
                .catch((error) => {
                    eventBus.$emit("PaymentFailed", { data: error });
                });
        },
        onClose: () => {
            console.log("SkoolPay closed");
        },
        onReady: () => {
            console.log("Edutams Pay Initiated");
        },
        onError: (error) => {
            console.log("Edutams Pay has Error", error);
        },
    };

    const skoolPay = new SkoolPay(myOptions);
    skoolPay.init();
}


function xpress_pay(data, hash) {

    const publicKey = data[0]['pub_key']; //'XPPUBK-08a28e12b1687744ff075578f80fcd92-X' //;

    const transactionId = data[0]['bulk_orderid'];
    const userId = data[0]['user_id'];
    var email = data[0]['admin_email'];
    const body = {
        "publicKey": publicKey,
        "logoURL": "https://api.elasticemail.com/userfile/5d028e25-bd86-4559-b7c2-31e5870bbbf9/accessnew.jpg",
        "transactionId": transactionId,
        "amount": data[0]['instValue'],
        "currency": "NGN",
        "country": "NG",
        "email": email,
        "phoneNumber": data[0]['admin_phone'],
        "firstName": data[0]['fname'],
        "lastName": data[0]['lname'],
        "hash": hash,
        "callbackUrl": data[0]['base_url'] + "/bursary/confirm/cardpay?transref=" + transactionId + "&user_id=" + userId

    };
    // console.log(body);
    xpressPayonlineSetup(body);
}

module.exports = { skoolpay, xpress_pay }
