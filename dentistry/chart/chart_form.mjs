import * as ChartTable from './chart_table.mjs';
import { ChartGraph, JAW } from './chart_graph.mjs';
import * as ToothNumbers from './tooth_numbers.mjs';
import * as ProbingDepth from './probing_depth.mjs';

export class ChartForm {
	static fromDocument() {
		return new ChartForm(
			document.getElementById('periodontal-chart_container'),
			document.getElementById('patient-lastname'),
			document.getElementById('patient-firstname'),
			document.getElementById('chart-date'),
			document.getElementById('practitioner'),
			Array.from(document.querySelectorAll('input[name="follow_type"]')),
			document.getElementById('periodontal-chart_upper-buccal-right'),
			document.getElementById('periodontal-chart_upper-buccal-left'),
			document.getElementById('periodontal-chart_upper-lingual-right'),
			document.getElementById('periodontal-chart_upper-lingual-left'),
			document.getElementById('periodontal-chart_lower-buccal-right'),
			document.getElementById('periodontal-chart_lower-buccal-left'),
			document.getElementById('periodontal-chart_lower-lingual-right'),
			document.getElementById('periodontal-chart_lower-lingual-left'),
			document.getElementById('periodontal-chart_upper-graph'),
			document.getElementById('periodontal-chart_lower-graph'),
		);
	}

	constructor(
		container,
		patientLastNameInput,
		patientFirstNameInput,
		dateInput,
		practitionerInput,
		followTypeButtons,
		upperRightBuccalTable,
		upperLeftBuccalTable,
		upperRightLingualTable,
		upperLeftLingualTable,
		lowerRightBuccalTable,
		lowerLeftBuccalTable,
		lowerRightLingualTable,
		lowerLeftLingualTable,
		upperCanvas,
		lowerCanvas,
	) {
		this._elements = {
			container: container,
			patient: {
				lastName: patientLastNameInput,
				firstName: patientFirstNameInput,
			},
			date: dateInput,
			practitioner: practitionerInput,
			followTypes: followTypeButtons,
			tables: {
				upper: {
					buccal: {
						right: upperRightBuccalTable,
						left: upperLeftBuccalTable,
					},
					lingual: {
						right: upperRightLingualTable,
						left: upperLeftLingualTable,
					}
				},
				lower: {
					buccal: {
						right: lowerRightBuccalTable,
						left: lowerLeftBuccalTable,
					},
					lingual: {
						right: lowerRightLingualTable,
						left: lowerLeftLingualTable,
					}
				}
			}
		};
		chartForm_setDateToNow(this);
		ChartTable.populateTables(
			this._elements.tables,
			chartForm_onToothNumberCellClick.bind(null, this),
			chartForm_onGingivalMarginChange.bind(null, this),
			chartForm_onProbingDepthChange.bind(null, this)
		);
		chartForm_cacheInputs(this);
		chartForm_cacheToothNumbers(this);
		this._graphScaleFactor = 1.0;
		chartForm_createGraphs(this, upperCanvas, lowerCanvas);
	}

	restoreChart(chart) {
		chartForm_restoreChart(this, chart);
	}

	retrieveChart() {
		let gingivalMargins   = this._elements.inputs.gingivalMargins.map(input => parseInt(input.value));
		let probingDepths     = this._elements.inputs.probingDepths.map(input => parseInt(input.value));
		let bleedingOnProbing = convertBooleanArrayToBinaryString(this._elements.inputs.bleedingOnProbing.map(input => input.checked));
		let plaque            = convertBooleanArrayToBinaryString(this._elements.inputs.plaque.map(input => input.checked));
		let missingTeeth      = convertBooleanArrayToBinaryString(this._elements.toothNumbers.map(toothNumberCell => toothNumberCell.classList.contains('missing')));

		return {
			patient: {
				firstName: this._elements.patient.firstName.value,
				lastName: this._elements.patient.lastName.value,
			},
			date: this._elements.date.value,
			practitioner: this._elements.practitioner.value,
			followType: this._elements.followTypes.find(radioButton => radioButton.checked).value,
			gingivalMargins: gingivalMargins,
			probingDepths: probingDepths,
			bleedingOnProbing: bleedingOnProbing,
			plaque: plaque,
			missingTeeth: missingTeeth,
		};
	}

	upperGraph() {
		return this._upperGraph;
	}

