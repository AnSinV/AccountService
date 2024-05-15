import { ChangeEvent, createRef, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

type inputFieldProps = {
	type: string;
	value: string;
	updateVal: (newVal: string) => void;
	clearWarn: (newVal: string) => void;
	fontBold: boolean;
	fontSize: string;
	labelText: string;
	inputId: string;
	inputPlaceholder: string;
	maxLength?: number;
	warningText: string;
}

type inputFieldState = {
	charCounter?: number,
	showPassword?: boolean
}

export default function InputField({ type, value, updateVal, clearWarn, fontBold, fontSize, labelText, inputId, inputPlaceholder, maxLength, warningText }: inputFieldProps): React.JSX.Element {
	let defaultState: inputFieldState = {};

	if (type === "password") {
		defaultState.showPassword = false;
	}
	if (maxLength !== undefined) {
		defaultState.charCounter = 0;
	}

	let [ state, updState ] = useState(defaultState);
	let inputElemRef = createRef<HTMLInputElement>();

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		updState({ ...state, charCounter: e.target.value.length });
		
		clearWarn("");
		updateVal(e.target.value);
	}

	return (
		<div className="w-2/3">
			<label className={`block ${ fontSize } ${ fontBold ? "font-bold" : "" } mx-2 select-none`} htmlFor={ inputId }>
				{ labelText }
			</label>

			{ type === "password" ? 
				<div className="flex flex-row-reverse items-center h-0 select-none"> 
					<div className="relative top-8 left-10 cursor-pointer" onClick={ () => { updState({ ...state, showPassword: !state.showPassword }); } }>
						{ state.showPassword ? <FaRegEye className="text-2xl"/> : <FaRegEyeSlash className="text-2xl"/> } 
					</div>
				</div> : null 
			}
			<input autoComplete={ type } ref={ inputElemRef } id={ inputId } type={ state.showPassword ? "text" : type } value={ value } placeholder={ inputPlaceholder } className={ `shadow border rounded py-3 px-3 w-full my-2 ${ warningText !== "" ? "border-red-500" : "" }` } maxLength={ maxLength } onChange={ handleChange }/>
			
			<div className="w-full flex flex-row pb-2 pl-2 select-none">
				<p className="relative text-red-500 text-xs basis-1/2">{ warningText }</p>
				{ maxLength !== undefined ? <span className="text-xs basis-1/2 text-right">{ state.charCounter + "/" + maxLength }</span> : null }
			</div>
		</div>
	)
}