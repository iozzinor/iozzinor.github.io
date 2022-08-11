export function generateChartFileName(chart, extension) {
	let dateString = generateChartDateString(chart.date);
	return `periodontal_chart-${dateString}-${chart.patient.lastName}-${chart.patient.firstName}.${extension}`;
}

function generateChartDateString(dateValue) {
	let date = new Date(dateValue);
	let year = String(date.getFullYear()).padStart(4, '0');
	let month = String(date.getMonth() + 1).padStart(2, '0');
	let day = String(date.getDate()).padStart(2, '0');

	return `${year}_${month}_${day}`;
}

