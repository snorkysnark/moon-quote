import Toastify from "toastify-js";

export function toast(message: string) {
    Toastify({
        text: message,
        gravity: "bottom",
    }).showToast();
}
