import "../styles/loading.css"

export default function LoadingPanel() {
	return (
		<div className="flex h-72 w-72 items-center flex-col m-auto">
			<p className="m-auto font-semibold text-center">Please, wait a second. Getting data from server...</p>
			<span className="loader m-auto"></span>
		</div>
	)
}