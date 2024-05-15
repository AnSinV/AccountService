import InputField from "../InputField";
import { useState } from "react";
import ButtonWithLoader from "../ButtonWithLoader";
import { sha512 } from "sha512-crypt-ts";
import { BaseResponse, ChangePasswordRequest } from "../../types";
import axios from "../../axios";
import { useDispatch } from "react-redux";
import { openModal } from "../../store/modalSlice";

export default function SecuritySettings() {
	let [ oldPwdWarn, updOldPwdWarn ] = useState("");
	let [ newPwdWarn, updNewPwdWarn ] = useState("");
	let [ newPwdConfWarn, updNewPwdConfirmWarn ] = useState("");

	let [ submitted, updSubmitted ] = useState(false);
	let [ oldPassword, updateOldPwd ] = useState("");
	let [ newPassword, updateNewPwd ] = useState("");
	let [ newPasswordConfirm, updateNewPwdConfirm ] = useState("");

	let dispatch = useDispatch();

	async function handleSubmit() {
		updOldPwdWarn("");
		updNewPwdWarn("");
		updNewPwdConfirmWarn("");

		let flag = false;

		if (!oldPassword.length) {
			updOldPwdWarn("Please, enter your password");
			flag = true;
		}
		else if (oldPassword.length < 8) {
			updOldPwdWarn("Your password is too short. It must be at least 8 symbols");
			flag = true;
		}

		if (!newPassword.length) {
			updNewPwdWarn("Please, enter your password");
			flag = true;
		}
		else if (newPassword.length < 8) {
			updNewPwdWarn("Your password is too short. It must be at least 8 symbols");
			flag = true;
		}

		if (!newPasswordConfirm.length) {
			updNewPwdConfirmWarn("Please, enter your password");
			flag = true;
		}
		else if (newPasswordConfirm.length < 8) {
			updNewPwdConfirmWarn("Your password is too short. It must be at least 8 symbols");
			flag = true;
		}

		if (newPassword.length > 8 && newPasswordConfirm.length > 8 && newPassword !== newPasswordConfirm) {
			updNewPwdWarn("Passwords doesn't match");
			updNewPwdConfirmWarn("Passwords doesn't match");
			flag = true;
		}

		if (flag) {
			return;
		}

		await changePassword();
	}

	async function changePassword() {
		if (submitted) {
			return;
		}

		updSubmitted(true);

		let oldPasswordHash = sha512.hex(oldPassword);
		let newPasswordHash = sha512.hex(newPasswordConfirm);
		
		let requestData: ChangePasswordRequest = {
			oldPwdHash: oldPasswordHash,
			newPwdHash: newPasswordHash,
			endAllSessions: false,
		};

		try {
			let response = await axios.post(
				"/api/account/changePassword",
				requestData,
				{
					headers: {
						"Content-type": "application/json; charset=UTF-8"
					}
				}
			);

			let pwdChangedResponse: BaseResponse = response.data as BaseResponse;
			
			if (!pwdChangedResponse.isError) {
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
							isError: true,
							showCloseBtn: true,
							modalHeader: "Error!",
							modalMessage: pwdChangedResponse.message,
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
			<h3 className="flex-row text-xl">Security and authentication</h3>
			<div className="border-solid border-t-2 border-gray-500 mb-5"></div>

			<div className="flex-row ml-3">
				<h4 className="flex flex-row text-md">Change password</h4>
				<div className="flex-row border-solid border-t-2 border-gray-300  mb-3"></div>
			
				<InputField 
					type="password"
					value={ oldPassword }
					updateVal={ updateOldPwd }
					clearWarn={ updOldPwdWarn }
					fontBold={ false }
					fontSize="text-md"
					labelText="Old password:"
					inputPlaceholder=""
					inputId="oldPassword"
					warningText={ oldPwdWarn }
				/>

				<InputField
					type="password"
					fontBold={ false }
					value={ newPassword }
					updateVal={ updateNewPwd }
					clearWarn={ updNewPwdWarn }
					fontSize="text-md"
					labelText="New password:"
					inputPlaceholder=""
					inputId="newPassword"
					warningText={ newPwdWarn }
				/>

				<InputField
					type="password"
					fontBold={ false }
					value={ newPasswordConfirm }
					updateVal={ updateNewPwdConfirm }
					clearWarn={ updNewPwdConfirmWarn }
					fontSize="text-md"
					labelText="Confirm new password:"
					inputPlaceholder=""
					inputId="newPasswordConfirm"
					warningText={ newPwdConfWarn }
				/>

				<ButtonWithLoader 
					text="Change password"
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

			<div className="flex-row ml-3 mt-5">
				<h4 className="flex flex-row text-md">Other settings coming soon...</h4>
				<div className="flex-row border-solid border-t-2 border-gray-300  mb-3"></div>
			</div>
		</div>
	);
}