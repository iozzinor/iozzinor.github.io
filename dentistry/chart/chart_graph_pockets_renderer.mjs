import * as ToothNumbers from './tooth_numbers.mjs';

export class ChartGraphPocketsRenderer {
	constructor(teeth) {
		this._teeth = teeth;
		this._chartSites = teeth.reduce((result, tooth) => {
			result[tooth] = {
				'buccal-distal':    { gingivalMargin: 0, probingDepth: 0 },
				'buccal-middle':    { gingivalMargin: 0, probingDepth: 0 },
				'buccal-mesial':    { gingivalMargin: 0, probingDepth: 0 },
				'lingual-distal':   { gingivalMargin: 0, probingDepth: 0 },
				'lingual-middle':   { gingivalMargin: 0, probingDepth: 0 },
				'lingual-mesial':   { gingivalMargin: 0, probingDepth: 0 },
			};
			return result;
		}, {});
	}

	hasTooth(toothNumber) {
		return this._teeth.includes(toothNumber);
	}

	setGingivalMargin(toothNumber, sitePosition, gingivalMargin) {
		if (this.hasTooth(toothNumber))
		{
			let chartSite = this._chartSites[toothNumber];
			if (sitePosition in chartSite)
				chartSite[sitePosition].gingivalMargin = gingivalMargin;
		}
	}

	setProbingDepth(toothNumber, sitePosition, probingDepth) {
		if (this.hasTooth(toothNumber))
		{
			let chartSite = this._chartSites[toothNumber];
			if (sitePosition in chartSite)
				chartSite[sitePosition].probingDepth = probingDepth;
		}
	}

	render(graph, context, positions) {
		let teethGroups = graph.getPresentTeethGroupedByContiguity();
		let pockets = chartGraphPocketsRenderer_computePockets(this, graph, positions, teethGroups);
		for (let pocket of pockets)
			chartGraphPocketsRenderer_renderPocket(this, graph, context, pocket);
	}
}

function chartGraphPocketsRenderer_computePockets(renderer, graph, positions, teethGroups) {
	let result = [];
	for (let group of teethGroups) {
		let buccalGroup = [];
		let lingualGroup = [];
		for (let tooth of group) {
			let abscissas = graph.getChartSitesAbscissas(tooth, positions.teethBoxes);
			let newBuccalPocketPoints = chartGraphPocketsRenderer_getBucalPocketPoints(renderer, graph, positions, tooth, abscissas);
			buccalGroup.push(...newBuccalPocketPoints);
			let newLingualPocketPoints = chartGraphPocketsRenderer_getLingualPocketPoints(renderer, graph, positions, tooth, abscissas);
			lingualGroup.push(...newLingualPocketPoints);
		}
		result.push(buccalGroup);
		result.push(lingualGroup);
	}

	return result;
}

function chartGraphPocketsRenderer_getBucalPocketPoints(renderer, graph, positions, tooth, abscissas) {
	let sites = ToothNumbers.getToothSitesFromPatientRightToLeft(tooth);
	let chartSites = sites.map(site => renderer._chartSites[tooth][`buccal-${site}`]);
	let isTopRow = graph._topRowIsBuccal;
	return Object.entries(chartSites).map(([index, chartSite]) => {
		let abscissa = abscissas[index];
		return chartGraphPocketsRenderer_convertChartSiteToPocketPoint(renderer, graph, positions, isTopRow, chartSite, abscissa);
	});
}

function chartGraphPocketsRenderer_getLingualPocketPoints(renderer, graph, positions, tooth, abscissas) {
	let sites = ToothNumbers.getToothSitesFromPatientRightToLeft(tooth);
	let chartSites = sites.map(site => renderer._chartSites[tooth][`lingual-${site}`]);
	let isTopRow = !graph._topRowIsBuccal;
	return Object.entries(chartSites).map(([index, chartSite]) => {
		let abscissa = abscissas[index];
		return chartGraphPocketsRenderer_convertChartSiteToPocketPoint(renderer, graph, positions, isTopRow, chartSite, abscissa);
	});
}

