import * as ToothNumbers from '../tooth_numbers.mjs';

const LEFT_MARGIN = 20;
const PAGE_WIDTH = 210;
const IMAGE_WIDTH = 170;
const CHART_SITES_PER_JAW = 16 * 3;
const ALL_TEETH = Array.from(ToothNumbers.iterateTeeth());
const TOOTH_COLUMN_WIDTH = 13;

export class ChartPdfExporter {
	constructor(chartForm) {
		this._chartForm  = chartForm;
	}

	exportChartToBlob(chart) {
		let upperGraph = this._chartForm.upperGraph();
		let upperImage = upperGraph.toPngImage();
		let upperImageSize = upperGraph.size();
		let lowerGraph = this._chartForm.lowerGraph();
		let lowerImage = lowerGraph.toPngImage();
		let lowerImageSize = lowerGraph.size();

		var pdf = new jspdf.jsPDF();
		drawHeader(pdf, chart);
		drawJaw(pdf, chart, 'Upper Jaw', 'Buccal', 'Palatal', upperImage, upperImageSize, ToothNumbers.iterateUpperJaw, 0, CHART_SITES_PER_JAW);

		pdf.addPage();
		drawHeader(pdf, chart);
		drawJaw(pdf, chart, 'Lower Jaw', 'Lingual', 'Buccal', lowerImage, lowerImageSize, ToothNumbers.iterateLowerJaw, 2 * CHART_SITES_PER_JAW, 3 * CHART_SITES_PER_JAW);

		return pdf.output('blob');
	}
}

function drawHeader(pdf, chart) {
	pdf.setFontSize(15);
	pdf.text(LEFT_MARGIN, 20, 'Periodontal Chart');

	pdf.setFontSize(11);
	pdf.text(LEFT_MARGIN, 30, `Patient Last Name: ${chart.patient.lastName}`);
	pdf.text(LEFT_MARGIN, 35, `Patient First Name: ${chart.patient.firstName}`);
	pdf.text(LEFT_MARGIN, 40, `Practitioner: ${chart.practitioner}`);
	pdf.text(LEFT_MARGIN, 45, `Exam Date: ${chart.date}`);
	pdf.text(LEFT_MARGIN, 50, `Follow Type: ${chart.followType}`);
}

function drawJaw(
	pdf,
	chart,
	jawLabel,
	firstJawOrientationLabel,
	secondJawOrientationLabel,
	image,
	imageSize,
	makeTeethIterator,
	firstToothSiteOffset,
	secondToothSiteOffset,
) {
	const tableStyles = { fontSize: 8 };

	createLabels(pdf, jawLabel, firstJawOrientationLabel, secondJawOrientationLabel);

	let imageHeight = parseInt(IMAGE_WIDTH * imageSize.height / imageSize.width);
	pdf.addImage(image, 'PNG', (PAGE_WIDTH - IMAGE_WIDTH) / 2, 130, IMAGE_WIDTH, imageHeight);

	let headersConfig = createHeadersConfig(makeTeethIterator);
	createFirstTable(pdf, chart, headersConfig, tableStyles, firstToothSiteOffset, makeTeethIterator);
	createSecondTable(pdf, chart, headersConfig, tableStyles, secondToothSiteOffset, makeTeethIterator);
}

function createLabels(pdf, jawLabel, firstJawOrientationLabel, secondJawOrientationLabel) {
	pdf.setFontSize(13);
	pdf.text(LEFT_MARGIN, 60, jawLabel);
	pdf.setFontSize(11);
	pdf.text(LEFT_MARGIN, 65, firstJawOrientationLabel);
	pdf.setFontSize(11);
	pdf.text(LEFT_MARGIN, 215, secondJawOrientationLabel);
}

function createFirstTable(pdf, chart, headersConfig, tableStyles, firstToothSiteOffset, makeTeethIterator) {
	let data = createTableData(chart, firstToothSiteOffset, makeTeethIterator);
	pdf.table(LEFT_MARGIN, 70, data, headersConfig, tableStyles);
	createBleedingOnProbingTableCircles(pdf, chart, firstToothSiteOffset, 115);
	createPlaqueTableCircles(pdf, chart, firstToothSiteOffset, 125);
}

