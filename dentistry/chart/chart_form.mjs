import * as ChartTable from './chart_table.mjs';
import { ChartGraph, JAW } from './chart_graph.mjs';
import { ChartGraphPocketsRenderer } from './chart_graph_pockets_render.mjs';
import * as ToothNumbers from './tooth_numbers.mjs';
import * as ProbingDepth from './probing_depth.mjs';

const KEY_FIGURES_NOT_APPLICABLE = 'NA';

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
			document.getElementById('key-figures_mean-probing-depth'),
			document.getElementById('key-figures_mean-attachment-level'),
			document.getElementById('key-figures_bleeding-on-probing-percent'),
			document.getElementById('key-figures_plaque-percent'),
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
		meanProbingDepth,
		meanAttachmentLevel,
		bleedingOnProbingPercent,
		plaquePercent,
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
			},
			keyFigures: {
				meanProbingDepth: meanProbingDepth,
				meanAttachmentLevel: meanAttachmentLevel,
				plaquePercent: plaquePercent,
				bleedingOnProbingPercent: bleedingOnProbingPercent,
			}
		};
		chartForm_setDateToNow(this);
		ChartTable.populateTables(
			this._elements.tables,
			chartForm_onToothNumberCellClick.bind(null, this),
			chartForm_onGingivalMarginChange.bind(null, this),
			chartForm_onProbingDepthChange.bind(null, this),
			chartForm_onBleedingOnProbingCheck.bind(null, this),
			chartForm_onPlaqueCheck.bind(null, this)
		);
		chartForm_cacheInputs(this);
		chartForm_cacheToothNumbers(this);
		this._graphScaleFactor = 1.0;
		chartForm_createGraphs(this, upperCanvas, lowerCanvas);
	}

	restoreChart(chart) {
		chartForm_restoreChart(this, chart);
		chartForm_refreshAllKeyFiguresWithChart(this, chart);
	}

	retrievePatient() {
		return {
			firstName: this._elements.patient.firstName.value,
			lastName: this._elements.patient.lastName.value,
		};
	}

	retrieveChart() {
		let gingivalMargins   = this._elements.inputs.gingivalMargins.map(input => parseInt(input.value));
		let probingDepths     = this._elements.inputs.probingDepths.map(input => parseInt(input.value));
		let bleedingOnProbing = convertBooleanArrayToBinaryString(this._elements.inputs.bleedingOnProbing.map(input => input.checked));
		let plaque            = convertBooleanArrayToBinaryString(this._elements.inputs.plaque.map(input => input.checked));
		let missingTeeth      = convertBooleanArrayToBinaryString(this._elements.toothNumbers.map(toothNumberCell => toothNumberCell.classList.contains('missing')));

		return {
			patient: this.retrievePatient(),
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
	chartForm_refreshAllKeyFigures(form);
}

function chartForm_getGraphsHavingTooth(form, toothNumber) {
	return [form._upperGraph, form._lowerGraph].filter(graph => graph.hasTooth(toothNumber));
}

function chartForm_getGraphPocketsRendererHavingTooth(form, toothNumber) {
	return [form._upperGraphPocketsRenderer, form._lowerGraphPocketsRenderer].filter(renderer => renderer.hasTooth(toothNumber));
}

function chartForm_onGingivalMarginChange(form, toothNumber, sitePosition, event) {
	let gingivalMargin = parseInt(event.target.value);
	chartForm_setGingivalMarginSite(form, toothNumber, sitePosition, gingivalMargin);
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	for (let graph of graphs)
		graph.render();
	chartForm_refreshMeanProbingDepthAndAttachmentLevel(form);
}

function chartForm_onProbingDepthChange(form, toothNumber, sitePosition, event) {
	let graphs = chartForm_getGraphsHavingTooth(form, toothNumber);
	let probingDepth = parseInt(event.target.value);
	chartForm_setProbingDepthSite(form, toothNumber, sitePosition, probingDepth);
	for (let graph of graphs)
		graph.render();
	chartForm_refreshMeanProbingDepthAndAttachmentLevel(form);
}

function chartForm_onBleedingOnProbingCheck(form) {
	let chart = form.retrieveChart();
	let siteIndexes = chartForm_getSiteIndexesForPresentTeeth(form, chart);
	let bleedingOnProbings = siteIndexes.map(index => chart.bleedingOnProbing[index] == '1');
	chartForm_refreshBleedingOnProbingPercent(form, bleedingOnProbings);
}

function chartForm_onPlaqueCheck(form) {
	let chart = form.retrieveChart();
	let siteIndexes = chartForm_getSiteIndexesForPresentTeeth(form, chart);
	let plaques = siteIndexes.map(index => chart.plaque[index] == '1');
	chartForm_refreshPlaquePercent(form, plaques);
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
	let renderers = chartForm_getGraphPocketsRendererHavingTooth(form, toothNumber);
	for (let renderer of renderers)
		renderer.setGingivalMargin(toothNumber, sitePosition, gingivalMargin);
}

function chartForm_setProbingDepthSite(form, toothNumber, sitePosition, probingDepth) {
	let renderers = chartForm_getGraphPocketsRendererHavingTooth(form, toothNumber);
	for (let renderer of renderers)
		renderer.setProbingDepth(toothNumber, sitePosition, probingDepth);
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
	chartForm._upperGraphPocketsRenderer = new ChartGraphPocketsRenderer(chartForm._upperGraph.teeth());
	chartForm._upperGraph.attachRenderer(chartForm._upperGraphPocketsRenderer);
	chartForm._lowerGraph = new ChartGraph(lowerCanvas, JAW.LOWER, lowerGraphPreferredWidthGetter);
	chartForm._lowerGraphPocketsRenderer = new ChartGraphPocketsRenderer(chartForm._lowerGraph.teeth());
	chartForm._lowerGraph.attachRenderer(chartForm._lowerGraphPocketsRenderer);
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

function chartForm_refreshAllKeyFigures(form) {
	let chart = form.retrieveChart();
	chartForm_refreshAllKeyFiguresWithChart(form, chart);
}

function chartForm_refreshAllKeyFiguresWithChart(form, chart) {
	let siteIndexes = chartForm_getSiteIndexesForPresentTeeth(form, chart);
	chartForm_refreshMeanProbingDepthAndAttachmentLevelWithSiteIndexes(form, chart, siteIndexes);

	let bleedingOnProbings = siteIndexes.map(index => chart.bleedingOnProbing[index] == '1');
	chartForm_refreshBleedingOnProbingPercent(form, bleedingOnProbings);
	let plaques = siteIndexes.map(index => chart.plaque[index] == '1');
	chartForm_refreshPlaquePercent(form, plaques);
}

function computeMeanProbingDepths(probingDepths) {
	return probingDepths.reduce((acc, current) => acc + numberOrZero(current), 0) / probingDepths.length;
}

function computeMeanAttachmentLevels(probingDepths, gingivalMargins) {
	let result = 0;
	for (var i = 0; i < probingDepths.length; ++i) {
		result += numberOrZero(probingDepths[i]) - numberOrZero(gingivalMargins[i]);
	}
	return result / probingDepths.length;
}

function numberOrZero(n) {
	return (n == null || Number.isNaN(n)) ? 0 : n;
}

function chartForm_refreshMeanProbingDepthAndAttachmentLevel(form) {
	let chart = form.retrieveChart();
	let siteIndexes = chartForm_getSiteIndexesForPresentTeeth(form, chart);
	chartForm_refreshMeanProbingDepthAndAttachmentLevelWithSiteIndexes(form, chart, siteIndexes);
}

function chartForm_refreshMeanProbingDepthAndAttachmentLevelWithSiteIndexes(form, chart, siteIndexes) {
	let probingDepths = siteIndexes.map(index => chart.probingDepths[index]);
	let gingivalMargins = siteIndexes.map(index => chart.gingivalMargins[index]);
	chartForm_refreshMeanProbingDepth(form, probingDepths);
	chartForm_refreshMeanAttachmentLevel(form, probingDepths, gingivalMargins);
}

function chartForm_getSiteIndexesForPresentTeeth(form, chart) {
	let result = [];
	for (const [index, missingTooth] of Object.entries(chart.missingTeeth)) {
		if (missingTooth == '1')
			continue;
		let isUpper = index < 16;
		let startSectionIndexes = isUpper ? [ 0, 16 * 3 ] : [ 16 * 3 * 2, 16 * 3 * 3 ];
		let innerSectionOffset = (index % 16) * 3;
		for (let startSectionIndex of startSectionIndexes) {
			for (var i = 0; i < 3; ++i) {
				result.push(startSectionIndex + innerSectionOffset + i);
			}
		}
	}
	return result;
}

function chartForm_refreshMeanProbingDepth(form, probingDepths) {
	if (probingDepths.length < 1) {
		form._elements.keyFigures.meanProbingDepth.textContent = KEY_FIGURES_NOT_APPLICABLE;
		return;
	}
	let mean = computeMeanProbingDepths(probingDepths);
	mean = keepAtMostFloatingDigits(mean, 1);
	form._elements.keyFigures.meanProbingDepth.textContent = `${mean}`;
}

function chartForm_refreshMeanAttachmentLevel(form, probingDepths, gingivalMargins) {
	if (gingivalMargins.length < 1) {
		form._elements.keyFigures.meanAttachmentLevel.textContent = KEY_FIGURES_NOT_APPLICABLE;
		return;
	}
	let mean = computeMeanAttachmentLevels(probingDepths, gingivalMargins);
	mean = keepAtMostFloatingDigits(mean, 1);
	form._elements.keyFigures.meanAttachmentLevel.textContent = `${mean}`;
}

function chartForm_refreshBleedingOnProbingPercent(form, bleedingOnProbings) {
	if (bleedingOnProbings.length < 1) {
		form._elements.keyFigures.bleedingOnProbingPercent.textContent = KEY_FIGURES_NOT_APPLICABLE;
		return;
	}
	let percent = bleedingOnProbings.filter(bleedingOnProbing => bleedingOnProbing).length / bleedingOnProbings.length * 100;
	percent = keepAtMostFloatingDigits(percent, 2);
	form._elements.keyFigures.bleedingOnProbingPercent.textContent = `${percent}%`;
}

function chartForm_refreshPlaquePercent(form, plaques) {
	if (plaques.length < 1) {
		form._elements.keyFigures.plaquePercent.textContent = KEY_FIGURES_NOT_APPLICABLE;
		return;
	}
	let percent = plaques.filter(plaque => plaque).length / plaques.length * 100;
	percent = keepAtMostFloatingDigits(percent, 2);
	form._elements.keyFigures.plaquePercent.textContent = `${percent}%`;
}

function keepAtMostFloatingDigits(number, nDigits) {
	let pow = Math.pow(10, nDigits);
	let resultWithFloatingDigits = parseInt(number * pow);
	let nextDigit = parseInt(number * pow * 10) % 10;
	if (nextDigit > 4) {
	resultWithFloatingDigits += 1;
	}
	return resultWithFloatingDigits / pow;
}
