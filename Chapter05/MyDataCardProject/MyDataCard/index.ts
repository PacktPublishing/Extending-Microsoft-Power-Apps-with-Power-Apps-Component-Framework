import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

const buttonStyleHidden: string = "customButtonHidden";
const gridRowRecordId: string = "powerupRowRecId";

export class MyDataCard implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private gridDiv: HTMLDivElement;
	private loadMoreButton: HTMLButtonElement;

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
		this.theContext = context;
		this.theNotifyOutputChanged = notifyOutputChanged;

		//UI
		this.mainDiv = document.createElement("div");
		this.mainDiv.className = "main";

		this.gridDiv = document.createElement("div");
		this.gridDiv.className = "grid";

		this.loadMoreButton = document.createElement("button");
		this.loadMoreButton.innerHTML = "Load More..."
		this.loadMoreButton.classList.add(buttonStyleHidden, "customButton");

		this.mainDiv.appendChild(this.gridDiv);
		this.mainDiv.appendChild(this.loadMoreButton);
		container.appendChild(this.mainDiv);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this.toggleLoadMoreButton(context.parameters.datasetGrid);

		if (!context.parameters.datasetGrid.loading) {
			// Get sorted columns on the view
			let columnsOnView = this.getSortedColumnsOnView(context);
			if (!columnsOnView || columnsOnView.length === 0) {
				return;
			}

			// Remove all existing elements
			while (this.gridDiv.firstChild) {
				this.gridDiv.removeChild(this.gridDiv.firstChild);
			}

			this.gridDiv.appendChild(this.createGridBody(columnsOnView, context.parameters.datasetGrid));
		}
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

	private toggleLoadMoreButton(gridParam: DataSet): void {
		if (gridParam.paging.hasNextPage && this.loadMoreButton.classList.contains(buttonStyleHidden)) {
			this.loadMoreButton.classList.remove(buttonStyleHidden);
		}
		else if (!gridParam.paging.hasNextPage && !this.loadMoreButton.classList.contains(buttonStyleHidden)) {
			this.loadMoreButton.classList.add(buttonStyleHidden);
		}
	}

	private getSortedColumnsOnView(context: ComponentFramework.Context<IInputs>): DataSetInterfaces.Column[] {
		if (!context.parameters.datasetGrid.columns) {
			return [];
		}
		let columns = context.parameters.datasetGrid.columns.filter(function (columnItem: DataSetInterfaces.Column) {
			// some column are supplementary and their order is not > 0
			return columnItem.order >= 0;
		});

		// Sort those columns so that they will be rendered in order
		columns.sort(function (a: DataSetInterfaces.Column, b: DataSetInterfaces.Column) {
			return a.order - b.order;
		});

		return columns;
	}

	private createGridBody(columnsOnView: DataSetInterfaces.Column[], gridParam: DataSet): HTMLDivElement {
		const gridBody: HTMLDivElement = document.createElement("div");

		if (gridParam.sortedRecordIds.length > 0) {
			for (let currentRecordId of gridParam.sortedRecordIds) {
				const gridRecord: HTMLDivElement = this.createCard(columnsOnView, gridParam, currentRecordId);
				gridBody.appendChild(gridRecord);
			}
		}
		else {
			const noRecordLabel: HTMLDivElement = document.createElement("div");
			noRecordLabel.innerHTML = "No records found";
			gridBody.appendChild(noRecordLabel);
		}

		return gridBody;
	}

	private createCard(columnsOnView: DataSetInterfaces.Column[], gridParam: DataSet, currentRecordId: string): HTMLDivElement {
		const gridRecord: HTMLDivElement = document.createElement("div");
		gridRecord.className = "gridItem";
		gridRecord.setAttribute(gridRowRecordId, gridParam.records[currentRecordId].getRecordId());

		columnsOnView.forEach(colItem => {
			gridRecord.appendChild(this.createCardItems(gridParam, currentRecordId, colItem));
		});

		return gridRecord;
	}

	private createCardItems(gridParam: DataSet, currentRecordId: string, columnItems: DataSetInterfaces.Column): HTMLParagraphElement {
		const para = document.createElement("p");

		const label = document.createElement("span");
		label.className = "gridLabel";
		label.innerHTML = `${columnItems.displayName}:`;
		const content = document.createElement("span");
		content.className = "gridText";
		if (gridParam.records[currentRecordId].getFormattedValue(columnItems.name) != null && gridParam.records[currentRecordId].getFormattedValue(columnItems.name) != "") {
			content.innerHTML = gridParam.records[currentRecordId].getFormattedValue(columnItems.name);
		} else {
			content.innerHTML = "-";
		}

		para.appendChild(label);
		para.appendChild(content);

		return para;
	}
}