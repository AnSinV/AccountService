import { useEffect } from "react";
import PanelContainer from "./components/PanelContainer";
import axios, { setupResponseInterceptor } from "./axios";
import MessageModal from "./components/MessageModal";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

async function updateUserOnline() {
	axios
		.get("/api/sessions/updOnline")
		.catch(async () => {});
}

export default function App() {
	updateUserOnline();

	useEffect(() => {
		const timer = setInterval(async () => {
			await updateUserOnline();
		}, 2000);

		return (() => clearInterval(timer));
	});

	let navigate = useNavigate();
	let dispatch = useDispatch();

	setupResponseInterceptor(navigate, dispatch);

	return (
		<div className="flex flex-col h-full">
			<div className="flex w-screen px-5 py-5 center-items h-full bg-slate-200">
				<PanelContainer/>
			</div>

			<MessageModal/>
		</div>
	);
}
