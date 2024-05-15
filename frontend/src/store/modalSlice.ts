import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalStoreState, OpenModalParams } from "../types";

const initialState: ModalStoreState  = {
    isOpen: false,
    isError: false,
    showCloseBtn: false,
    modalHeader: "",
    modalMessage: "",
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<OpenModalParams>) => {
            state.isOpen = true;

            state.isError = action.payload.isError;
            state.modalHeader = action.payload.modalHeader;
            state.modalMessage = action.payload.modalMessage;
            state.showCloseBtn = action.payload.showCloseBtn;
        },
        closeModal: (state) => {
            state.isOpen = false;
        }
    }
});

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;