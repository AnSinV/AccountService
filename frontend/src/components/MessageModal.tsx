import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { ModalStoreState } from "../types";
import { Modal } from "flowbite-react";
import { MdErrorOutline } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";

import { closeModal } from "../store/modalSlice";

export default function MessageModal() {
	let modalState = useSelector<RootState, ModalStoreState>((state) => state.modalSlice)
	let dispatch = useDispatch()

	return (
		<Modal show={ modalState.isOpen } size="md" popup>
			<Modal.Body className="text-center">
				<div className="mt-5">
					<div>
						<div>
							{
								modalState.isError ? 
								<MdErrorOutline className="mx-auto mb-4 h-14 w-14 text-red-300"/>
								:
								<FaRegCircleCheck className="mx-auto mb-4 h-14 w-14 text-green-300"/>
							}	
						</div>
						<h3 className="font-semibold text-xl mb-4">
							{
								modalState.modalHeader 
							}
						</h3>
						<div className="text-md">
							{
								modalState.modalMessage
							}
						</div>
					</div>
				</div>
			</Modal.Body>
			{
				modalState.showCloseBtn && 
				<Modal.Footer>
					<button onClick={ () => dispatch(closeModal()) } className="px-10 py-3 rounded-lg mx-auto bg-blue-300 hover:bg-blue-400 active:bg-blue-500">Close</button>
				</Modal.Footer>
			}
		</Modal>
	);
}