import { useState } from "react";
import InputField from "./InputField";
import { sha512 } from "sha512-crypt-ts";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserInfo, signUpRequest } from "../types";

import ButtonWithLoader from "./ButtonWithLoader";

import axios from "../axios";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { closeModal, openModal } from "../store/modalSlice";

export default function SignUpPanel() {
	let [ nicknameWarn, updNicknameWarn ] = useState("");
	let [ emailWarn, updEmailWarn ] = useState("");
	let [ passwordWarn, updPasswordWarn ] = useState("");
	let [ passwordConfirmWarn, updPasswordConfirmWarn ] = useState("");

	let [ nickname, updNickname ] = useState("");
	let [ email, updEmail ] = useState("");
	let [ description, updDescription ] = useState("");
	let [ password, updPassword ] = useState("");
	let [ passwordConfirm, updPasswordConfirm ] = useState("");

	let [ submitted, updSubmitted ] = useState(false);

	let [ searchParams ] = useSearchParams();

	let navigate = useNavigate();
	let dispatch = useDispatch();

	async function handleSubmit() {
		if (submitted) {
			return;
		}

		let flag = false;

		if (!nickname.length) {
			updNicknameWarn("Please, enter your nickname");
			flag = true;
		}

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

		if (!passwordConfirm.length) {
			updPasswordConfirmWarn("Please, enter your password");
			flag = true;
		}

		if (password !== passwordConfirm) {
			updPasswordWarn("Password don't match. Please enter them again");
			updPasswordConfirmWarn("Password don't match. Please enter them again");

			flag = true;
		}

		if (flag) {
			return;
		}

		await signUp();
	}

	async function signUp() {
		updSubmitted(true);

		let pwdHash = sha512.hex(passwordConfirm);

		let authData: signUpRequest = {
			nickname: nickname,
			email: email,
			description: description,
			pwdHash: pwdHash,
		};

		try {
			let response = await axios.post(
				"/api/auth/signUp",
				authData,
				{
					headers: {
						"Content-type": "application/json; charset=UTF-8"
					},
					withCredentials: true
				}
			);

			let authResponseData = response.data as UserInfo;
			localStorage.setItem("userData", JSON.stringify(authResponseData));

			updSubmitted(false);

			dispatch(
				openModal(
					{
						isError: false,
						showCloseBtn: false,
						modalHeader: "Account created!",
						modalMessage: "You will be redirected in 3 seconds..."
					}
				)
			);

			let intervalId = setInterval(() => {
				clearInterval(intervalId);
				dispatch(closeModal());

				let redirectUrl = searchParams.get("from");
				if (redirectUrl === null) {
					navigate("/settings");
				}
				else {
					window.location.href = decodeURIComponent(redirectUrl);
				}
			}, 3000);
			
		} catch (error) {
			updSubmitted(false);

			if (error instanceof AxiosError) {
				if (error.response !== undefined) {
					let errorData = error.response?.data;
					if ("message" in errorData) {
						dispatch(
							openModal(
								{
									isError: true,
									showCloseBtn: true,
									modalHeader: "Error!",
									modalMessage: errorData.message
								}
							)
						);

						return;
					}
				}

				if (error.code === "ERR_NETWORK") {
					dispatch(
						openModal(
							{
								isError: true,
								showCloseBtn: true,
								modalHeader: "Error!",
								modalMessage:  "Seems that you aren't connected to the network or server is down :("
							}
						)
					);

					return;
				}
			}

			console.log(error);
		}
	}

	return (
		<div className="flex flex-col items-center w-128">
			<p className="font-black text-2xl mt-5 mb-3">Sign Up</p>

			<InputField
				type="text"
				value={ nickname }
				updateVal={ updNickname }
				clearWarn={ updNicknameWarn }
				fontBold
				fontSize="text-sm"
				labelText="Your nickname:"
				inputPlaceholder="Nickname..."
				maxLength={ 64 }
				inputId="nickname"
				warningText={ nicknameWarn }
			/>

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

			<div className="w-2/3">
				<label className="block text-sm font-bold mx-2" htmlFor="description">
					About you:
				</label>
				<textarea 
					id="description"
					placeholder="Description..."
					className="shadow border rounded py-2 px-3 mt-2 resize-none w-full h-28"
					maxLength={ 512 }
					onChange={ (evt) => { updDescription(evt.target.value); } }
				/>
				<div className="w-full flex flex-row-reverse pb-2 pl-2">
					<span className="text-xs text-right">{ description.length + "/" + 512 }</span>
				</div>
			</div>

			<InputField
				type="password"
				value={ password }
				updateVal={ updPassword }
				clearWarn={ updPasswordWarn }
				fontBold fontSize="text-sm"
				labelText="Password:"
				inputPlaceholder="Enter password..."
				inputId="password"
				warningText={ passwordWarn }
			/>

			<InputField
				type="password"
				value={ passwordConfirm }
				updateVal={ updPasswordConfirm }
				clearWarn={ updPasswordConfirmWarn }
				fontBold
				fontSize="text-sm"
				labelText="Confirm your password:"
				inputPlaceholder="Enter password again..."
				inputId="passwordConfirm"
				warningText={ passwordConfirmWarn }
			/>

			<ButtonWithLoader 
				text="Sign Me Up!"
				textColor="text-white"
				color="bg-lime-600"
				colorHovered="hover:bg-lime-700"
				colorClicked="active:bg-lime-800"
				width="h-12"
				height="w-40"
				isSubmitted={ submitted }
				handleSubmit={ handleSubmit }
			/>

			<Link 
				to="/logIn"
				className="my-3 text-blue-500 hover:text-blue-700 active:text-blue-900"
			>
				I already have an account...
			</Link>
		</div>
	)
}