function chartGraphPocketsRenderer_convertChartSiteToPocketPoint(renderer, graph, positions, isTopRow, chartSite, abscissa) {
	let gingivalMargin = chartSite.gingivalMargin == null ? 0 : chartSite.gingivalMargin;
	let probingDepth = chartSite.probingDepth == null ? 0 : chartSite.probingDepth;
	let attachmentLevel = probingDepth - gingivalMargin;

	return {
		gingivalMargin: graph.convertMillimeterOrdinate(positions, isTopRow, -gingivalMargin),
		attachmentLevel: graph.convertMillimeterOrdinate(positions, isTopRow, attachmentLevel),
		x: abscissa,
	}
}

function chartGraphPocketsRenderer_renderPocket(renderer, graph, context, pocketPoints) {
	chartGraphPocketsRenderer_renderPocketPolygon(renderer, graph, context, pocketPoints);
	chartGraphPocketsRenderer_renderAttachmentLevelLine(renderer, graph, context, pocketPoints);
	chartGraphPocketsRenderer_renderGingivalMarginLine(renderer, graph, context, pocketPoints);
	chartGraphPocketsRenderer_renderPocketDots(renderer, graph, context, pocketPoints);
}

function chartGraphPocketsRenderer_renderGingivalMarginLine(renderer, graph, context, pocketPoints) {
	let points = pocketPoints.map(pocketPoint => {
		return {
			x: pocketPoint.x,
			y: pocketPoint.gingivalMargin,
		};
	});
	chartGraphPocketsRenderer_renderSegments(renderer, context, 'red', 4, points);
}

function chartGraphPocketsRenderer_renderAttachmentLevelLine(renderer, graph, context, pocketPoints) {
	let points = pocketPoints.map(pocketPoint => {
		return {
			x: pocketPoint.x,
			y: pocketPoint.attachmentLevel,
		};
	});
	chartGraphPocketsRenderer_renderSegments(renderer, context, 'blue', 4, points);
}

function chartGraphPocketsRenderer_renderPocketPolygon(renderer, graph, context, pocketPoints) {
	if (pocketPoints.length < 1)
		return;
	let attachmentLevelPoints = pocketPoints.map(pocketPoint => {
		return {
			x: pocketPoint.x,
			y: pocketPoint.attachmentLevel,
		};
	});
	let gingivalMarginPoints = pocketPoints.map(pocketPoint => {
		return {
			x: pocketPoint.x,
			y: pocketPoint.gingivalMargin,
		};
	}).reverse();

	context.fillStyle = 'rgba(0,0,255,0.5)';
	context.beginPath();
	context.moveTo(attachmentLevelPoints[0].x, attachmentLevelPoints[0].y);
	for (let point of [...attachmentLevelPoints.slice(1), ...gingivalMarginPoints]) {
		context.lineTo(point.x, point.y);
	}
	context.fill();
}

function chartGraphPocketsRenderer_renderPocketDots(renderer, graph, context, pocketPoints) {
	context.lineWidth = 4;
	context.fillStyle = 'white';

	context.strokeStyle = 'blue';
	context.beginPath();
	for (let pocketPoint of pocketPoints) {
		context.moveTo(pocketPoint.x, pocketPoint.attachmentLevel);
		context.arc(pocketPoint.x, pocketPoint.attachmentLevel, 3, 0, 2 * Math.PI, false);
	}
	context.stroke();
	context.fill();

	context.strokeStyle = 'red';
	context.beginPath();
	for (let pocketPoint of pocketPoints) {
		context.moveTo(pocketPoint.x, pocketPoint.gingivalMargin);
		context.arc(pocketPoint.x, pocketPoint.gingivalMargin, 3, 0, 2 * Math.PI, false);
	}
	context.stroke();
	context.fill();
}

function chartGraphPocketsRenderer_renderSegments(renderer, context, strokeStyle, lineWidth, points) {
	if (points.length < 1)
		return;
	context.lineWidth = lineWidth;
	context.strokeStyle = strokeStyle;
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	for (var i = 1; i < points.length; ++i) {
		context.lineTo(points[i].x, points[i].y);
	}
	context.stroke();
}

