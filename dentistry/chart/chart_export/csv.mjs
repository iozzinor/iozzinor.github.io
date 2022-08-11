import * as ToothNumbers from '../tooth_numbers.mjs';

const SITES_PER_JAW = 16 * 3;

export class ChartCsvExporter {
	exportChart(chart) {
		let result = exportPatient(chart);
		result += exportPractitioner(chart);
		result += exportExamDate(chart);
		result += exportFollowType(chart);

		const chartSites = [
			[ ToothNumbers.iterateUpperJaw, 'BUCCAL' ],
			[ ToothNumbers.iterateUpperJaw, 'PALATAL' ],
			[ ToothNumbers.iterateLowerJaw, 'LINGUAL' ],
			[ ToothNumbers.iterateLowerJaw, 'BUCCAL' ],
		];

		for (const [index, chartSite] of Object.entries(chartSites)) {
			const [teethIterator, label ] = chartSite;
			let offset = index * SITES_PER_JAW;
			result += exportChartSite(chart, teethIterator, label, offset);
		}

		return result;
	}
}

function exportPatient(chart) {
	let result = `Patient Last Name,${chart.patient.lastName}\n`;
	result += `Patient First Name,${chart.patient.firstName}\n`;
	return result;
}

function exportPractitioner(chart) {
	return `Practitioner,${chart.practitioner}\n`;
}

function exportExamDate(chart) {
	return `Exam Date,${chart.date}\n`;
}

function exportFollowType(chart) {
	return `Follow Type,${chart.followType}\n`;
}

function exportChartSite(chart, teethIterator, label, offset) {
	const createRow = (result, chart, rowLabel, offset, valueExtractor) => {
		result = result + `\n${rowLabel}`;
		for (var i = offset; i < offset + SITES_PER_JAW; i++) {
			let value = valueExtractor(chart, i);
			result += `,${value}`;
		}
		return result;
	};
	const attachment_level_starting_rows = [ 9, 17, 25, 33];

	let result = `\n${label}\n`;
	for (let tooth of teethIterator())
		result += `,${tooth},,`;
	result = createRow(result, chart, 'Gingival Margin',        offset, (chart, i) => makeGraduationValue(chart.gingivalMargins[i]));
	result = createRow(result, chart, 'Probing Depth',          offset, (chart, i) => makeGraduationValue(chart.probingDepths[i]));
	result = createRow(result, chart, 'Attachment Level',       offset, (chart, i) => makeAttachmentLevelEquation(attachment_level_starting_rows, i));
	result = createRow(result, chart, 'Bleeding on Probing',    offset, (chart, i) => makeBooleanValue(chart.bleedingOnProbing.charAt(i)));
	result = createRow(result, chart, 'Plaque',                 offset, (chart, i) => makeBooleanValue(chart.plaque.charAt(i)));

	result += '\n';
	return result;
}

function makeGraduationValue(value) {
	return value == null || isNaN(value) ? '' : value;
}

function makeBooleanValue(value) {
	return value == '1' ? 'TRUE' : 'FALSE';
}

function makeAttachmentLevelEquation(startingRows, index) {
	let columnIndex = index % SITES_PER_JAW;
	let sectionIndex = parseInt(index / SITES_PER_JAW);
	let column = convertColumnIndexToLetters(columnIndex + 1);
	let row = startingRows[sectionIndex];
	return `=${column}${row} + ${column}${row+1}`;
}

function convertColumnIndexToLetters(columnIndex) {
	// find base exponent
	let exponent = 1;
	let raised = parseInt(Math.pow(26, exponent));
	while (columnIndex >= raised) {
		columnIndex -= raised;
		exponent += 1;
		raised = parseInt(Math.pow(26, exponent));
	}
	let letters = [];
	for (var i = 0; i < exponent; ++i) {
		let letterIndex = columnIndex % 26;
		let letter = String.fromCharCode('A'.charCodeAt(0) + letterIndex);
		columnIndex /= 26;
		letters.push(letter);
	}
	return letters.reverse().join('');
}

