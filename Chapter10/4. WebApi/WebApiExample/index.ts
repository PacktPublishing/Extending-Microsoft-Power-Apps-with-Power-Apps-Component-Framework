import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class WebApiExample implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private outputLabel: HTMLLabelElement;

	private createContactButton: HTMLButtonElement;
	private updateContactButton: HTMLButtonElement;
	private retrieveContactButton: HTMLButtonElement;
	private deleteContactButton: HTMLButtonElement;
	private retrieveMultipleContactButton: HTMLButtonElement;

	private theContext: ComponentFramework.Context<IInputs>;

	private contactEntityId: string | undefined;

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
		this.theContext = context;

		//UI
		this.mainDiv = document.createElement("div");
		this.outputLabel = document.createElement("label");

		this.createContactButton = document.createElement("button");
		this.createContactButton.innerText = "Create Contact";
		this.createContactButton.addEventListener("click", this.OnCreateButtonClicked.bind(this));
		this.updateContactButton = document.createElement("button");
		this.updateContactButton.innerText = "Update Contact";
		this.updateContactButton.disabled = true;
		this.updateContactButton.addEventListener("click", this.OnUpdateButtonClicked.bind(this));
		this.retrieveContactButton = document.createElement("button");
		this.retrieveContactButton.innerText = "Retrieve Contact";
		this.retrieveContactButton.disabled = true;
		this.retrieveContactButton.addEventListener("click", this.OnRetrieveButtonClicked.bind(this));
		this.deleteContactButton = document.createElement("button");
		this.deleteContactButton.innerText = "Delete Contact";
		this.deleteContactButton.disabled = true;
		this.deleteContactButton.addEventListener("click", this.OnDeleteButtonClicked.bind(this));
		this.retrieveMultipleContactButton = document.createElement("button");
		this.retrieveMultipleContactButton.innerText = "Retrieve Multiple Contact";
		this.retrieveMultipleContactButton.addEventListener("click", this.OnRetrieveMultipleButtonClicked.bind(this));

		this.mainDiv.appendChild(this.createContactButton);
		this.mainDiv.appendChild(this.updateContactButton);
		this.mainDiv.appendChild(this.retrieveContactButton);
		this.mainDiv.appendChild(this.deleteContactButton);
		this.mainDiv.appendChild(this.retrieveMultipleContactButton);
		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.outputLabel);
		container.appendChild(this.mainDiv);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {};
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
	private async OnCreateButtonClicked(): Promise<void> {
		let contactData: ComponentFramework.WebApi.Entity = {};
		contactData["firstname"] = "WebApi";
		contactData["lastname"] = "Testing";
		contactData["fullname"] = "WebApi Testing";

		let resp = await this.theContext.webAPI.createRecord("contact", contactData)
					.catch(err => console.log("Contact creation failed."));

		if (resp) {
			// Currently there is a bug with EntityReference defination
			// It should be resp.id.guid as per doc but response contains the record GUID at resp.id
			// Workaround is to typecast resp.is into any
			this.contactEntityId = (<any>resp.id);
			this.outputLabel.innerHTML = `Contact created with id = ${this.contactEntityId}.`;
		}

		this.updateContactButton.disabled = false;
	}

	private OnUpdateButtonClicked(): void {
		if (this.contactEntityId) {
			let contactData: ComponentFramework.WebApi.Entity = {};
			contactData["jobtitle"] = "Power";

			this.theContext.webAPI.updateRecord("contact", this.contactEntityId || "", contactData);
			this.outputLabel.innerHTML = `Contact with id = ${this.contactEntityId} updated.`;
		}
		else {
			this.outputLabel.innerHTML = `Contact id is not defined.`;
		}

		this.retrieveContactButton.disabled = false;
	}

	private async OnRetrieveButtonClicked(): Promise<void> {
		if (this.contactEntityId) {
			let con = await this.theContext.webAPI.retrieveRecord("contact", this.contactEntityId, "?$select=fullname,jobtitle")
						.catch(err => console.log("Not able to fetch contact"));

			if (con) {
				this.outputLabel.innerHTML = `Contact info retrieved: <br/>Full Name: <b>${con.fullname}</b><br/>Job Title: <b>${con.jobtitle}</b>`;
			}
		}
		else {
			this.outputLabel.innerHTML = `Contact id is not defined.`;
		}

		this.deleteContactButton.disabled = false;
	}

	private async OnDeleteButtonClicked(): Promise<void> {
		if (this.contactEntityId) {
			let con = await this.theContext.webAPI.deleteRecord("contact", this.contactEntityId)
						.catch(err => console.log("Unable to delete the contact"));
			if (con) {
				this.contactEntityId = undefined;
				this.outputLabel.innerHTML = `Contact was deleted.`;
			}
		}
		else {
			this.outputLabel.innerHTML = `Contact id is not defined.`;
		}

		this.updateContactButton.disabled = true;
		this.retrieveContactButton.disabled = true;
		this.deleteContactButton.disabled = true;
	}

	private async OnRetrieveMultipleButtonClicked(): Promise<void> {
		let result = await this.theContext.webAPI.retrieveMultipleRecords("contact", "?$select=fullname&$filter=contains(fullname,'sample')&$top=3")
						.catch(err => console.log("Failed to retrieve records"));

		if (result) {
			this.outputLabel.innerHTML = `Contact info where fullname contains sample.`;

			result.entities.forEach(ele => {
				this.outputLabel.innerHTML += `<br/>${ele.fullname}`;
			});
		}
	}
}