import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class CachingExample implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private textbox: HTMLTextAreaElement;
	private cacheButton: HTMLButtonElement;
	private clearCacheButton: HTMLButtonElement;
	private outputLabelDiv: HTMLDivElement
	private outputLabel: HTMLLabelElement;
	private counter: number;

	private theNotifyOutputChanged: () => void;
	private theContext: ComponentFramework.Context<IInputs>;

	private theState: ComponentFramework.Dictionary = {};
	private persistedTextboxValue: string;

	private localStorageValue: string;
	private sessionStorageValue: string;

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
		//context.mode.trackContainerResize(true);
		this.counter = 1;

		this.theNotifyOutputChanged = notifyOutputChanged;
		this.theContext = context;

		if (state) {
			this.theState = state;
			this.persistedTextboxValue = this.theState["TextboxValue"];
		}
		// State not persisted in control -- set variable to default values
		if (!this.persistedTextboxValue) {
			this.persistedTextboxValue = "not cached";
		}
		this.GetBrowserStorage();

		//UI
		this.mainDiv = document.createElement("div");
		this.textbox = document.createElement("textarea");
		this.cacheButton = document.createElement("button");
		this.cacheButton.innerText = "Cache data";
		this.cacheButton.addEventListener("click", this.OnClick.bind(this));
		this.clearCacheButton = document.createElement("button");
		this.clearCacheButton.innerText = "Clear Cache data";
		this.clearCacheButton.addEventListener("click", this.ClearCache_OnClick.bind(this));
		this.outputLabelDiv = document.createElement("div");
		this.outputLabelDiv.className = "div-align-left";
		this.outputLabel = document.createElement("label");
		this.outputLabel.innerHTML = `${this.counter} Init: textbox = ${this.textbox.value} and cache = ${this.persistedTextboxValue}`;
		this.outputLabel.innerHTML += `<br/>localStorage = ${this.localStorageValue} and sessionStorage = ${this.sessionStorageValue}`;

		this.textbox.value = this.persistedTextboxValue;
		this.outputLabelDiv.appendChild(this.outputLabel);
		this.mainDiv.appendChild(this.textbox);
		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.cacheButton);
		this.mainDiv.appendChild(this.clearCacheButton);
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
		this.outputLabel.innerHTML += `<br/>${this.counter} UpdateView: textbox = ${this.textbox.value} and cache = ${this.persistedTextboxValue}`;
		this.outputLabel.innerHTML += `<br/>localStorage = ${this.localStorageValue} and sessionStorage = ${this.sessionStorageValue}`;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		this.counter++;
		this.outputLabel.innerHTML += `<br/>${this.counter} GetOutputs: textbox = ${this.textbox.value} and cache = ${this.persistedTextboxValue}`;
		this.outputLabel.innerHTML += `<br/>localStorage = ${this.localStorageValue} and sessionStorage = ${this.sessionStorageValue}`;

		return {
			//fieldProp: this.textbox.value
		};
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
	private OnClick(): void {
		this.counter++;
		this.outputLabel.innerHTML += `<br/>${this.counter} OnClick (before set state): textbox = ${this.textbox.value} and cache = ${this.theState["TextboxValue"]}`;

		this.theState["TextboxValue"] = this.textbox.value;
		this.theContext.mode.setControlState(this.theState);

		localStorage.setItem('localValue', this.textbox.value);
		sessionStorage.setItem('sessionValue', this.textbox.value);
		this.GetBrowserStorage();

		this.outputLabel.innerHTML += `<br/>${this.counter} OnClick (after set state): textbox = ${this.textbox.value} and cache = ${this.theState["TextboxValue"]}`;
		this.outputLabel.innerHTML += `<br/>localStorage = ${this.localStorageValue} and sessionStorage = ${this.sessionStorageValue}`;

		//this.theNotifyOutputChanged();
	}

	private ClearCache_OnClick() {
		this.counter++;
		localStorage.clear();
		this.GetBrowserStorage();

		this.outputLabel.innerHTML += `<br/>${this.counter} Clear Local Storage Cache: textbox = ${this.textbox.value} and cache = ${this.persistedTextboxValue}`;
		this.outputLabel.innerHTML += `<br/>localStorage = ${this.localStorageValue} and sessionStorage = ${this.sessionStorageValue}`;
	}

	private GetBrowserStorage(): void {
		this.localStorageValue = localStorage.getItem('localValue') || "not cached";
		this.sessionStorageValue = sessionStorage.getItem('sessionValue') || "not cached";
	}
}