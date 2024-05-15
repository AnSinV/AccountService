import axios from 'axios';
import { closeModal, openModal } from './store/modalSlice';
import { NavigateFunction } from 'react-router-dom';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';

const instance = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	headers: {
	},
	withCredentials: true
});

export function setupResponseInterceptor(navigate: NavigateFunction, dispatch: Dispatch<UnknownAction>) {
	instance.interceptors.response.use(
		async  (response) => {
			return response;
		}, 
		async (error) => {	
			if (error.response.status === 401) {
				//window.location.href = `${window.location.protocol}://auth.${window.location.hostname}/logIn`;
	
				if (!window.location.href.endsWith("logIn") && !window.location.href.endsWith("signUp")) {
					dispatch(
						openModal(
							{
								isError: true,
								showCloseBtn: false,
								modalHeader: "Session is expired or invalid!",
								modalMessage: "You will be redirected to the log in page..."
							}
						)
					);
	
					let timeoutId = setTimeout(
						() => {
							clearTimeout(timeoutId);
							dispatch(closeModal());
	
							navigate("/logIn");
						},
						3000
					);
				}
			}
	
			return Promise.reject(error)
		}
	);
}

export default instance;
