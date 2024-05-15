import { Routes, Route } from "react-router-dom";
import SignInPanel from "./LogInPanel";
import SignUpPanel from "./SignUpPanel";
import MainPanel from "./MainPanel";
import EmailsSettings from "./SettingsComponents/EmailsSettings";
import SecuritySettings from "./SettingsComponents/SecuritySettings";
import AccountSettings from "./SettingsComponents/AccountSettings";
import SettingsPanel from "./SettingsPanel";
import SettingsHome from "./SettingsComponents/SettingsHome";

export default function PanelContainer() {
	return (
		<div className="center-items h-fit rounded-lg shadow border m-auto p-auto bg-white">
			<Routes>
				<Route path="/" element={<MainPanel/>} caseSensitive/>
				<Route path="/logIn" element={<SignInPanel/>} caseSensitive/>
				<Route path="/signUp" element={<SignUpPanel/>} caseSensitive/>
				<Route path="/settings" element={<SettingsPanel/>} caseSensitive>
					<Route index element={<SettingsHome/>}/>
					<Route path="account" index element={<AccountSettings/>} caseSensitive/>
					<Route path="emails" element={<EmailsSettings/>} caseSensitive/>
					<Route path="security" element={<SecuritySettings/>} caseSensitive/>
				</Route>
			</Routes>
		</div>
	);
}