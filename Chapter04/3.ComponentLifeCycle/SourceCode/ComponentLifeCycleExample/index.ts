import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class ComponentLifeCycleExample
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private outputLabel: HTMLLabelElement;
  private notifyOutputChangedButton: HTMLButtonElement;

  private counter: number;
  private hostData: string;
  private hostDataChangedCounter: number;

  _notifyOutputChanged: () => void;

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    this._notifyOutputChanged = notifyOutputChanged;
    // Init UI
    this.outputLabel = document.createElement("label");
    this.notifyOutputChangedButton = document.createElement("button");
    this.notifyOutputChangedButton.innerText = "Change Output";
    this.notifyOutputChangedButton.addEventListener(
      "click",
      this.changeHostData.bind(this)
    );
    container.className = "align-left";
    container.appendChild(this.outputLabel);
    container.appendChild(document.createElement("br"));
    container.appendChild(this.notifyOutputChangedButton);

    // Other init
    this.counter = 0;
    this.hostDataChangedCounter = 0;
    this.hostData = context.parameters.BoundProperty.raw || "No data";

    // Life Cycle output
    this.counter++;
    this.outputLabel.innerHTML = `${this.counter}. init method invoked`;
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Life Cycle output
    this.counter++;
    this.outputLabel.innerHTML += `<br/>${this.counter}. updateView method invoked`;

    if (context.parameters.BoundProperty.error) {
      this.outputLabel.innerHTML += `<br/>&nbsp;&nbsp;&nbsp;&nbsp;Host returned error message: ${context.parameters.BoundProperty.errorMessage}.`;
    } else {
      this.outputLabel.innerHTML += `<br/>&nbsp;&nbsp;&nbsp;&nbsp;Sending data to host or Host accepted the output.`;
    }
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    // Life Cycle output
    this.counter++;
    this.outputLabel.innerHTML += `<br/>${this.counter}. getOutputs method invoked`;
    this.outputLabel.innerHTML += `<br/>&nbsp;&nbsp;&nbsp;&nbsp;Data sent: ${this.hostData}.`;
    return {
      BoundProperty: this.hostData,
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }

  // Private
  private changeHostData() {
    this.hostDataChangedCounter++;
    if (this.hostDataChangedCounter === 1) {
      this.hostData = "This is the changed host data. Dont Accept.";
    } else {
      this.hostData = "This is the changed host data. Accept final.";
    }
    this._notifyOutputChanged();
  }
}
