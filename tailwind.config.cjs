/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,svelte}"],
    theme: {
        extend: {
            gridTemplateColumns: {
                "fit-40": "repeat(auto-fit, 10rem)",
            },
        },
    },
    plugins: [],
};
