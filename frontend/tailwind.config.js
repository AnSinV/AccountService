const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		flowbite.content()
	],
	theme: {
		extend: {
			width: {
				'128': '32rem',
				'256': "64rem"
			},
			height: {
				'128': '32rem'
			}
		},
	},
	plugins: [
		flowbite.plugin()
	],
}
