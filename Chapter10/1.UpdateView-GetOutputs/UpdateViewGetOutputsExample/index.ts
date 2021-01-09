import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class UpdateViewGetOutputsExample implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private textbox: HTMLTextAreaElement;
	private outputLabelDiv: HTMLDivElement
	private outputLabel: HTMLLabelElement;
	private counter: number;

	private theNotifyOutputChanged: () => void;
	private theContext: ComponentFramework.Context<IInputs>;

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		context.mode.trackContainerResize(true);
		this.counter = 1;

		this.theNotifyOutputChanged = notifyOutputChanged;
		this.theContext = context;

		//UI
		this.mainDiv = document.createElement("div");
		this.textbox = document.createElement("textarea");
		this.textbox.addEventListener("keyup", this.OnChange.bind(this));
		this.textbox.value = context.parameters.fieldProp.raw || "";
		this.outputLabelDiv = document.createElement("div");
		this.outputLabelDiv.className = "div-align-left";
		this.outputLabel = document.createElement("label");
		this.outputLabel.innerHTML = `${this.counter} Init is called.`;

		this.outputLabelDiv.appendChild(this.outputLabel);
		this.mainDiv.appendChild(this.textbox);
		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.outputLabelDiv);
		container.appendChild(this.mainDiv);

	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this.counter++;
		this.outputLabel.innerHTML += `<br/>${this.counter} UpdateView is called with fieldProp = ${context.parameters.fieldProp.raw} and textbox = ${this.textbox.value}`;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		this.counter++;
		this.outputLabel.innerHTML += `<br/>${this.counter} GetOutputs is called with fieldProp = ${this.theContext.parameters.fieldProp.raw} and textbox = ${this.textbox.value}`;

		//#region Default
		// When uncommenting any of the other code-piece in this function please comment this block
		return {
			fieldProp: this.textbox.value
		};
		//#endregion Default

		//#region Setting values on the field based on a condition
		
		// // Uncomment this code and comment the return statement above
		// if(this.textbox.value === "")
		// {
		// 	return {
		// 		fieldProp: undefined
		// 	};
		// }
		// else
		// {
		// 	return {
		// 		fieldProp: this.textbox.value
		// 	};
		// }
		//#endregion Setting values on the field based on a condition
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
	}

	/*******************/
	/*PRIVATE FUNCTIONS*/
	/*******************/
	private OnChange(): void {
		this.counter++;
		this.outputLabel.innerHTML += `<br/>${this.counter} OnChange is called.`;
		this.theNotifyOutputChanged();
	}
}