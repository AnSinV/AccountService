export type signUpRequest = {
	nickname: string,
	email: string,
	description?: string,
	pwdHash: string,
};

export type logInRequest = {
	email: string,
	pwdHash: string,
};

export type ChangePasswordRequest = {
	oldPwdHash: string,
	newPwdHash: string,
	endAllSessions: boolean,
};

export type ChangeEmailRequest = {
	newEmail: string,
};

export type ChangeAccountInfoRequest = {
	newNickname: string;
	newDescription: string;
}

export type UserInfo = {
	id: string,
	email: string,
	nickname: string,
	description: string,
	regDate: Date,
	onlineTime: Date,
};

export type BaseResponse = {
	isError: boolean,
	result: string,
	message: string,
};

export type ModalStoreState = {
	isOpen: boolean,
	isError: boolean,
	showCloseBtn: boolean,
	modalHeader: string,
	modalMessage: string,
};

export type OpenModalParams = {
	isError: boolean,
	showCloseBtn: boolean,
	modalHeader: string,
	modalMessage: string,
};