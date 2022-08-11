import { FileOpener } from './file/opener.mjs';
import { ChartUrlHandler } from './chart_url_handler.mjs';
import { ChartExportDialog } from './chart_export_dialog.mjs';
import { ChartDownloadDialog } from './chart_download_dialog.mjs';
import { ChartForm } from './chart_form.mjs';

import * as ChartBinary from './chart_binary.mjs';
import * as b64 from '/scripts/base64.mjs';

function main() {
	let chartUrlHandler = new ChartUrlHandler(
		createChartUrlContent,
		createChartFromUrlValue,
	);
	let chartForm = ChartForm.fromDocument();

	let uploadButton = document.getElementById('upload');
	let downloadButton = document.getElementById('download');
	let exportButton = document.getElementById('export');

	uploadButton.addEventListener('click', onUploadClick.bind(null, chartForm));
	downloadButton.addEventListener('click', onDownloadClick.bind(null, chartForm));
	exportButton.addEventListener('click', onExportClick.bind(null, chartUrlHandler, chartForm));

	let extractedChart = chartUrlHandler.extractChart(window.location.href);
	if (extractedChart != null)
		restoreChartFromJson(chartForm, extractedChart);

	setupRadiantClickListeners();
}

function createChartUrlContent(chart) {
	// chart => btoa(JSON.stringify(chart))
	let binary = ChartBinary.makeBinary(chart);
	return b64.binaryToBase64String(binary);
}

function createChartFromUrlValue(urlValue) {
	// chartValue => JSON.parse(atob(chartValue))
	let binary = b64.base64StringToBinary(urlValue);
	return ChartBinary.createFromBinary(binary);
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
}

function onUploadClick(chartForm) {
	if (onUploadClick.dialog === undefined)
		onUploadClick.dialog = new FileOpener(onUploadFileChosen.bind(null, chartForm));
	onUploadClick.dialog.show();
}

function onDownloadClick(chartForm) {
	ChartDownloadDialog.showDialog(chartForm);
}

function onExportClick(chartUrlHandler, chartForm) {
	ChartExportDialog.showDialog(chartUrlHandler, chartForm);
}

function setupRadiantClickListeners() {
	for (let radiant of document.querySelectorAll('.radiant')) {
		radiant.addEventListener('click', function(event) {
			event.target.classList.add('clicked');
			setTimeout(() => event.target.classList.remove('clicked'), 7500);
		});
	}
}

main();
