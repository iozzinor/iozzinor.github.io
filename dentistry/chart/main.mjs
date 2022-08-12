import { FileOpener } from './file/opener.mjs';
import { ChartUrlCoder } from './chart_coder/url.mjs';
import { ChartUrlComponentCoder } from './chart_coder/url_component.mjs';
import { ChartExportDialog } from './chart_export_dialog.mjs';
import { ChartDownloadDialog } from './chart_download_dialog.mjs';
import { ChartForm } from './chart_form.mjs';
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
		onUploadClick.dialog = new FileOpener(onUploadFileChosen.bind(null, chartForm));
	onUploadClick.dialog.show();
}

function onDownloadClick(chartForm) {
	ChartDownloadDialog.showDialog(chartForm);
}

function onExportClick(chartUrlHandler, chartForm) {
	ChartExportDialog.showDialog(chartUrlHandler, chartForm);
}


main();
