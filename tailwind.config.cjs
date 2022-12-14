/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            gridTemplateColumns: {
                "fit-40": "repeat(auto-fit, 10rem)",
            },
            flex: {
                "grow-auto": "1 0 auto",
            },
        },
    },
    plugins: [],
};
