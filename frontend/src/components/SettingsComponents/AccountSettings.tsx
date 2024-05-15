import { useState } from "react";
import InputField from "../InputField";
import ButtonWithLoader from "../ButtonWithLoader";
import { BaseResponse, ChangeAccountInfoRequest } from "../../types";
import axios from "../../axios";
import { useDispatch } from "react-redux";
import { openModal } from "../../store/modalSlice";

export default function AccountSettings() {
	let [ newNicknameWarn, updNicknameWarn ] = useState("");

	let [ submitted, updSubmitted ] = useState(false);
	let [ nickname, updateNickname ] = useState("");
	let [ description, updateDescription ] = useState("");

	let dispatch = useDispatch();

	async function handleSubmit() {
		updNicknameWarn("");

		let warn = "";
		if (!nickname.length) {
			warn = "Please, enter your nickname";
		}

		if (warn !== "") {
			updNicknameWarn(warn);
			return;
		}

		await changeEmail()
	}

	async function changeEmail() {
		updSubmitted(true);

		let requestData: ChangeAccountInfoRequest = {
			newNickname: nickname,
			newDescription: description,
		};

		try {
			let response = await axios.post(
				"/api/account/changeInfo",
				requestData,
				{
					headers: {
						"Content-Type": "application/json; charset=UTF-8",
					}
				}
			);

			let responseData = response.data as BaseResponse;

			if (!responseData.isError) {
				dispatch(
					openModal(
						{
							isError: false,
							showCloseBtn: true,
							modalHeader: "Account info is changed!",
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
							modalHeader: "Error",
							modalMessage: responseData.message,
						}
					)
				);
			}
		} catch (err) {

		} finally {
			updSubmitted(false);
		}
	}

	return (
		<div className="flex flex-col w-full p-5">
			<h3 className="flex-row text-xl">Account settings</h3>
			<div className="border-solid border-t-2 border-gray-500 mb-5"></div>

			<div className="flex-row ml-3">
				<h4 className="flex flex-row text-md">Change public info</h4>
				<div className="flex-row border-solid border-t-2 border-gray-300  mb-3"></div>

				<InputField 
					type="text"
					value={ nickname }
					updateVal={ updateNickname }
					clearWarn={ updNicknameWarn }
					fontBold={ false }
					fontSize="text-md"
					labelText="New nickname:"
					inputPlaceholder="Nickname..."
					inputId="newNickname"
					maxLength={ 64 }
					warningText={ newNicknameWarn }
				/>

				<div className="w-2/3">
					<label className="block text-md mx-2" htmlFor="description">
						Description:
					</label>
					<textarea id="description" value={ description } onChange={ (evt) => { updateDescription(evt.target.value); } } placeholder="Description..." className="shadow border rounded py-2 px-3 mt-2 resize-none w-full h-28" maxLength={ 512 }/>
					<div className="w-full flex flex-row-reverse pb-2 pl-2">
						<span className="text-xs text-right">{ description.length + "/" + 512 }</span>
					</div>
				</div>

				<ButtonWithLoader 
					text="Update account info"
					textColor="text-white"
					color="bg-lime-600"
					colorHovered="hover:bg-lime-700"
					colorClicked="active:bg-lime-800"
					width="h-12"
					height="w-44"
					isSubmitted={ submitted }
					handleSubmit={ handleSubmit }
				/>
			</div>

			<div className="flex-row ml-3 mt-5">
				<h4 className="flex-row text-md">Manage your account...</h4>
				<div className="flex-row border-solid border-t-2 border-gray-300  mb-3"></div>

				<div className="flex-row text-md mb-5">
					Do you want to delete your account? You can do it here. This action is <span className="font-bold">permanent</span>.
				</div>
				
				<ButtonWithLoader 
					text="Delete account!"
					textColor="text-white"
					color="bg-red-600"
					colorHovered="hover:bg-red-700"
					colorClicked="active:bg-red-800"
					width="h-12"
					height="w-40"
					isSubmitted={ submitted }
					handleSubmit={ handleSubmit }
				/>
			</div>
		</div>
	);
   
}