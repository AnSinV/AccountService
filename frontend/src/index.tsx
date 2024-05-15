import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import fingerprint from "@fingerprintjs/fingerprintjs";
import UAParser from 'ua-parser-js';
import Cookies from 'js-cookie';
import { BrowserRouter } from "react-router-dom";

import "./styles/index.css";
import "./styles/smallLoader.css";
import { Provider } from 'react-redux';
import store from './store/index';

fingerprint.load().then(async (fpAgent) => {
	let fp = await fpAgent.get();

	let ua = new UAParser();
	let deviceFingerprint = `${fp.visitorId}|${ua.getOS().name}-${ua.getOS().version}|${ua.getBrowser().name}-${ua.getBrowser().version}|${ua.getCPU().architecture}|${ua.getOS().name}-${ua.getOS().version}|${window.screen.colorDepth}|${window.screen.width}x${window.screen.height}`;

	Cookies.set(
		"USR_DEV_FPR",
		deviceFingerprint,
	);
});

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<React.StrictMode>
		<Provider store={ store }>
			<BrowserRouter>
				<App/>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);
