import axios from "../axios";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { FaKey } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import ButtonWithLoader from "./ButtonWithLoader";
import { AxiosError } from "axios";


export default function SettingsPanel() {
	let [ selectedElement, updSelectedElm ] = useState("acc");
	let [ submitted, updSubmitted ] = useState(false);

	let navigate = useNavigate();

	const location = useLocation();
	useEffect(() => {
		let val = "";
		if (location.pathname === "/settings/security") {
			val = "sec";
		}
		else if (location.pathname === "/settings/account") {
			val = "acc";
		}
		else if (location.pathname === "/settings/emails") {
			val = "email";
		}

		updSelectedElm(val);
	}, [location]);

	useEffect(() => {
		/*let sessionId = Cookies.get("sessionId");
		if (sessionId === undefined) {
			navigate("/logIn");
			return;
		}

		let userData = localStorage.getItem("userData");
		if (userData === null) {
			navigate("/logIn");
			return;
		}

		let userDataJson = JSON.parse(userData);
		if (userDataJson["id"] === undefined) {
			localStorage.removeItem("usrDat");
			navigate("/logIn");
			return;
		}

		const fetchUserData = async () => {
			try {
				let response = await axios.get(
					`/api/accounts/userInfo`,
					{
						params: {
							userId: userDataJson["id"]
						},
						withCredentials: true
					}
				);

				let userAccountInfo = response.data as userInfo;
				localStorage.setItem("usrDat", JSON.stringify(userAccountInfo))

			} catch (e) {
				console.log(e);
			}
		}

		fetchUserData(); 
		*/
	});

	async function logOut() {
		updSubmitted(true);

		try {
			await axios.get(
				"/api/auth/logOut",
				{
					withCredentials: true
				}
			);

			localStorage.removeItem("userData");

			updSubmitted(false);
			navigate("/logIn");
		} catch(error) {
			updSubmitted(false);
			if (error instanceof AxiosError) {
				console.log(error);
				return;
			}
		}	
	}

	return (
		<div className="flex flex-row w-256 h-128">
			<div className="flex flex-col w-1/4 items-center bg-gray-600 rounded-l-lg">
				<div className={`flex flex-row items-center justify-center py-3 w-full rounded-tl-lg duration-300 hover:cursor-pointer ${ selectedElement === "acc" ? "bg-gray-700" : "hover:bg-gray-700" }`}
					onClick={
						() => {
							navigate("/settings/account")
						}
					}
				>
					<div className="flex-col">
						<IoMdPerson className="text-white mr-2"/>
					</div>
					<div className="flex-col text-white">
						Account settings
					</div>
				</div>

				<div className={`flex flex-row items-center justify-center py-3 w-full duration-300 hover:cursor-pointer ${ selectedElement === "email" ? "bg-gray-700" : "hover:bg-gray-700" }`}
					onClick={
						() => {
							navigate("/settings/emails")
						}
					}
				>
					<div className="flex-col">
						<MdEmail className="text-white mr-2"/>
					</div>
					<div className="flex-col text-white">
						Emails and phone
					</div>
				</div>

				<div className={`flex flex-row items-center justify-center py-3 w-full duration-300 hover:cursor-pointer ${ selectedElement === "sec" ? "bg-gray-700" : "hover:bg-gray-700" }`}
					onClick={
						() => {
							navigate("/settings/security")
						}
					}
				>
					<div className="flex-col">
						<FaKey className="text-white mr-2"/>
					</div>
					<div className="flex-col text-white">
						Security and authentication
					</div>
				</div>

				<div className="flex flex-row items-end justify-center py-3 flex-grow">
					<ButtonWithLoader 
						text="Log out"
						textColor="text-white"
						color="bg-red-600"
						colorHovered="hover:bg-red-700"
						colorClicked="active:bg-red-800"
						width="h-12"
						height="w-40"
						isSubmitted={ submitted }
						handleSubmit={ logOut }
					/>
				</div>
			</div>
			<div className="flex-col w-3/4 overflow-y-auto">
				<Outlet/>
			</div>
		</div>
	);
}