	lowerGraph() {
		return this._lowerGraph;
	}

	setGraphScaleFactor(graphScaleFactor) {
		this._graphScaleFactor = graphScaleFactor;
	}
}

function convertBooleanArrayToBinaryString(booleans) {
	return booleans.reduce((string, bool) => string + (bool ? '1' : '0'), '');
}

function chartForm_setDateToNow(chartForm) {
	chartForm._elements.date.valueAsDate = new Date();
}

function chartForm_onToothNumberCellClick(form, toothNumber, event) {
	let toothNumberCell = form._elements.container.querySelector(`.tooth_number.tooth_${toothNumber}`);
	let previousIsToothMissing = toothNumberCell.classList.contains('missing');
	let newIsToothMissing = !previousIsToothMissing;
	chartForm_setIsToothMissing(form, toothNumber, newIsToothMissing);
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	for (let graph of graphs)
		graph.render();
}

function chartForm_getGraphsHavingTooth(form, toothNumber) {
	return [form._upperGraph, form._lowerGraph].filter(graph => graph.hasTooth(toothNumber));
}

function chartForm_onGingivalMarginChange(form, toothNumber, sitePosition, event) {
	let gingivalMargin = parseInt(event.target.value);
	chartForm_setGingivalMarginSite(form, toothNumber, sitePosition, gingivalMargin);

	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	for (let graph of graphs)
		graph.render();
}

function chartForm_onProbingDepthChange(form, toothNumber, sitePosition, event) {
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	let probingDepth = parseInt(event.target.value);
	for (let graph of graphs)
		graph.setProbingDepth(toothNumber, sitePosition, probingDepth);
	for (let graph of graphs)
		graph.render();
}

function chartForm_setIsToothMissing(form, toothNumber, isMissing) {
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	for (let graph of graphs)
		graph.setIsToothMissing(toothNumber, isMissing);

	for (let toothElement of form._elements.container.querySelectorAll(`.tooth_${toothNumber}`)) {
		if (isMissing)
			toothElement.classList.add('missing');
		else
			toothElement.classList.remove('missing');
	}
}

function chartForm_setGingivalMarginSite(form, toothNumber, sitePosition, gingivalMargin) {
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	for (let graph of graphs)
		graph.setGingivalMargin(toothNumber, sitePosition, gingivalMargin);
}

function chartForm_setProbingDepthSite(form, toothNumber, sitePosition, probingDepth) {
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	for (let graph of graphs)
		graph.setProbingDepth(toothNumber, sitePosition, probingDepth);
}


function chartForm_cacheInputs(chartForm) {
	let gingivalMargins   = Array.from(chartForm._elements.container.querySelectorAll('.gingival_margin input'));
	let probingDepths     = Array.from(chartForm._elements.container.querySelectorAll('.probing_depth input'));
	let bleedingOnProbing = Array.from(chartForm._elements.container.querySelectorAll('.bleeding_on_probing input'));
	let plaque            = Array.from(chartForm._elements.container.querySelectorAll('.plaque input'));

	chartForm._elements.inputs = {
		gingivalMargins: gingivalMargins,
		probingDepths: probingDepths,
		bleedingOnProbing: bleedingOnProbing,
		plaque: plaque,
	};
}

function chartForm_cacheToothNumbers(chartForm) {
	let toothNumbers = Array.from(chartForm._elements.container.querySelectorAll('.tooth_number'));
	chartForm._elements.toothNumbers = toothNumbers;
}

function chartForm_createGraphs(chartForm, upperCanvas, lowerCanvas) {
	const createPreferredWidthGetterUsingJawTables = (rightTable, leftTable) => {
		return () => {
			let firstToothNumberCell = rightTable.querySelector('.tooth_number');
			let startX = firstToothNumberCell.getBoundingClientRect().x;
			let endX = leftTable.getBoundingClientRect().x + leftTable.getBoundingClientRect().width;
			let newWidth = endX - startX;
			return newWidth;
		};
	};
	const scaleDecorator = (preferredWidthGetter) => {
		return () => preferredWidthGetter() * chartForm._graphScaleFactor;
	};

	const upperGraphPreferredWidthGetter =
		scaleDecorator(
			createPreferredWidthGetterUsingJawTables(chartForm._elements.tables.upper.buccal.right, chartForm._elements.tables.upper.buccal.left)
		);
	const lowerGraphPreferredWidthGetter =
		scaleDecorator(
			createPreferredWidthGetterUsingJawTables(chartForm._elements.tables.lower.buccal.right, chartForm._elements.tables.lower.buccal.left)
		);
	chartForm._upperGraph = new ChartGraph(upperCanvas, JAW.UPPER, upperGraphPreferredWidthGetter);
	chartForm._lowerGraph = new ChartGraph(lowerCanvas, JAW.LOWER, lowerGraphPreferredWidthGetter);
}

