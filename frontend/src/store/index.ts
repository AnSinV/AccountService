import { configureStore } from "@reduxjs/toolkit";
import modalSlice from "./modalSlice";

const store = configureStore({
    reducer: {
        modalSlice
    }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
