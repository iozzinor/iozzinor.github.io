export class ToothCanvasRenderer {
	static renderTooth(targetCanvasContext, targetToothRect, toothPath, style) {
		renderToothShapes(targetCanvasContext, targetToothRect, toothPath.shapes, style);
		targetCanvasContext.setLineDash([]);
	}
}

function makePointConvertorFromStyle(style) {
	let pointAdptors = [];
	if (style != undefined)
	{
		if (style.flipVertical)
			pointAdptors.push(flipVertically);
		if (style.flipHorizontal)
			pointAdptors.push(flipHorizontally);
	}

return (point, rect) => {
		point = convertNormalizePoint(point, rect);
		pointAdptors.forEach(adpator => adpator(point, rect));
		return point;
	};
}

function convertNormalizePoint(point, rect) {
	return {
		x: rect.x + point.x * rect.width,
		y: rect.y + point.y * rect.height,
	}
}

function flipVertically(point, rect) {
	point.y = rect.height - (point.y - rect.y) + rect.y;
}

function flipHorizontally(point, rect) {
	point.x = rect.width - (point.x - rect.x) + rect.x;
}

function renderToothShapes(targetCanvasContext, targetToothRect, shapes, style) {
	const convertPoint = makePointConvertorFromStyle(style);

	let isMissing = style !== undefined && style.isMissing;

	targetCanvasContext.strokeStyle = isMissing ? 'lightgray' : 'black';
	targetCanvasContext.lineWidth = isMissing ? 1 : 2;
	targetCanvasContext.setLineDash(isMissing ? [5, 5] : []);
	targetCanvasContext.beginPath();
	for (let shape of shapes) {
		for (let curve of shape) {
			if (curve.controls.length == 2) {
				let start    = convertPoint(curve.start, targetToothRect);
				let control1 = convertPoint(curve.controls[0], targetToothRect);
				let control2 = convertPoint(curve.controls[1], targetToothRect);
				let end      = convertPoint(curve.end, targetToothRect);

				targetCanvasContext.moveTo(start.x, start.y);
				targetCanvasContext.bezierCurveTo(
					control1.x,
					control1.y,
					control2.x,
					control2.y,
					end.x,
					end.y,
				);
			} else {
				console.error(`invalid number of control points: ${curve.controls.length}`);
			}
		}
	}
	targetCanvasContext.stroke();
}
