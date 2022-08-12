import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';
import { ChartCsvExporter } from '../chart_export/csv.mjs';
import { ChartPdfExporter } from '../chart_export/pdf.mjs';
import { FileSaver } from '../file/saver.mjs';
import { generateChartFileName } from '../chart_export/file_name.mjs';

export class ChartExportDialog {
	static showDialog(chartUrlHandler, chartForm) {
		let chartUrl = chartUrlHandler.generateUrl(window.location.href, chartForm.retrieveChart());

		let copyButton = createCopyButton(chartUrl);
		let downloadPdfButton = createDownloadPdfButton(chartForm);
		let downloadCsvButton = createDownloadCsvButton(chartForm);

		let buttonsGrid = Element
			.create('div').className('export-grid')
			.add(copyButton)
			.add(downloadPdfButton)
			.add(downloadCsvButton)
			.build();

		Dialog
			.box('Export Chart')
			.message('Please find bellow the URL to reload this chart:')
			.content(Element.create('div').add([
				Element.create('p').text(chartUrl).overflowX('scroll'),
				buttonsGrid,
			]))
			.show();
	}
}

function createCopyButton(chartUrl) {
	let copyButton = createImageButton('assets/url.png', 'assets/url-hover.png', 'Copy link', function(event) {
		navigator.clipboard.writeText(chartUrl);
		let imageButton = event.target.closest('.image-button');
		let span = imageButton.querySelector('span');
		span.textContent = 'copied!';
		setTimeout(function() {
			span.textContent = 'Copy link';
		}, 750);
	});
	copyButton.classList.add('copy');
	return copyButton;
}

function createDownloadPdfButton(chartForm) {
	let downloadPdfButton = createImageButton('assets/pdf-download.png', 'assets/pdf-download-hover.png', 'Download PDF', function() {
		let exporter = new ChartPdfExporter(chartForm);
		let chart = chartForm.retrieveChart();
		let fileName = generateChartFileName(chart, 'pdf');
		let blob = exporter.exportChartToBlob(chart);
		FileSaver.download(fileName, blob);
	});
	downloadPdfButton.classList.add('pdf');
	return downloadPdfButton;
}

function createDownloadCsvButton(chartForm) {
	let downloadCsvButton = createImageButton('assets/csv-download.png', 'assets/csv-download-hover.png', 'Download CSV', function() {
		exportChart(new ChartCsvExporter(), 'csv', 'text/csv', chartForm.retrieveChart());
	});
	downloadCsvButton.classList.add('csv');
	return downloadCsvButton;
}

function createImageButton(imageSource, imageSourceHover, label, onClick) {
	let image = Element.create('div').className('image').build();
	let result = Element
		.create('div')
		.className('image-button')
		.add([
			image,
			Element.create('span').text(label)
		])
		.build();
	result.addEventListener('click', onClick);
	image.style.setProperty('--background-image', `url('${imageSource}')`);
	image.style.setProperty('--background-image-hover', `url('${imageSourceHover}')`);
	return result;
}

function exportChart(exporter, extension, fileType, chart) {
	let content = exporter.exportChart(chart);
	let blob = new Blob([content], {type: fileType});
	let fileName = generateChartFileName(chart, extension);
	FileSaver.download(fileName, blob);
}

