import { ToothDimension } from './tooth_dimension.mjs';
import * as ToothNumbers from './tooth_numbers.mjs';
import { ToothCanvasRenderer } from './tooth_canvas_renderer.mjs';

export const JAW = {};
Object.defineProperty(JAW, 'UPPER', { value: 1, writable: false });
Object.defineProperty(JAW, 'LOWER', { value: 2, writable: false });
Object.freeze(JAW);

const BUCCO_LINGUAL_GAP_PIXELS = 20;
const EXTENDED_ROOT_GRADUATION_HEIGHT_MILLIMETERS = 3;

export class ChartGraph {
	constructor(canvas, jaw, computePreferredWidth) {
		switch (jaw)
		{
			case JAW.UPPER:
				this._teeth = Array.from(ToothNumbers.iterateUpperJaw());
				this._topRowIsBuccal = true;
				break;
			case JAW.LOWER:
				this._teeth = Array.from(ToothNumbers.iterateLowerJaw());
				this._topRowIsBuccal = false;
				break;
			default:
				throw new Error('invalid jaw');
		}
		this._missingTeeths = this._teeth.reduce((result, tooth) => {
			result[tooth] = false;
			return result;
		}, {});

		this._canvas = canvas;
		this._computePreferredWidth = computePreferredWidth;
		this._cache = {};
		this._attachedRenderers = [];

		graphs.push(this);
		this.setLoading(true);
	}

	hasTooth(toothNumber) {
		return this._teeth.includes(toothNumber);
	}

	setLoading(loading) {
		if (loading)
			this._canvas.classList.add('loading');
		else
			this._canvas.classList.remove('loading');
	}

	setIsToothMissing(toothNumber, isMissing) {
		if (this.hasTooth(toothNumber))
			this._missingTeeths[toothNumber] = isMissing;
	}

	isToothMissing(toothNumber) {
		if (!this.hasTooth(toothNumber))
			throw new Error(`chart graph does not contain tooth number ${toothNumber}`);
		return this._missingTeeths[toothNumber];
	}

	resize() {
		chartGraph_cacheTeethGeometry(this);
		chartGraph_computeNewSize(this);
		chartGraph_cacheRenderPositions(this);
		this.setLoading(false);
		this.render();
	}

	render() {
		if (!('geometry' in this._cache))
			return;
		chartGraph_render(this);
	}

	toPngImage() {
		return this._canvas.toDataURL('image/png');
	}

	size() {
		return {
			width: this._canvas.width,
			height: this._canvas.height,
		}
	}

	convertMillimeterOrdinate(positions, isTopRow, yMillimeter) {
		if (isTopRow)
			return positions.topCrownAlign - (positions.maxRootHeight * yMillimeter / this._cache.geometry.maxRootHeight);
		else
			return positions.bottomCrownAlign + positions.maxRootHeight * (yMillimeter / this._cache.geometry.maxRootHeight);
	}

	attachRenderer(renderer) {
		this._attachedRenderers.push(renderer);
	}

	teeth() {
		return Array.from(this._teeth);
	}

	getPresentTeethGroupedByContiguity() {
		let groups = [[]];
		for (let tooth of this._teeth) {
			if (!this.isToothMissing(tooth)) {
				groups[groups.length - 1].push(tooth);
			} else if (groups[groups.length - 1].length > 0) {
				groups.push([]);
			}
		}

		if (groups[groups.length - 1].length < 1) {
			groups.splice( groups.length - 1);
		}
		return groups;
	}

	getChartSitesAbscissas(tooth, teethBoxes) {
		const WIDTH_RATIO = 0.8;
		let index = this._teeth.indexOf(tooth);
		let toothBox = teethBoxes[index];
		let gap = toothBox.width * (1 - WIDTH_RATIO) / 2;

		return [
			toothBox.x + gap,
			toothBox.x + toothBox.width / 2,
			toothBox.x + toothBox.width - gap,
		];
	}
}

function chartGraph_computeNewSize(graph) {
	let newWidth = chartGraph_computeWidth(graph);
	chartGraph_resizeHeight(graph, newWidth);
}

function chartGraph_computeWidth(graph) {
	let preferredWidth = graph._computePreferredWidth();
	chartGraph_setWidthPixels(graph, preferredWidth);
	return parseInt(preferredWidth);
}

function chartGraph_setWidthPixels(graph, widthPixels) {
	graph._canvas.style.width = `${widthPixels}px`;
	graph._canvas.parentNode.style.width = `${widthPixels}px`;
	graph._canvas.width = widthPixels;
}

function chartGraph_resizeHeight(graph, newWidth) {
	let newHeight = chartGraph_computeHeight(graph, newWidth);
	chartGraph_setHeightPixels(graph, newHeight);
}

function chartGraph_setHeightPixels(graph, heightPixels) {
	graph._canvas.style.height = `${heightPixels}px`;
	graph._canvas.parentNode.style.height = `${heightPixels}px`;
	graph._canvas.height = heightPixels;
}

function chartGraph_cacheTeethGeometry(graph) {
	if ('geometry' in graph._cache)
		return;
	graph._cache.geometry = chartGraph_computeTeethGeometry(graph);
}

