import { FileSaver } from './file/saver.mjs';
import { generateChartFileName } from './chart_export/file_name.mjs';
import * as Element from './sui/elements.mjs';
import * as Dialog from './sui/dialog.mjs';

export class ChartDownloadDialog {
	static showDialog(chartForm) {
		let clickMeButton =
			Element
				.create('button')
				.className('download-button')
				.text('Click Me to download!')
				.build();
		clickMeButton.addEventListener('click', function() {
			downloadChartFile(chartForm);
		});
		Dialog
			.box('Chart Download')
			.message('Please click the button bellow to download the chart!')
			.content(Element.create('div').add([
				clickMeButton,
			]))
			.show();
	}
}

function downloadChartFile(chartForm) {
	let chart = chartForm.retrieveChart();
	let jsonChart = JSON.stringify(chart);
	let blob = new Blob([jsonChart], {type: 'application/json'});
	let fileName = generateChartFileName(chart, 'json');
	FileSaver.download(fileName, blob);
}
