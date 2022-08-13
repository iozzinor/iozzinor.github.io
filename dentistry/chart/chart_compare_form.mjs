import * as Element from './sui/elements.mjs';
import { ChartGraph, JAW } from './chart_graph.mjs';

export class ChartCompareForm {
	constructor(reference, comparision, upperCanvas, lowerCanvas) {
	}
}

export function populateComparisonChartsContainer(comparisonChartsContainer, singleChartContainer, reference, comparison) {
	let backButton = Element
		.create('button')
		.text('Back to Editing')
		.build();
	backButton.addEventListener('click', function() {
		singleChartContainer.style.display = null;
		comparisonChartsContainer.style.display = 'none';
	});

	let container = Element.from(comparisonChartsContainer);
	let upperCanvas = document.createElement('canvas');
	let lowerCanvas = document.createElement('canvas');
	container
		.add([
			backButton,
			Element.create('h1').text('Compare Charts'),
			Element
				.create('div')
				.className('compare-charts_jaw')
				.add([
					Element.create('p').text('Buccal'),
					Element.create('p').text('Palatal'),
					upperCanvas
				]),
			Element
				.create('div')
				.className('compare-charts_jaw')
				.add([
					Element.create('p').text('Lingual'),
					Element.create('p').text('Buccal'),
					lowerCanvas,
				])
		]);

	let upperGraph = new ChartGraph(upperCanvas, JAW.UPPER, () => upperCanvas.clientWidth);
	upperGraph.resize();
	upperGraph.render();

	let lowerGraph = new ChartGraph(lowerCanvas, JAW.LOWER, () => lowerCanvas.clientWidth);
	lowerGraph.resize();
	lowerGraph.render();
}
