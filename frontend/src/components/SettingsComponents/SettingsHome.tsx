import { Link } from "react-router-dom";

export default function SettingsHome() {
	return (
		<div className="flex flex-col w-full p-5">
			<h3 className="flex-row text-xl">Settings</h3>
			<div className="border-solid border-t-2 border-gray-500 mb-5"></div>
			<div>
				Here you can change settings of your account...
			</div>

			<div className="flex-row ml-3 mt-5">
				<h4 className="flex-row text-md">Links</h4>
				<div className="flex-row border-solid border-t-2 border-gray-300  mb-3"></div>

				<div>
					<Link to="/settings/account" className="my-3 text-blue-500 hover:text-blue-700 active:text-blue-900">Manage your account...</Link>
				</div>
				<div>
					<Link to="/settings/emails" className="my-3 text-blue-500 hover:text-blue-700 active:text-blue-900">Change email or phone number...</Link>
				</div>
				<div>
					<Link to="/settings/security" className="my-3 text-blue-500 hover:text-blue-700 active:text-blue-900">Change password...</Link>
				</div>
			</div>
		</div>
	);
}