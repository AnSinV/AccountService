import { useState } from "react";
import InputField from "./InputField";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { sha512 } from "sha512-crypt-ts";
import { UserInfo, logInRequest } from "../types";
import axios from "../axios";
import ButtonWithLoader from "./ButtonWithLoader";
import { AxiosError } from "axios";
import { closeModal, openModal } from "../store/modalSlice";
import { useDispatch } from "react-redux";

export default function LogInPanel() { 
	let [ emailWarn, updEmailWarn ] = useState("");
	let [ passwordWarn, updPasswordWarn ] = useState("");

	let [ email, updEmail ] = useState("");
	let [ password, updPassword ] = useState("");

	let [ submitted, updSubmitted ] = useState(false);

	let [ searchParams ] = useSearchParams();

	let navigate = useNavigate();
	let dispatch = useDispatch();

	async function handleSubmit() {
		if (submitted) {
			return;
		}

		let flag = false;

		if (!email.length) {
			updEmailWarn("Please, enter your email");
			flag = true;
		}
		else if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email))) {
			updEmailWarn("This email is invalid. Please, check if you wrote it right");
			flag = true;
		}

		if (!password.length) {
			updPasswordWarn("Please, enter your password");
			flag = true;
		}
		else if (password.length < 8) {
			updPasswordWarn("Your password is too short. It must be at least 8 symbols");
			flag = true;
		}

		if (flag) {
			return;
		}

		await logIn();
	}

	async function logIn() {
		updSubmitted(true);

		let pwdHash = sha512.hex(password);

		let authData: logInRequest = {
			email: email,
			pwdHash: pwdHash,
		}

		try {
			let response = await axios.post(
				"/api/auth/logIn",
				authData,
				{
					headers: {
						"Content-type": "application/json; charset=UTF-8"
					}
				}
			);

			let authResponseData = response.data as UserInfo;

			localStorage.setItem("userData", JSON.stringify(authResponseData));

			dispatch(openModal({
				isError: false,
				showCloseBtn: false,
				modalHeader: "You are now logged in!",
				modalMessage: ""
			}));

			updSubmitted(false);
			let timeoutId = setTimeout(() => {
				clearTimeout(timeoutId);
				dispatch(closeModal());

				let redirectUrl = searchParams.get("from");
				if (redirectUrl === null) {
					navigate("/settings");
				}
				else {
					window.location.href = decodeURIComponent(redirectUrl);
				}
			}, 1000);
		} catch (error) {
			updSubmitted(false);

			if (error instanceof AxiosError) {
				if (error.response !== undefined) {
					let errorData = error.response?.data;
					if ("message" in errorData) {
						dispatch(openModal({
							isError: true,
							showCloseBtn: true,
							modalHeader: "Error!",
							modalMessage: errorData.message
						}));

						return;
					}
				}

				if (error.code === "ERR_NETWORK") {
					dispatch(openModal({
						isError: true,
						showCloseBtn: true,
						modalHeader: "Error!",
						modalMessage: "Seems that you aren't connected to the network or server is down :("
					}));

					return;
				}
			}
		}
	}

	return (
		<div className="flex flex-col items-center w-128">
			<p className="font-black text-2xl my-5">Log In</p>

			<InputField
				type="email"
				value={ email }
				updateVal={ updEmail }
				clearWarn={ updEmailWarn }
				fontBold
				fontSize="text-sm"
				labelText="Your email:"
				inputPlaceholder="Email..."
				maxLength={ 256 }
				inputId="email"
				warningText={ emailWarn }
			/>

			<InputField 
				type="password"
				value={ password }
				updateVal={ updPassword }
				clearWarn={ updPasswordWarn }
				fontBold
				fontSize="text-sm"
				labelText="Your password:"
				inputPlaceholder="Password..."
				inputId="password"
				warningText={ passwordWarn }
			/>

			<ButtonWithLoader 
				text="Log In"
				textColor="text-white"
				color="bg-lime-600"
				colorHovered="hover:bg-lime-700"
				colorClicked="active:bg-lime-800"
				width="h-12"
				height="w-40"
				isSubmitted={ submitted }
				handleSubmit={ handleSubmit }
			/>

			<Link to="/signUp" className="my-3 text-blue-500 hover:text-blue-700 active:text-blue-900">I don't have an account yet</Link>
		</div>
	)
}