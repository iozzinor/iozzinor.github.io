import { ChartUrlCoder } from './chart_coder/url.mjs';
import { ChartUrlComponentCoder } from './chart_coder/url_component.mjs';
import { ChartForm } from './chart_form.mjs';
import { ChartExportDialog } from './dialog/chart_export.mjs';
import { ChartDownloadDialog } from './dialog/chart_download.mjs';
import { FileOpenerDialog } from './dialog/file_opener.mjs';
import { ChartCompareDialog } from './dialog/chart_compare.mjs';
import * as ChartCompareForm from './chart_compare_form.mjs';
import { SettingsDialog } from './dialog/settings.mjs';
import { Settings } from './settings.mjs';
import * as Radiant from './radiant.mjs';

function main() {
	Radiant.setupClickListeners();
	let chartUrlHandler = new ChartUrlCoder(new ChartUrlComponentCoder());
	let chartForm = ChartForm.fromDocument();
	let settings = loadSettings();
	restoreSettings(chartForm, settings);
	setupToolboxClickListeners(chartForm, chartUrlHandler, settings);
	attemptToExtractChartFromUrl(chartForm, chartUrlHandler);
	setupPatientNameInputListeners(chartForm);
	setupBeforeUnloadListener();
}

function loadSettings() {
	return Settings.fromLocalStorage();
}

function restoreSettings(chartForm, settings) {
	chartForm.setGraphScaleFactor(settings.getGraphScaleFactor());
}

function setupToolboxClickListeners(chartForm, chartUrlHandler, settings) {
	let singleChartContainer = document.getElementById('single-chart');
	let comparisonChartsContainer = document.getElementById('comparison-charts');

	let uploadButton = document.getElementById('upload');
	let downloadButton = document.getElementById('download');
	let exportButton = document.getElementById('export');
	let compareButton = document.getElementById('compare');
	let settingsButton = document.getElementById('settings');

	uploadButton.addEventListener('click', onUploadClick.bind(null, chartForm));
	downloadButton.addEventListener('click', onDownloadClick.bind(null, chartForm));
	exportButton.addEventListener('click', onExportClick.bind(null, chartUrlHandler, chartForm));
	compareButton.addEventListener('click', onCompareClick.bind(null, singleChartContainer, comparisonChartsContainer));
	settingsButton.addEventListener('click', onSettingsClick.bind(null, chartForm, settings));
}

function attemptToExtractChartFromUrl(chartForm, chartUrlHandler) {
	let extractedChart = chartUrlHandler.extractChart(window.location.href);
	if (extractedChart != null)
		restoreChartFromJson(chartForm, extractedChart);
}

function setupPatientNameInputListeners(chartForm) {
	const updateTitle = () => {
		refreshTitle(chartForm.retrievePatient());
	};
	let patientFirstNameInput = document.getElementById('patient-firstname');
	let patientLastNameInput = document.getElementById('patient-lastname');
	patientFirstNameInput.addEventListener('input', updateTitle);
	patientLastNameInput.addEventListener('input', updateTitle);
}

function setupBeforeUnloadListener() {
	window.addEventListener('beforeunload', function(event) {
		event.preventDefault();
		event.returnValue = 'Are your sure you want to quit?';
		return event.returnValue;
	});
}

function onUploadFileChosen(chartForm, file) {
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(event) {
		let json = JSON.parse(event.target.result);
		restoreChartFromJson(chartForm, json);
	};
}

function restoreChartFromJson(chartForm, json) {
	chartForm.restoreChart(json);
	if ('patient' in json)
		refreshTitle(json.patient);
}

function onUploadClick(chartForm) {
	if (onUploadClick.dialog === undefined)
		onUploadClick.dialog = new FileOpenerDialog('application/json', onUploadFileChosen.bind(null, chartForm));
	onUploadClick.dialog.show();
}

function onDownloadClick(chartForm) {
	ChartDownloadDialog.showDialog(chartForm);
}

function onExportClick(chartUrlHandler, chartForm) {
	ChartExportDialog.showDialog(chartUrlHandler, chartForm);
}

function onCompareClick(singleChartContainer, comparisonChartsContainer) {
	if (onCompareClick.dialog === undefined)
		onCompareClick.dialog = new ChartCompareDialog((reference, comparision) => {
			displayComparison(singleChartContainer, comparisonChartsContainer, reference, comparision);
		});
	onCompareClick.dialog.show();
}

function displayComparison(singleChartContainer, comparisonChartsContainer, reference, comparison) {
	onCompareClick.dialog.close();
	singleChartContainer.style.display = 'none';
	comparisonChartsContainer.style.display = null;
	clearComparisonChartsContainer(comparisonChartsContainer);
	ChartCompareForm.populateComparisonChartsContainer(comparisonChartsContainer, singleChartContainer, reference, comparison);
}

function clearComparisonChartsContainer(comparisonChartsContainer) {
	for (let child of comparisonChartsContainer.children)
		child.remove();
}

function onSettingsClick(chartForm, settings) {
	if (onSettingsClick.dialog === undefined)
		onSettingsClick.dialog = new SettingsDialog(newSettingsObject => {
			settings.setObject(newSettingsObject);
			chartForm.setGraphScaleFactor(settings.getGraphScaleFactor());
			chartForm.upperGraph().resize();
			chartForm.upperGraph().render();
			chartForm.lowerGraph().resize();
			chartForm.lowerGraph().render();
		});
	onSettingsClick.dialog.show(settings.toObject());
}

function refreshTitle(patient) {
	refreshTitle.h1 = refreshTitle.h1 === undefined ? document.querySelector('h1') : refreshTitle.h1;
	let newTitle = makeDocumentTitle(patient);
	refreshTitle.h1.textContent = newTitle;
	document.title = newTitle;
}

function makeDocumentTitle(patient) {
	let components = [patient.lastName, patient.firstName].filter(component => component.length > 0);
	if (components.length < 1)
		return 'Periodontal Chart';
	let patientFullName = components.join(' ');
	return `Periodontal Chart | ${patientFullName}`;
}

main();
