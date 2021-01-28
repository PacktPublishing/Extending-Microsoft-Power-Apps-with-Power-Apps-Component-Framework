import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class PulsingText implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private boxDiv: HTMLDivElement;
	private boxInnerDiv: HTMLDivElement;
	private textInput: HTMLInputElement;
	
	private refreshData: EventListenerOrEventListenerObject;

	private theNotifyOutputChanged: () => void;
	private theContainer: HTMLDivElement;

	private textValue: string;


	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// UI
		this.boxDiv = document.createElement("div");
		this.boxDiv.setAttribute("class", "box");
		this.boxInnerDiv = document.createElement("div");
		this.boxInnerDiv.setAttribute("class", "animated pulse");
		this.textInput = document.createElement("input");
		this.textInput.setAttribute("class", "textfield");
		this.textInput.type = "text";

		// Assign value from parameters to text field
		this.textInput.value = context.parameters.PulsingTextField.raw || "No value found from parameter";

		// Add elemets to proper div
		this.boxDiv.appendChild(this.boxInnerDiv);
		this.boxInnerDiv.appendChild(this.textInput);

		// Add control elements to the main div
		container.appendChild(this.boxDiv);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Assign value from parameters to text field
		this.textInput.value = context.parameters.PulsingTextField.raw || "No value found from parameter";
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}
}