import { useEffect } from "react";
import LoadingPanel from "./LoadingPanel"
import { useNavigate } from "react-router-dom";

export default function MainPanel() {
	let navigate = useNavigate();
	
	useEffect(() => {
		navigate("/settings");
	});

	return (
		<LoadingPanel/>
	);
}