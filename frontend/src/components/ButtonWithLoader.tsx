type buttonWithLoaderProps = {
	text: string;

	textColor: string;
	color: string;
	colorHovered: string;
	colorClicked: string;

	width: string;
	height: string;

	isSubmitted: boolean;

	handleSubmit: () => void;
}

export default function ButtonWithLoader({ text, textColor, color, colorHovered, colorClicked, width, height, isSubmitted, handleSubmit }: buttonWithLoaderProps) {

	return (
		<button 
			className={ `flex flex-row rounded-md ${ width } ${ height } ${ color } ${ isSubmitted ? "cursor-progress" : `${ colorHovered } ${ colorClicked }` }` }
			onClick={ () => handleSubmit() }
		>
			{ isSubmitted ? <span className="smallLoader m-auto"></span> : <div className={ `m-auto ${ textColor }` }>{ text }</div> }
		</button>
	);
}