function createSecondTable(pdf, chart, headersConfig, tableStyles, secondToothSiteOffset, makeTeethIterator) {
	let data = createTableData(chart, secondToothSiteOffset, makeTeethIterator);
	pdf.table(LEFT_MARGIN, 220, data, headersConfig, tableStyles);
	createBleedingOnProbingTableCircles(pdf, chart, secondToothSiteOffset, 265);
	createPlaqueTableCircles(pdf, chart, secondToothSiteOffset, 275);
}

function createBleedingOnProbingTableCircles(pdf, chart, toothSiteOffset, y) {
	let digits = [...chart.bleedingOnProbing.slice(toothSiteOffset, toothSiteOffset + CHART_SITES_PER_JAW)];
	let bleedingOnProbing = digits.map(digit => digit == '1');
	createCircles(pdf, y, [255, 0, 0], bleedingOnProbing);
}

function createPlaqueTableCircles(pdf, chart, toothSiteOffset, y) {
	let digits = [...chart.plaque.slice(toothSiteOffset, toothSiteOffset + CHART_SITES_PER_JAW)];
	let plaque = digits.map(digit => digit == '1');
	createCircles(pdf, y, [0, 0, 255], plaque);
}

function createCircles(pdf, y, circleColor, shouldFill) {
	let previousDrawColor = pdf.getDrawColor();

	const radius = 1.2;
	const xCenterStart = 43.5;
	const toothGap = 9.75;
	const chartSiteGap = 3;
	pdf.setFillColor(...circleColor);
	pdf.setDrawColor(...circleColor);

	const getFillStyle = shouldFill => shouldFill ? 'F' : 'D';

	for (var i = 0; i < 16; ++i)
	{
		pdf.circle(xCenterStart + i * toothGap - chartSiteGap, y, radius, getFillStyle(shouldFill[i * 3]));
		pdf.circle(xCenterStart + i * toothGap, y, radius, getFillStyle(shouldFill[i * 3 + 1]));
		pdf.circle(xCenterStart + i * toothGap + chartSiteGap, y, radius, getFillStyle(shouldFill[i * 3 + 2]));
	}

	pdf.setDrawColor(previousDrawColor);
}

function createHeadersConfig(makeTeethIterator) {
	let headersConfig = Array.from(makeTeethIterator()).map(tooth => ({
		name: String(tooth),
		prompt: String(tooth),
		width: TOOTH_COLUMN_WIDTH,
	}));
	headersConfig.splice(0, 0, {
		name: '',
		prompt: '',
		width: 25,
	});
	return headersConfig;
}

function createTableData(chart, toothSiteOffset, makeTeethIterator) {
	const createRowWithChartArray = (chartArrayKey, valueMapper, header) => {
		let row = Object.entries(teeth).reduce((result, current) => {
			let [toothIndex, tooth] = current;
			toothIndex = parseInt(toothIndex);
			if (isToothMissing(chart, tooth))
			{
				result[tooth] = ' ';
				return result;
			}
			let slice = chart[chartArrayKey].slice(toothSiteOffset + toothIndex * 3, toothSiteOffset + (toothIndex + 1) * 3);
			let mappedValues = slice.map(valueMapper);
			result[String(tooth)] = mappedValues.join(' ');
			return result;
		}, {});
		row[''] = header;
		return row;
	};
	const createMockRow = (header) => {
		let row = teeth.reduce((result, tooth) => {
			result[tooth] = ' ';
			return result;
		}, {});
		row[''] = header;
		return row;
	};

	let teeth = Array.from(makeTeethIterator());
	let gingivalMarginRow       = createRowWithChartArray('gingivalMargins',    makeGraduationValue, 'Gingival Margin');
	let probingDepthRow         = createRowWithChartArray('probingDepths',      makeGraduationValue, 'Probing Depth');
	let bleedingOnProbingRow    = createMockRow('BoP');
	let plaqueRow               = createMockRow('Plaque');
	let data = [
		gingivalMarginRow,
		probingDepthRow,
		bleedingOnProbingRow,
		plaqueRow,
	];
	return data;
}

function makeGraduationValue(value) {
	return (value == null || Number.isNaN(value)) ? '0' : value;
}

function isToothMissing(chart, toothNumber) {
	let toothIndex = ALL_TEETH.indexOf(toothNumber);
	return chart.missingTeeth.charAt(toothIndex) == '1';
}