function chartForm_restoreChart(form, chart) {
	const restoreFunctions = {
		practitioner: chartForm_restorePractitioner,
		date: chartForm_restoreDate,
		patient: chartForm_restorePatient,
		followType: chartForm_restoreFollowType,
		gingivalMargins: chartForm_restoreGingivalMargins,
		probingDepths: chartForm_restoreProbingDepths,
		bleedingOnProbing: chartForm_restoreBleedingOnProbing,
		plaque: chartForm_restorePlaque,
		missingTeeth: chartForm_restoreMissingTeeth,
	};
	for (const [key, restoreFunction] of Object.entries(restoreFunctions)) {
		if (key in chart)
			restoreFunction(form, chart[key]);
	}
}

function chartForm_restorePractitioner(form, practitioner) {
	form._elements.practitioner.value = practitioner;
}

function chartForm_restoreDate(form, date) {
	form._elements.date.value = date;
}

function chartForm_restorePatient(form, patient) {
	if ('lastName' in patient)
		form._elements.patient.lastName.value = patient.lastName;
	if ('firstName' in patient)
		form._elements.patient.firstName.value = patient.firstName;
}

function chartForm_restoreFollowType(form, followType) {
	form._elements.followTypes.find(radioButton => radioButton.value == followType).checked = true;
}

function chartForm_restoreGingivalMargins(form, data) {
	var index = 0;
	for (const [toothNumber, site] of makeToothSiteChartIterator()) {
		chartForm_setGingivalMarginSite(form, toothNumber, site, data[index]);
		index += 1;
	}
	for (const [index, input] of Object.entries(form._elements.inputs.gingivalMargins)) {
		input.value = data[index];
	}
	form._upperGraph.render();
	form._lowerGraph.render();
}

function chartForm_restoreProbingDepths(form, data) {
	var index = 0;
	for (const [toothNumber, site] of makeToothSiteChartIterator()) {
		chartForm_setProbingDepthSite(form, toothNumber, site, data[index]);
		index += 1;
	}

	for (const [index, input] of Object.entries(form._elements.inputs.probingDepths)) {
		let probingDepth = data[index];
		input.value = probingDepth;
		if (ProbingDepth.isUnhealthy(probingDepth))
			input.classList.add('unhealthy');
		else
			input.classList.remove('unhealthy');
	}
}

function *makeToothSiteChartIterator() {
	for (let buccoLingualPosition of ['buccal', 'lingual'])
		for (let upperTooth of ToothNumbers.iterateUpperJaw())
			for (let site of ToothNumbers.getToothSitesFromPatientRightToLeft(upperTooth))
				yield [upperTooth, `${buccoLingualPosition}-${site}`];
	for (let buccoLingualPosition of ['lingual', 'buccal'])
		for (let lowerTooth of ToothNumbers.iterateLowerJaw())
			for (let site of ToothNumbers.getToothSitesFromPatientRightToLeft(lowerTooth))
				yield [lowerTooth, `${buccoLingualPosition}-${site}`];
}

function chartForm_restoreBleedingOnProbing(form, data) {
	for (const [index, input] of Object.entries(form._elements.inputs.bleedingOnProbing)) {
		input.checked = data[index] == '1';
	}
}

function chartForm_restorePlaque(form, data) {
	for (const [index, input] of Object.entries(form._elements.inputs.plaque)) {
		input.checked = data[index] == '1';
	}
}

function chartForm_restoreMissingTeeth(form, data) {
	let allTeeth = Array.from(ToothNumbers.iterateTeeth());
	for (const [index, toothNumber] of Object.entries(allTeeth)) {
		let isToothMissing = data[index] == '1';
		chartForm_setIsToothMissing(form, toothNumber, isToothMissing);
	}
	form._upperGraph.render();
	form._lowerGraph.render();
}
