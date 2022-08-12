import { ChartUrlCoder } from './chart_coder/url.mjs';
import { ChartUrlComponentCoder } from './chart_coder/url_component.mjs';
import { ChartForm } from './chart_form.mjs';
import { ChartExportDialog } from './dialog/chart_export.mjs';
import { ChartDownloadDialog } from './dialog/chart_download.mjs';
import { FileOpenerDialog } from './dialog/file_opener.mjs';
import * as Radiant from './radiant.mjs';

function main() {
	Radiant.setupClickListeners();

	let chartUrlHandler = new ChartUrlCoder(new ChartUrlComponentCoder());
	let chartForm = ChartForm.fromDocument();
	setupToolboxClickListeners(chartForm, chartUrlHandler);
	attemptToExtractChartFromUrl(chartForm, chartUrlHandler);
}

function setupToolboxClickListeners(chartForm, chartUrlHandler) {
	let uploadButton = document.getElementById('upload');
	let downloadButton = document.getElementById('download');
	let exportButton = document.getElementById('export');

	uploadButton.addEventListener('click', onUploadClick.bind(null, chartForm));
	downloadButton.addEventListener('click', onDownloadClick.bind(null, chartForm));
	exportButton.addEventListener('click', onExportClick.bind(null, chartUrlHandler, chartForm));
}

function attemptToExtractChartFromUrl(chartForm, chartUrlHandler) {
	let extractedChart = chartUrlHandler.extractChart(window.location.href);
	if (extractedChart != null)
		restoreChartFromJson(chartForm, extractedChart);
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
		onUploadClick.dialog = new FileOpenerDialog('application/json', onUploadFileChosen.bind(null, chartForm));
	onUploadClick.dialog.show();
}

function onDownloadClick(chartForm) {
	ChartDownloadDialog.showDialog(chartForm);
}

function onExportClick(chartUrlHandler, chartForm) {
	ChartExportDialog.showDialog(chartUrlHandler, chartForm);
}


main();
