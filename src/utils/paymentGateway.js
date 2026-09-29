// `onConfirm` lets a caller override what happens after the gateway itself
// reports success — bursary/admission card payments confirm against their
// own endpoint by default, but subscriptions must confirm against the
// subscription transaction instead (see SubscriptionPaymentModal.jsx /
// SubscriptionBulkPaymentModal.jsx), or they'd otherwise silently mark the
// wrong record paid.
export const makePayment = (data, hash = null, { onConfirm } = {}) => {
    const gatewayCode = data[0]?.gateway_code || '';

    switch (gatewayCode.toLowerCase()) {
        case 'skoolpay':
            skoolpay(data, onConfirm);
            break;

        case 'xpress_pay':
        case 'xpresspay':
            xpress_pay(data, hash);
            break;

        default:
            skoolpay(data, onConfirm); // fallback
    }
};

const defaultConfirm = async (transref, userId) => {
    const { confirmCardPayment } = await import('@/api/tenant/bursary/bursaryPayment');
    await confirmCardPayment(transref, userId);
};

const skoolpay = (data, onConfirm) => {
    let items = [];

    data.forEach((d) => {
        items.push({
            item_description: d.paymentname?.name,
            item_amount: d.instValue,
            item_revenue_code: d.paymentname?.rev_code,
        });
    });

    const confirm = onConfirm || defaultConfirm;

    const options = {
        transaction_id: data[0].bulk_order_id,
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
        onSuccess: async (response) => {
            console.log("SkoolPay Success:", response);
            try {
                // Same reference bursary's own (working) confirm flow uses —
                // SkoolPay is expected to echo back exactly the id we sent
                // as transaction_id above, but trust what SkoolPay itself
                // reports rather than assuming it always matches; only fall
                // back to our own id if the field is ever missing. Verified
                // against a real response — transactionReference sits at
                // the top level ({status, message, transactionReference}),
                // not nested under .data, though a nested shape has shown
                // up elsewhere in this codebase, so check both.
                const transref = response?.transactionReference || response?.data?.transactionReference || data[0].bulk_order_id;
                await confirm(transref, data[0].user_id);
                window.dispatchEvent(new CustomEvent('paymentCompleted', {
                    detail: { user_id: data[0].user_id }
                }));
            } catch (err) {
                console.error('Payment confirmation failed:', err);
            }
        },
        onClose: () => console.log("SkoolPay closed"),
        onError: (error) => console.error("SkoolPay Error:", error),
    };
    // Guard against the SkoolPay SDK not being ready yet (e.g. the external
    // script is still loading/slow) instead of throwing and looking like the
    // page has frozen with no feedback to the user.
    if (typeof window.SkoolPay !== 'function') {
        console.error('SkoolPay SDK not loaded');
        throw new Error('Payment gateway is still loading. Please try again in a moment.');
    }

    const skoolPay = new window.SkoolPay(options);
    skoolPay.init();
};

const xpress_pay = (data, hash) => {
    const body = {
        publicKey: data[0].pub_key,
        transactionId: data[0].bulk_order_id,
        amount: data[0].instValue,
        currency: "NGN",
        country: "NG",
        email: data[0].admin_email,
        phoneNumber: data[0].admin_phone,
        firstName: data[0].fname,
        lastName: data[0].lname,
        hash: hash,
        callbackUrl: `${window.location.origin}/bursary/confirm/cardpay?transref=${data[0].bulk_order_id}&user_id=${data[0].user_id}`,
    };

    if (window.xpressPayonlineSetup) {
        window.xpressPayonlineSetup(body);
    } else {
        console.error("XpressPay SDK not loaded");
    }
};
