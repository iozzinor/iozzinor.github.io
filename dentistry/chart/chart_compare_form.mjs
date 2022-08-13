import * as Element from './sui/elements.mjs';
import { ChartGraph, JAW } from './chart_graph.mjs';
import { ChartGraphComparisonRenderer } from './chart_graph_comparison_renderer.mjs';
import * as ToothNumbers from './tooth_numbers.mjs';

export function populateComparisonChartsContainer(comparisonChartsContainer, singleChartContainer, reference, comparison) {
	Element.clearChildren(comparisonChartsContainer);

	let backButton = createBackButton(singleChartContainer, comparisonChartsContainer);

	let container = Element.from(comparisonChartsContainer);
	let upperCanvas = document.createElement('canvas');
	let lowerCanvas = document.createElement('canvas');
	container
		.add([
			backButton,
			Element.create('h1').text('Compare Charts'),
			Element.create('h2').text('Upper Jaw'),
			Element
				.create('div')
				.className('compare-charts_jaw')
				.add([
					Element.create('p').text('Buccal'),
					Element.create('p').text('Palatal'),
					upperCanvas
				]),
			Element.create('hr').marginTop('5rem').marginBottom('5rem'),
			Element.create('h2').text('Lower Jaw'),
			Element
				.create('div')
				.className('compare-charts_jaw')
				.add([
					Element.create('p').text('Lingual'),
					Element.create('p').text('Buccal'),
					lowerCanvas,
				])
		]);

	createChartGraph(upperCanvas, JAW.UPPER, reference, comparison);
	createChartGraph(lowerCanvas, JAW.LOWER, reference, comparison);
}

function createBackButton(singleChartContainer, comparisonChartsContainer) {
	let backButton = Element
		.create('button')
		.text('Back to Editing')
		.build();
	backButton.addEventListener('click', function() {
		singleChartContainer.style.display = null;
		comparisonChartsContainer.style.display = 'none';
	});
	return backButton;
}

function createChartGraph(canvas, jaw, reference, comparison) {
	let graph = new ChartGraph(canvas, jaw, () => canvas.clientWidth);

	setChartGraphMissingTeeth(graph, jaw, comparison);
	let referenceAttachmentLevels = retrieveChartAttachmentLevels(graph.teeth(), reference);
	let comparisonAttachmentLevels = retrieveChartAttachmentLevels(graph.teeth(), comparison);
	let comparisonRenderer = new ChartGraphComparisonRenderer(referenceAttachmentLevels, comparisonAttachmentLevels);

	graph.attachRenderer(comparisonRenderer);
	graph.resize();
	graph.render();
}

function setChartGraphMissingTeeth(graph, jaw, comparison) {
	let teeth = graph.teeth();
	let areTeethMissing = [...comparison.missingTeeth].map(code => (code == '1'));
	switch (jaw)
	{
		case JAW.UPPER:
			areTeethMissing = Array.from(areTeethMissing.slice(0, 16));
			break;
		case JAW.LOWER:
			areTeethMissing = Array.from(areTeethMissing.slice(16));
			break;
	}
	for (const [index, tooth] of Object.entries(teeth)) {
		if (areTeethMissing[index])
			graph.setIsToothMissing(tooth, true);
	}
}

function retrieveChartAttachmentLevels(graphTeeth, chart) {
	const extractValue = (n) => (n == null || Number.isNaN(n)) ? 0 : n;

	let result = {};
	for (const [index, tooth] of Object.entries(graphTeeth)) {
		let toothSiteIndexes = [];
		let isUpper = ToothNumbers.isInUpperJaw(tooth);
		let jawOffset = isUpper ? 0 : 16 * 3 * 2;
		let buccalOffset = isUpper ? 0 : 16 * 3;
		let lingualOffset = isUpper ? 16 * 3 : 0;
		let innerOffset = parseInt(index) * 3;
		let levels = {
			buccal: [],
			lingual: [],
		};

		for (var i = 0; i < 3; ++i) {
			let buccalIndex = jawOffset + innerOffset + buccalOffset + i;
			let lingualIndex = jawOffset + innerOffset + lingualOffset + i;
			levels.buccal.push(
				extractValue(chart.probingDepths[buccalIndex]) - extractValue(chart.gingivalMargins[buccalIndex])
			);
			levels.lingual.push(
				extractValue(chart.probingDepths[lingualIndex]) - extractValue(chart.gingivalMargins[lingualIndex])
			);
		}
		result[tooth] = levels;
	}
	return result;
}

