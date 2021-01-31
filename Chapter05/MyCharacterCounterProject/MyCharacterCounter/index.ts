import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class MyCharacterCounter implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private textbox: HTMLTextAreaElement;
	private outputLabel: HTMLLabelElement;

	private theNotifyOutputChanged: () => void;

	private maxCharacterLimit: number;

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
		context.mode.trackContainerResize(true);

		this.theNotifyOutputChanged = notifyOutputChanged;
		this.maxCharacterLimit = context.parameters.characterCounterLimit.raw || 0;

		//UI
		this.mainDiv = document.createElement("div");

		this.textbox = document.createElement("textarea");
		this.textbox.className = "customTextArea";
		this.textbox.addEventListener("keyup",this.onChange.bind(this));
		this.textbox.value = context.parameters.characterCounterDataInput.raw || "";

		this.outputLabel = document.createElement("label");

		this.mainDiv.appendChild(this.textbox);
		this.mainDiv.appendChild(this.outputLabel);
		container.appendChild(this.mainDiv);

		this.onChange();
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		let changedCharCounterLimit = context.parameters.characterCounterLimit.raw || 0;
		if (this.maxCharacterLimit !== changedCharCounterLimit) {
			this.maxCharacterLimit = changedCharCounterLimit;
			this.onChange();
		}
		console.log("This line of code appear in console");
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			characterCounterDataInput: this.textbox.value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	/*******************/
	/*PRIVATE FUNCTIONS*/
	/*******************/
	private onChange(): void 
	{
		const charRemaining = this.maxCharacterLimit - this.textbox.value.length;
		this.outputLabel.innerHTML = `${charRemaining}/${this.maxCharacterLimit}`;
		this.theNotifyOutputChanged();
	}
}