function chartGraph_computeTeethGeometry(graph) {
	let totalWidth = graph._teeth.reduce((total, current) => total + teethDimensions[current].mesioDistal, 0);
	let rootHeights = graph._teeth.map(toothNumber => teethDimensions[toothNumber].rootHeight);
	let crownHeights = graph._teeth.map(toothNumber => teethDimensions[toothNumber].crownHeight);
	let maxRootHeight = rootHeights.reduce((currentMax, currentRootHeight) => Math.max(currentMax, currentRootHeight), -Infinity);
	let maxCrownHeight = crownHeights.reduce((currentMax, currentCrownHeight) => Math.max(currentMax, currentCrownHeight), -Infinity);
	let maxToothHeight = maxRootHeight + maxCrownHeight;
	return {
		totalWidth: totalWidth,
		maxRootHeight: maxRootHeight,
		maxCrownHeight: maxCrownHeight,
		maxToothHeight: maxToothHeight,
	};
}

function chartGraph_computeHeight(graph, newWidth) {
	let normalizedHeightSingleRow = graph._cache.geometry.maxToothHeight;
	let normalizedHeight = 2 * (normalizedHeightSingleRow + EXTENDED_ROOT_GRADUATION_HEIGHT_MILLIMETERS);
	let heightPixels = normalizedHeight * newWidth / graph._cache.geometry.totalWidth;
	return parseInt(heightPixels) + BUCCO_LINGUAL_GAP_PIXELS;
}

function chartGraph_render(graph) {
	let context = graph._canvas.getContext('2d');
	let positions = graph._cache.positions;

	chartGraph_clear(graph, context);
	chartGraph_renderTeeth(graph, context, positions);
	chartGraph_renderRootGraduation(graph, context, positions);
	chartGraph_renderAttachedRenderers(graph, context, positions);
}

function chartGraph_clear(graph, context) {
	let width = graph._canvas.width;
	let height = graph._canvas.height;
	context.clearRect(0, 0, width, height);
}

function chartGraph_cacheRenderPositions(graph) {
	graph._cache.positions = chartGraph_computeRenderPositions(graph);
}

function chartGraph_computeRenderPositions(graph) {
	let unitRatio        = getUnitRatio(graph);
	let maxToothHeight   = graph._cache.geometry.maxToothHeight * unitRatio;
	let maxRootHeight    = graph._cache.geometry.maxRootHeight * unitRatio;
	let maxCrownHeight   = graph._cache.geometry.maxCrownHeight * unitRatio;
	let topCrownAlign    = maxRootHeight + EXTENDED_ROOT_GRADUATION_HEIGHT_MILLIMETERS * unitRatio;
	let bottomCrownAlign = getBottomCrownAlign(graph, maxToothHeight, maxCrownHeight, unitRatio);
	let teethBoxes       = getTeethRenderBoxes(graph, graph._canvas.width, unitRatio, topCrownAlign, bottomCrownAlign);

	return {
		unitRatio: unitRatio,
		maxToothHeight: maxToothHeight,
		maxCrownHeight: maxCrownHeight,
		maxRootHeight: maxRootHeight,
		topCrownAlign: topCrownAlign,
		bottomCrownAlign: bottomCrownAlign,
		teethBoxes: teethBoxes,
	};
}

function chartGraph_renderTeeth(graph, context, positions) {
	for (const [index, box] of Object.entries(positions.teethBoxes))
	{
		let toothIndex = index % graph._teeth.length;
		let toothNumber = graph._teeth[toothIndex];
		let isTopRow = index < graph._teeth.length;
		let targetToothFace = (isTopRow == graph._topRowIsBuccal) ? 'buccal': 'lingual';
		let toothPath = teethPaths.find(path => path.position.number == toothNumber && path.position.face == targetToothFace);

		let renderStyle = {
			flipVertical: (targetToothFace == 'lingual'),
			flipHorizontal: (targetToothFace == 'lingual'),
			isMissing: graph._missingTeeths[toothNumber],
		};

		ToothCanvasRenderer.renderTooth(context, box, toothPath, renderStyle);
	}
}

function getUnitRatio(graph) {
	return graph._canvas.width / graph._cache.geometry.totalWidth;
}

function getBottomCrownAlign(graph, maxToothHeight, maxCrownHeight, unitRatio) {
	return maxToothHeight + BUCCO_LINGUAL_GAP_PIXELS + maxCrownHeight + EXTENDED_ROOT_GRADUATION_HEIGHT_MILLIMETERS * unitRatio;
}

