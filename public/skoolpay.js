class SkoolPay {
    constructor(options) {
        this.options = options;
        this.iframes = [];
        this.spinner = null;
    }

    // Helper method to serialize object to URL parameters
    serialize(obj) {
        return new URLSearchParams(Object.entries(obj)).toString();
    }

    // Method to create and append iframe to DOM
    createIframe(src, cssText, parent) {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("frameBorder", "0");
        iframe.setAttribute("allow", "camera; microphone")
        iframe.setAttribute("allowtransparency", "true");
        iframe.style.cssText = cssText;
        iframe.id = iframe.name = this.options.id;
        iframe.src = src;
        parent.appendChild(iframe);
        iframe.onload = () => {
            this.spinner.style.display = "none";
        };
        return iframe;
    }

    // Method to validate options
    isValid() {
        // Implement your validation logic here
        // Ensure required options like request_id, public_key etc. are present
        return true; // Replace with your validation logic
    }

    // Method to handle close event
    handleCloseEvent(event) {
        const data = event.data;
        // console.log("handle close", data.status);
        if (data.status == "SkoolPayReady") {
            console.log("SkoolPay is ready to procees Transaction");
            this.options.onReady();
        }

        if (data.status == "SkoolPaySuccess") {
            this.options.onSuccess(data);
            this.iframes.forEach((iframe) => {
                iframe.parentNode.removeChild(iframe);
            })
            this.iframes = [];

            // 			const callbackUrl = this.options.callback_url;
            //               if (callbackUrl) {
            //                 // Redirect to callback URL with data if successful
            //                 window.location.href = `${callbackUrl}?${this.serialize(data)}`;
            //               }
        }

        if (data.status == "SkoolPayClosed") {
            this.options.onClose();
            this.iframes.forEach((iframe) => {
                iframe.parentNode.removeChild(iframe);
            })
            this.iframes = [];
        }

        if (data.status == "SkoolPayError") {
            console.log("SkoolPay has error ");
            this.options.onError(data);
            this.iframes.forEach((iframe) => {
                iframe.parentNode.removeChild(iframe);
            })
            this.iframes = [];
        }
    }

    // Method to open the iframe
    open() {
        this.iframes.forEach((iframe) => {
            if (iframe && iframe.src) {
                iframe.style.display = "block";
                iframe.style.visibility = "visible";
                document.body.style.overflow = "hidden";
            }
        });
    }

    extractUrlParameterFromRequest() {
        const objectWithoutMethods = Object.fromEntries(
            Object.entries(this.options).filter(
                ([key]) => typeof this.options[key] !== "function"
            )
        );
        const urlSearchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(objectWithoutMethods)) {
            if (typeof value === "object" && Array.isArray(value)) {
                // Handle nested array (e.g., split_item)
                for (const [index, itemObject] of value.entries()) {
                    for (const [nestedKey, nestedValue] of Object.entries(
                        itemObject
                    )) {
                        urlSearchParams.append(
                            `${key}[${index}][${nestedKey}]`,
                            nestedValue
                        );
                    }
                }
            } else if (typeof value === "object") {
                // Handle nested object (e.g., customer)
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    urlSearchParams.append(`${key}[${nestedKey}]`, nestedValue);
                }
            } else {
                urlSearchParams.append(key, value);
            }
        }

        return urlSearchParams.toString();
    }
    // Method to initialize OlevelVerify
    init() {
        if (!this.isValid()) {
            return;
        }
        // console.log("Oya look away", this.optionsWithoutMethod());

        // const defaults = this.optionsWithoutMethod();
        const cssText =
            "z-index: 2147483647; display: none; ...; position: fixed; left: 0; top: 0; width: 100%; height: 100%;";

        const src =
            "https://live.skoolpay.ng/init?" +
            this.extractUrlParameterFromRequest(); //this.serialize(defaults);

        // setTimeout(function () {
        // window.location.href = src;
        // }, 5000);

        // Create and append spinner
        // Create spinner CSS
        this.customCSS = document.createElement("style");
        this.customCSS.innerHTML =
            ".cssloader{z-index: 2147483647;position:fixed;width:100%;height:100%;background:rgba(0,0,0,0.75);display:table;top:0px;left:0px}.cssload-container{width:100%;height:30px;text-align:center;display:table-cell;vertical-align:middle}.pulsating-image {width: 150px; animation: pulse 1s infinite;}@keyframes pulse {0% {opacity: 0.5;width: 150px;}50% {opacity: 1;width: 200px;}100% {opacity: 0.5;width: 150px;}}";
        document.body.appendChild(this.customCSS);

        // Create spinner element
        this.spinner = document.createElement("div");
        this.spinner.setAttribute("class", "cssloader");
        this.spinner.innerHTML =
            '<div class="cssload-container"><img src="https://skoolpay.ng/assets/images/skoolpay/skoolpaylogo_rebrand.png" alt="Loading" class="pulsating-image"></div></div>';
        document.body.appendChild(this.spinner);

        // Create and append iframe to DOM
        // this.iframe = this.createIframe(src, cssText, document.body);

        // // Hide spinner when iframe is loaded
        // this.iframe.onload = () => {
        // 	this.loader.style.display = "none";
        // };

        // Create iframe and handle loading
        const iframe = this.createIframe(src, cssText, document.body);
        this.iframes = [];
        this.iframes.push(iframe);

        window.addEventListener("message", this.handleCloseEvent.bind(this), false);

        this.open(); // Call open method to display the iframe
    }
}

window.SkoolPay = SkoolPay;