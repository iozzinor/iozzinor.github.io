export class ChartGraphComparisonRenderer {
	constructor(referenceAttachmentLevels, comparisonAttachmentLevels) {
        this._referenceAttachmentLevels = referenceAttachmentLevels;
        this._comparisonAttachmentLevels = comparisonAttachmentLevels;
	}

	render(graph, context, positions) {
		context.strokeStyle = 'blue';
		context.lineWidth = 3;
		let groups = generateAttachmentLevelPointGroups(this._referenceAttachmentLevels, graph, positions);
        drawAttachmentLevels(context, groups);

		context.strokeStyle = 'orange';
		context.lineWidth = 1;
		groups = generateAttachmentLevelPointGroups(this._comparisonAttachmentLevels, graph, positions);
        drawAttachmentLevels(context, groups);

        let comparePoints = retrieveComparePoints(this, graph, positions);
        drawComparePoints(context, comparePoints);
	}
}

function generateAttachmentLevelPointGroups(targetAttachmentLevels, graph, positions) {
	let lines = [];
	for (let group of graph.getPresentTeethGroupedByContiguity()) {
		let buccalPoints = [];
		let lingualPoints = [];
		for (let tooth of group) {
			let abscissas = graph.getChartSitesAbscissas(tooth, positions.teethBoxes);

            let attachmentLevels = targetAttachmentLevels[tooth];
            if (attachmentLevels === undefined)
                continue;

			for (const [i, abscissa] of Object.entries(abscissas)) {
                let buccalMillimeter = attachmentLevels.buccal[i];
				let y = graph.convertMillimeterOrdinate(positions, graph._topRowIsBuccal, buccalMillimeter);
				buccalPoints.push({ x: abscissa, y: y });

                let lingualMillimeter = attachmentLevels.lingual[i];
				y = graph.convertMillimeterOrdinate(positions, !graph._topRowIsBuccal, lingualMillimeter);
				lingualPoints.push({ x: abscissa, y: y });
			}
		}
		lines.push(buccalPoints);
		lines.push(lingualPoints);
	}
	return lines;
}

function drawAttachmentLevels(context, attachmentLevelPointGroups) {
    context.beginPath();
    for (let points of attachmentLevelPointGroups) {
        context.moveTo(points[0].x, points[0].y);
        for (let point of points.slice(1))
            context.lineTo(point.x, point.y);
    }
    context.stroke();
}

function retrieveComparePoints(renderer, graph, positions) {
    let comparePoints = {
        better: [],
        worst: [],
    };

    for (let tooth of graph.teeth().filter(tooth => !graph.isToothMissing(tooth))) {
	    let abscissas = graph.getChartSitesAbscissas(tooth, positions.teethBoxes);
        let before = renderer._referenceAttachmentLevels[tooth];
        let after = renderer._comparisonAttachmentLevels[tooth];
        if (after == null)
            continue;
        for (var i = 0; i < 3; ++i) {
            let x = abscissas[i];

            let buccalY = graph.convertMillimeterOrdinate(positions, graph._topRowIsBuccal, after.buccal[i]);
            let buccalPoint = { x: x, y: buccalY };
            let buccalIsBetter = after.buccal[i] <= before.buccal[i];
            if (buccalIsBetter)
                comparePoints.better.push(buccalPoint);
            else
                comparePoints.worst.push(buccalPoint);

            let lingualY = graph.convertMillimeterOrdinate(positions, !graph._topRowIsBuccal, after.lingual[i]);
            let lingualPoint = { x: x, y: lingualY };
            let lingualIsBetter = after.lingual[i] <= before.lingual[i];
            if (lingualIsBetter)
                comparePoints.better.push(lingualPoint);
            else
                comparePoints.worst.push(lingualPoint);
        }
    }
    return comparePoints;
}

function drawComparePoints(context, comparePoints) {
    context.lineWidth = 4;
    context.fillStyle = 'white';

    context.strokeStyle = 'red';
    context.beginPath();
    for (let worstPoint of comparePoints.worst)
    {
        context.moveTo(worstPoint.x, worstPoint.y);
        context.arc(worstPoint.x, worstPoint.y, 3, 0, 2 * Math.PI, false);
    }
    context.stroke();
    context.fill();

    context.strokeStyle = 'green';
    context.beginPath();
    for (let betterPoint of comparePoints.better)
    {
        context.moveTo(betterPoint.x, betterPoint.y);
        context.arc(betterPoint.x, betterPoint.y, 3, 0, 2 * Math.PI, false);
    }
    context.stroke();
    context.fill();
}