function getTeethRenderBoxes(graph, canvasWidth, unitRatio, topCrownAlign, bottomCrownAlign) {
	let accumulatedSizes = [];
	let accumulatedX = 0;
	for (let tooth of graph._teeth) {
		let toothDimension = teethDimensions[tooth];
		let toothWidth = toothDimension.mesioDistal * unitRatio;
		accumulatedSizes.push({
			x: accumulatedX,
			rootHeight:     toothDimension.rootHeight * unitRatio,
			crownHeight:    toothDimension.crownHeight * unitRatio,
			totalHeight:    toothDimension.totalHeight * unitRatio,
			width: toothWidth,
		});
		accumulatedX += toothWidth;
	}

	let firstRowBoxes = accumulatedSizes.map(size => {
		return {
			x: size.x,
			y: topCrownAlign - size.rootHeight,
			width: size.width,
			height: size.totalHeight,
		};
	});
	let secondRowBoxes = accumulatedSizes.map(size => {
		return {
			x: size.x,
			y: bottomCrownAlign - size.crownHeight,
			width: size.width,
			height: size.totalHeight,
		};
	});
	return [...firstRowBoxes, ...secondRowBoxes];
}

function chartGraph_renderRootGraduation(graph, context, positions) {
	const isLineToMark = line => line.depth > 0 && line.depth % 5 == 0;
	const partitionRootGraduationLines = (lines, filter) => {
		return lines.reduce((acc, line) => {
			let target = filter(line) ? acc[0] : acc[1];
			target.push(line);
			return acc;
		}, [[], []]);
	};

	let lines = chartGraph_getRootGraduationLines(graph, positions);
	const [linesToMark, linesNotToMark] = partitionRootGraduationLines(lines, isLineToMark);
	chartGraph_renderRootGraduationsNotToMark(graph, context, lines.filter(line => !isLineToMark(line)));
	chartGraph_renderRootGraduationsToMark(graph, context, lines.filter(isLineToMark));
}

function chartGraph_getRootGraduationLines(graph, positions) {
	let lines = [];
	const canvasWidth = graph._canvas.width;
	const maxGraduationMillimeters = graph._cache.geometry.maxRootHeight + EXTENDED_ROOT_GRADUATION_HEIGHT_MILLIMETERS;
	const makeGraduationLineAtOrdinate = (canvasWidth, y, depth) => {
		return { start: { x: 0, y: y }, end: { x: canvasWidth, y: y }, depth: depth };
	};
	for (var rootGraduationMillimeter = 0; rootGraduationMillimeter < maxGraduationMillimeters + 1; ++rootGraduationMillimeter) {
		let depth = maxGraduationMillimeters - rootGraduationMillimeter;
		let y = graph.convertMillimeterOrdinate(positions, true, depth);
		lines.push(makeGraduationLineAtOrdinate(canvasWidth, y, depth));
	}
	for (var depth = 0; depth < maxGraduationMillimeters + EXTENDED_ROOT_GRADUATION_HEIGHT_MILLIMETERS + 1; ++depth) {
		let y = graph.convertMillimeterOrdinate(positions, false, depth);
		lines.push(makeGraduationLineAtOrdinate(canvasWidth, y, depth));
	}
	return lines;
}

function chartGraph_renderRootGraduationsNotToMark(graph, context, lines) {
	renderLines(context, lines, {
		stroke: 'lightgray',
		lineWidth: 1,
	});
}

function chartGraph_renderRootGraduationsToMark(graph, context, lines) {
	renderLines(context, lines, {
		stroke: 'black',
		lineWidth: 1,
	});
}

function renderLines(context, lines, style) {
	context.strokeStyle = style.stroke;
	context.lineWidth = style.lineWidth;
	context.beginPath();
	for (let line of lines)
		renderLine(context, line);
	context.stroke();
}

function renderLine(context, line) {
	context.moveTo(line.start.x, line.start.y);
	context.lineTo(line.end.x, line.end.y);
}

function chartGraph_renderAttachedRenderers(graph, context, positions) {
	for (let renderer of graph._attachedRenderers) {
		renderer.render(graph, context, positions);
	}
}

function waitForResizeComplete(resizeCallback, startCallback, delayMilliseconds) {
	if (waitForResizeComplete.timeoutId !== undefined)
	{
		startCallback();
		clearTimeout(waitForResizeComplete.timeoutId);
	}
	waitForResizeComplete.timeoutId = setTimeout(function() {
		delete waitForResizeComplete.timeoutId;
		resizeCallback();
	}, delayMilliseconds);
}

function performResize() {
	for (let graph of graphs) {
		graph.resize();
	}
}

function startResize() {
	for (let graph of graphs) {
		graph.setLoading(true);
	}
}

function setupResizeListener() {
	window.addEventListener('resize', function(event) {
		waitForResizeComplete(performResize, startResize, 1000);
	});
}

function loadTeethDrawResources() {
	return Promise.all([
		fetch('dimensions.json')
			.then(response => response.json()),
		fetch('teeth-paths.json')
			.then(response => response.json())
	])
		.then(resources => {
			const [dimensions, paths] = resources;
			for (const [toothNumber, dimension] of Object.entries(dimensions)) {
				let toothDimension = new ToothDimension(dimension.mesioDistal, dimension.buccoLingual, dimension.crownHeight, dimension.rootHeight);
				teethDimensions[toothNumber] = toothDimension;
			}
			teethPaths = paths;
		});
}

let graphs = [];
let teethDimensions = {};
let teethPaths = {};

setupResizeListener();
loadTeethDrawResources()
	.then(performResize);
