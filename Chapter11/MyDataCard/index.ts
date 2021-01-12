import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

const buttonStyleHidden: string = "customButtonHidden";
const gridRowRecordId: string = "powerupRowRecId";
const lookupEntityName: string = "lookupEntityName";

export class MyDataCard implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private mainDiv: HTMLDivElement;
	private gridDiv: HTMLDivElement;
	private loadMoreButton: HTMLButtonElement;
	private sortButton: HTMLButtonElement;
	private countLabel: HTMLLabelElement;
	private selectCheck: HTMLInputElement;

	private sortColName: string;
	private selectionIds: string[] = [];

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

		this.sortColName = context.parameters.sortColName.raw || "";

		//UI
		this.mainDiv = document.createElement("div");
		this.mainDiv.className = "main";

		this.gridDiv = document.createElement("div");
		this.gridDiv.className = "grid";

		this.loadMoreButton = document.createElement("button");
		this.loadMoreButton.innerHTML = `Load More...`;
		this.loadMoreButton.classList.add(buttonStyleHidden, "customButton");
		this.loadMoreButton.addEventListener("click", this.LoadMorePages.bind(this));

		this.sortButton = document.createElement("button");
		this.sortButton.innerHTML = `Sort ${this.sortColName}`;
		this.sortButton.addEventListener("click", this.SortColumn.bind(this));

		this.countLabel = document.createElement("label");
		this.countLabel.innerHTML = "Total records:" + context.parameters.datasetGrid.paging.totalResultCount;

		this.mainDiv.appendChild(this.sortButton);
		this.mainDiv.appendChild(this.gridDiv);
		this.mainDiv.appendChild(this.loadMoreButton);
		this.mainDiv.appendChild(this.countLabel);
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
		let gridBody: HTMLDivElement = document.createElement("div");

		if (gridParam.sortedRecordIds.length > 0) {
			for (let currentRecordId of gridParam.sortedRecordIds) {
				let gridRecord: HTMLDivElement = this.createCard(columnsOnView, gridParam, currentRecordId);
				gridBody.appendChild(gridRecord);
			}
		}
		else {
			let noRecordLabel: HTMLDivElement = document.createElement("div");
			noRecordLabel.innerHTML = "No records found";
			gridBody.appendChild(noRecordLabel);
		}

		return gridBody;
	}

	private createCard(columnsOnView: DataSetInterfaces.Column[], gridParam: DataSet, currentRecordId: string): HTMLDivElement {
		let mobilePhone = gridParam.records[currentRecordId].getFormattedValue("mobilePhone");
		let isMobilePhoneExists = mobilePhone != null && mobilePhone != "" ? true : false;

		let gridRecord: HTMLDivElement = document.createElement("div");
		gridRecord.className = isMobilePhoneExists ? "gridItem" : "gridItemHighlight";
		gridRecord.setAttribute(gridRowRecordId, gridParam.records[currentRecordId].getRecordId());

		this.selectCheck = document.createElement("input");
		this.selectCheck.type = "checkbox";
		this.selectCheck.value = gridParam.records[currentRecordId].getRecordId();
		this.selectCheck.addEventListener("click", this.RecordSelection.bind(this));
		gridRecord.appendChild(this.selectCheck);

		columnsOnView.forEach(colItem => {
			gridRecord.appendChild(this.createCardItems(gridParam, currentRecordId, colItem));
		});

		return gridRecord;
	}

	private createCardItems(gridParam: DataSet, currentRecordId: string, columnItems: DataSetInterfaces.Column): HTMLParagraphElement {
		let para = document.createElement("p");

		let label = document.createElement("span");
		label.className = "gridLabel";
		label.innerHTML = `${columnItems.displayName}:`;
		let content = document.createElement("span");
		content.className = "gridText";
		if (gridParam.records[currentRecordId].getFormattedValue(columnItems.name) != null && gridParam.records[currentRecordId].getFormattedValue(columnItems.name) != "") {
			content.innerHTML = gridParam.records[currentRecordId].getFormattedValue(columnItems.name);

			if (columnItems.dataType.startsWith('Lookup.') || columnItems.isPrimary) {
				content.classList.add("gridText", "gridTextLookup");
				content.addEventListener("click", this.NavigateToRecord.bind(this));

				if (columnItems.dataType.startsWith('Lookup.')) {
					let lookupER = gridParam.records[currentRecordId].getValue(columnItems.name) as ComponentFramework.EntityReference;
					content.id = lookupER.id.guid;
					content.setAttribute(lookupEntityName, lookupER.etn ?? "");
				}

				if (columnItems.isPrimary) {
					content.id = gridParam.records[currentRecordId].getRecordId();
					// Unsupported - getNamedReference should return the name on etn but it doesn't
					content.setAttribute(lookupEntityName, (<any>gridParam.records[currentRecordId].getNamedReference()).entityName ?? "");
				}
			}
		} else {
			content.innerHTML = "-";
		}

		para.appendChild(label);
		para.appendChild(content);

		return para;
	}

	/** ENHANCED FEATURES **/
	private SortColumn() {
		let dataset = this.theContext.parameters.datasetGrid;
		let columnClicked = this.sortColName;

		const oldSorting = (dataset.sorting || []).find((sort) => sort.name === columnClicked);
		const newValue: DataSetInterfaces.SortStatus = {
			name: columnClicked,
			sortDirection: oldSorting != null ? (oldSorting.sortDirection === 0 ? 1 : 0) : 0 //0 = ascending
		};
		while (dataset.sorting.length > 0) {
			dataset.sorting.pop();
		}
		dataset.sorting.push(newValue);
		//(dataset.paging as any).loadExactPage(1);
		dataset.paging.reset();
		dataset.refresh();
	}

	private LoadMorePages() {
		if (this.theContext.parameters.datasetGrid.paging.hasNextPage) {
			this.theContext.parameters.datasetGrid.paging.loadNextPage();
		}
		this.countLabel.innerHTML = "Total records:" + this.theContext.parameters.datasetGrid.paging.totalResultCount;
	}

	private RecordSelection(selectedControl: any): void {
		if (selectedControl.target.checked) {
			this.selectionIds.push(selectedControl.target.value);
			this.theContext.parameters.datasetGrid.setSelectedRecordIds(this.selectionIds);
		}
		else {
			this.selectionIds = this.selectionIds.filter((n) => {
				return n != selectedControl.target.value
			});
			this.theContext.parameters.datasetGrid.setSelectedRecordIds(this.selectionIds);
		}

	}

	private NavigateToRecord(selectedControl: any): void {
		this.theContext.navigation.openForm({
			entityName: selectedControl.target.getAttribute(lookupEntityName),
			entityId: selectedControl.target.id
		});
	}
}