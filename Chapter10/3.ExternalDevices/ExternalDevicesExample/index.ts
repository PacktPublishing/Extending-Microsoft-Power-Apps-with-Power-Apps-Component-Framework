import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class ExternalDevicesExample implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private audioButton: HTMLButtonElement;
	private videoButton: HTMLButtonElement;
	private imageButton: HTMLButtonElement;
	private barcodeButton: HTMLButtonElement;
	private locationButton: HTMLButtonElement;
	private pickFileButton: HTMLButtonElement;
	private outputLabel: HTMLLabelElement;

	private image: HTMLImageElement;
	private video: HTMLVideoElement;
	private audio: HTMLAudioElement;

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
		this.theNotifyOutputChanged = notifyOutputChanged;
		this.theContext = context;

		//UI
		this.mainDiv = document.createElement("div");
		this.audioButton = document.createElement("button");
		this.audioButton.innerText = "Capture Audio";
		this.audioButton.addEventListener("click", this.OnCaptureAudio.bind(this));
		this.videoButton = document.createElement("button");
		this.videoButton.innerText = "Capture Video";
		this.videoButton.addEventListener("click", this.OnCaptureVideo.bind(this));
		this.imageButton = document.createElement("button");
		this.imageButton.innerText = "Capture Image";
		this.imageButton.addEventListener("click", this.OnCaptureImage.bind(this));
		this.barcodeButton = document.createElement("button");
		this.barcodeButton.innerText = "Capture Barcode";
		this.barcodeButton.addEventListener("click", this.OnCaptureBarcode.bind(this));
		this.locationButton = document.createElement("button");
		this.locationButton.innerText = "Show Current Location";
		this.locationButton.addEventListener("click", this.OnShowCurrentLocation.bind(this));
		this.pickFileButton = document.createElement("button");
		this.pickFileButton.innerText = "Pick File";
		this.pickFileButton.addEventListener("click", this.OnPickFile.bind(this));

		this.outputLabel = document.createElement("label");
		this.image = document.createElement("img");
		this.video = document.createElement("video");
		this.audio = document.createElement("audio");

		this.mainDiv.appendChild(this.audioButton);
		this.mainDiv.appendChild(this.videoButton);
		this.mainDiv.appendChild(this.imageButton);
		this.mainDiv.appendChild(this.barcodeButton);
		this.mainDiv.appendChild(this.locationButton);
		this.mainDiv.appendChild(this.pickFileButton);

		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.outputLabel);
		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.image);
		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.video);
		this.mainDiv.appendChild(document.createElement("br"));
		this.mainDiv.appendChild(this.audio);
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
	private async OnCaptureAudio(): Promise<void> {
		let aud = await this.theContext.device.captureAudio()
					.catch(err => this.displayOutput(err.message));

		if (aud) {
			this.audio.src = `data:${aud.mimeType};base64,${aud.fileContent}`;
			this.audio.controls = true;
			this.displayOutput(aud.fileName);
		}
	}

	private async OnCaptureVideo(): Promise<void> {
		let vid = await this.theContext.device.captureVideo()
					.catch(err =>this.displayOutput(err.message));

		if (vid) {
			this.video.src = `data:${vid.mimeType == "video/MOV" ? "video/quicktime" : vid.mimeType};base64,${vid.fileContent}`;
			this.video.controls = true;
			this.displayOutput(vid.fileName);
		}
	}

	private async OnCaptureImage(): Promise<void> {
		let img = await this.theContext.device.captureImage()
					.catch(err => this.displayOutput(err.message));

		if (img) {
			this.image.className = "size-200px";
			this.image.src = `data:${img.mimeType};base64,${img.fileContent}`;
			this.displayOutput(img.fileName);
		}
	}

	private async OnCaptureBarcode(): Promise<void> {
		let code = await this.theContext.device.getBarcodeValue()
					.catch(err => this.displayOutput(err.message));

		if (code) {
			this.displayOutput(code);
		}
	}

	private async OnShowCurrentLocation(): Promise<void> {
		let pos = await this.theContext.device.getCurrentPosition()
					.catch(err => this.displayOutput(err.message));

		if (pos) {
			this.displayOutput(`Lat:${pos.coords.latitude},Long:${pos.coords.longitude}`);
		}
	}

	private async OnPickFile(): Promise<void> {
		let files = await this.theContext.device.pickFile()
					.catch(err => this.displayOutput(err.message));

		if (files) {
			this.displayOutput(`File Name identified: ${files[0].fileName}`);
		}
	}

	private displayOutput(message: string) {
		this.outputLabel.innerText = message;
	}
}