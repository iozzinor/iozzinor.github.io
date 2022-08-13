import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';
import * as Alert from '../sui/alert.mjs';
import { SingleFileDropTarget } from './file_opener.mjs';

const REFERENCE_HINT = 'Reference File';
const COMPARISON_HINT = 'Comparison File';

export class ChartCompareDialog {
	constructor(comparisonLaunchHandler) {
        this._comparisonLaunchHandler = comparisonLaunchHandler;

		this._referenceSingleFileDropTarget = new SingleFileDropTarget(
			REFERENCE_HINT,
			chartCompareDialog_onReferenceDropped.bind(null, this),
			chartCompareDialog_onReferenceLeave.bind(null, this)
		);
		this._comparisonSingleFileDropTarget = new SingleFileDropTarget(
			COMPARISON_HINT,
			chartCompareDialog_onComparisonDropped.bind(null, this),
			chartCompareDialog_onComparisonLeave.bind(null, this),
		)
		let content = Element
			.create('div')
			.className('chart-compare_dialog_container')
			.add([
				Element.create('p').text('Please select two files to compare.').build(),
				Element
					.create('div')
					.className('files-row')
					.add([
						this._referenceSingleFileDropTarget.element(),
						Element.create('p').className('arrows').text('⇄'),
						this._comparisonSingleFileDropTarget.element(),
					])
			])
			.build();
		this._elements = { content: content };
		this._cache = {
			comparison: {
				file: null,
				json: null,
			},
			reference: {
				file: null,
				json: null,
			}
		};

        this._dialogId = null;
	}

	show() {
		chartCompareDialog_clearCache(this);
		chartCompareDialog_restoreDropTargetMessages(this);

		this._dialogId = Dialog
			.box('Charts Comparison')
			.content(this._elements.content)
			.show();
	}

    close() {
        if (this._dialogId !== null)
        {
            Dialog.close(this._dialogId);
            this._dialogId = null;
        }
    }
}

function chartCompareDialog_onReferenceDropped(compareDialog, event) {
	event.preventDefault();
	attemptToLoadFile(compareDialog, 'reference', compareDialog._referenceSingleFileDropTarget, event.dataTransfer, (file, json) => {
		compareDialog._cache.reference.file = file;
		compareDialog._cache.reference.json = json;
		chartCompareDialog_checkBothFilesProvided(compareDialog);
	});
}

function chartCompareDialog_onReferenceLeave(compareDialog, event) {
	if (compareDialog._cache.reference.file != null)
		compareDialog._referenceSingleFileDropTarget.setHintTextContent(makeDidLoadMessage(compareDialog._cache.reference.file));
}

function chartCompareDialog_onComparisonDropped(compareDialog, event) {
	event.preventDefault();

	attemptToLoadFile(compareDialog, 'comparison', compareDialog._comparisonSingleFileDropTarget, event.dataTransfer, (file, json) => {
		compareDialog._cache.comparison.file = file;
		compareDialog._cache.comparison.json = json;
		chartCompareDialog_checkBothFilesProvided(compareDialog);
	});
}

function chartCompareDialog_onComparisonLeave(compareDialog, event) {
	if (compareDialog._cache.comparison.file != null)
		compareDialog._comparisonSingleFileDropTarget.setHintTextContent(makeDidLoadMessage(compareDialog._cache.comparison.file));
}

function makeDidLoadMessage(file) {
	return `Did Load: ${file.name}`;
}

function attemptToLoadFile(compareDialog, fileKindName, dropTarget, dataTransfer, completionHandler) {
	let file = null;
	if (dataTransfer.items.length == 1 || dataTransfer.items[0].kind === 'file')
		file = event.dataTransfer.items[0].getAsFile();
	if (file == null) {
		dropTarget.setHintTextContent(`Could not load ${fileKindName} file :/`);
		return;
	}
	file
		.text()
		.then(text => {
			let json = JSON.parse(text);
			dropTarget.setHintTextContent(makeDidLoadMessage(file));
			completionHandler(file, json);
		});
}

function chartCompareDialog_clearCache(compareDialog) {
	compareDialog._cache.reference.file = null;
	compareDialog._cache.reference.json = null;
	compareDialog._cache.comparison.file = null;
	compareDialog._cache.comparison.json = null;
}

function chartCompareDialog_restoreDropTargetMessages(compareDialog) {
	compareDialog._referenceSingleFileDropTarget.setHintTextContent(REFERENCE_HINT);
	compareDialog._comparisonSingleFileDropTarget.setHintTextContent(COMPARISON_HINT);
}

function chartCompareDialog_checkBothFilesProvided(compareDialog) {
	if (compareDialog._cache.comparison.file !== null && compareDialog._cache.reference.file !== null)
		chartCompareDialog_attemptToLaunchComparison(compareDialog);
}

function chartCompareDialog_attemptToLaunchComparison(compareDialog) {
	let reference = compareDialog._cache.reference.json;
	let comparison = compareDialog._cache.comparison.json;

	if (!comparisonAndReferencePatientsMatch(reference, comparison)) {
		chartCompareDialog_showAskWhetherLaunchWhenPatientsDiffer(compareDialog)
			.then(launch => {
				if (launch) {
					chartCompareDialog_launchComparison(compareDialog);
				}
			});
	}
	else if (comparisonAndReferenceSeemToBeIdentical(reference, comparison)) {
		chartCompareDialog_showAskWhetherLaunchWhenChartsSeemIdentical(compareDialog)
			.then(launch => {
				if (launch) {
					chartCompareDialog_launchComparison(compareDialog);
				}
			});
	} else {
        chartCompareDialog_launchComparison(compareDialog);
    }
}

function comparisonAndReferencePatientsMatch(reference, comparison) {
	return reference.patient.lastName == comparison.patient.lastName &&
		reference.patient.firstName == comparison.patient.firstName;
}

function comparisonAndReferenceSeemToBeIdentical(reference, comparison) {
	return comparisonAndReferencePatientsMatch(reference, comparison)
		&& reference.date == comparison.date;
}

function chartCompareDialog_showAskWhetherLaunchWhenPatientsDiffer(compareDialog) {
	return new Promise(resolve => {
		Alert
			.box()
			.title('Comparison Launch')
			.message('Reference and comparison files seem to concern two different patients. Do you want to run the comparison anyway ?')
			.buttons(['Yes', 'No'])
			.onSelection(selection => {
				resolve(selection == 'Yes');
			})
			.run();
	});
}

function chartCompareDialog_showAskWhetherLaunchWhenChartsSeemIdentical(compareDialog) {
	return new Promise(resolve => {
		Alert
			.box()
			.title('Comparison Launch')
			.message('Reference and comparison charts seem to be identical. Do you want to run the comparison anyway ?')
			.buttons(['Yes', 'No'])
			.onSelection(selection => {
				resolve(selection == 'Yes');
			})
			.run();
	});
}

function chartCompareDialog_launchComparison(compareDialog) {
    compareDialog._comparisonLaunchHandler(compareDialog._cache.reference.json, compareDialog._cache.comparison.json);
}
