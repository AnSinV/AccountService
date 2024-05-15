import { useState } from "react";
import InputField from "../InputField";
import ButtonWithLoader from "../ButtonWithLoader";
import { useDispatch } from "react-redux";
import { BaseResponse, ChangeEmailRequest } from "../../types";
import axios from "../../axios";
import { openModal } from "../../store/modalSlice";

export default function EmailsSettings() {
	let [ emailWarn, updEmailWarn ] = useState("");
	let [ email, updateEmail ] = useState("");
	let [ submitted, updSubmitted ] = useState(false);

	let dispatch = useDispatch();

	async function handleSubmit() {
		updEmailWarn("");

		let warn = "";
		if (!email.length) {
			warn = "Please, enter your email";
		}
		else if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email))) {
			warn = "This email is invalid. Please, check if you wrote it right";
		}

		if (warn !== "") {
			updEmailWarn(warn);
			return;
		}

		await changeEmail();
	}

	async function changeEmail() {
		updSubmitted(true);

		let requestData: ChangeEmailRequest = {
			newEmail: email,
		};

		try {
			let response = await axios.post(
				"/api/account/changeEmail",
				requestData,
				{
					headers: {
						"Content-type": "application/json; charset=UTF-8"
					}
				}
			);

			let emailChangedResponse = response.data as BaseResponse;

			if (!emailChangedResponse.isError) {
				dispatch(
					openModal(
						{
							isError: false,
							showCloseBtn: true,
							modalHeader: "Password changed!",
							modalMessage: "",
						}
					)
				);
			}
			else {
				dispatch(
					openModal(
						{
							isError: false,
							showCloseBtn: true,
							modalHeader: "Error!",
							modalMessage: emailChangedResponse.message,
						}
					)
				);
			}
		} catch(err) {

		} finally {
			updSubmitted(false);
		}
	}

	return (
		<div className="flex flex-col w-full p-5">
			<h3 className="flex-row text-xl">Email and phone settings</h3>
			<div className="border-solid border-t-2 border-gray-500 mb-5"></div>

			<div className="flex-row ml-3">
				<h4 className="flex flex-row text-md">Change email</h4>
				<div className="flex-row border-solid border-t-2 border-gray-300  mb-3"></div>

				<InputField
					type="text"
					value={ email }
					updateVal={ updateEmail }
					clearWarn={ updEmailWarn }
					fontBold={ false }
					fontSize="text-md"
					labelText="New email:"
					inputPlaceholder="Email..."
					inputId="newNickname"
					maxLength={ 64 }
					warningText={ emailWarn }
				/>

				<ButtonWithLoader 
					text="Change email"
					textColor="text-white"
					color="bg-lime-600"
					colorHovered="hover:bg-lime-700"
					colorClicked="active:bg-lime-800"
					width="h-12"
					height="w-40"
					isSubmitted={ submitted }
					handleSubmit={ handleSubmit }
				/>
			</div>
		</div>
	);
}