import * as ToothNumbers from './tooth_numbers.mjs';
import * as Element from './sui/elements.mjs';
import * as InputFilter from './input_filter.mjs';
import * as ProbingDepth from './probing_depth.mjs';

const BUCCO_LINGUAL_POSITION = {
	lingual: 'lingual',
	buccal: 'buccal',
};

export function populateTables(tables, onToothNumberCellClick, onGingivalMarginChange, onProbingDepthChange, onBleedingOnProbingCheck, onPlaqueCheck) {
	createToothNumberRowsAppearingOnTopOfTheTable(tables, onToothNumberCellClick);
	createStatementRows(tables, onGingivalMarginChange, onProbingDepthChange, onBleedingOnProbingCheck, onPlaqueCheck);
	createToothNumberRowsAppearingAtTheBottomOfTheTable(tables, onToothNumberCellClick);
}

function addToothNumberRowToTable(table, numbersIterator, onToothNumberCellClick) {
	Element.from(table).add(createToothNumberRow(numbersIterator, onToothNumberCellClick));
}

function addToothNumberRowToTableWithLeadingEmptyCell(table, numbersIterator, onToothNumberCellClick) {
	let row = createToothNumberRow(numbersIterator, onToothNumberCellClick);
	let label = Element.create('td').className('no_borders').add(Element.create('div').className('spacer')).build();
	row.prepend(label);
	Element.from(table).add(row);
};

function createToothNumberRowsAppearingOnTopOfTheTable(tables, onToothNumberCellClick) {
	createToothNumberRowsForUpperJawBuccalSide(tables, onToothNumberCellClick);
	createToothNumberRowsForLowerJawLingualSide(tables, onToothNumberCellClick);
}

function createToothNumberRowsAppearingAtTheBottomOfTheTable(tables, onToothNumberCellClick) {
	createToothNumberRowsForUpperJawLingualSide(tables, onToothNumberCellClick);
	createToothNumberRowsForLowerJawBuccalSide(tables, onToothNumberCellClick);
}

function createToothNumberRowsForUpperJawBuccalSide(tables, onToothNumberCellClick) {
	createToothNumberRowsUsingIterator(tables.upper.buccal, ToothNumbers.iterateUpperRightQuadrant(), ToothNumbers.iterateUpperLeftQuadrant(), onToothNumberCellClick);
}

function createToothNumberRowsForUpperJawLingualSide(tables, onToothNumberCellClick) {
	createToothNumberRowsUsingIterator(tables.upper.lingual, ToothNumbers.iterateUpperRightQuadrant(), ToothNumbers.iterateUpperLeftQuadrant(), onToothNumberCellClick);
}

function createToothNumberRowsForLowerJawBuccalSide(tables, onToothNumberCellClick) {
	createToothNumberRowsUsingIterator(tables.lower.buccal, ToothNumbers.iterateLowerRightQuadrant(), ToothNumbers.iterateLowerLeftQuadrant(), onToothNumberCellClick);
}

function createToothNumberRowsForLowerJawLingualSide(tables, onToothNumberCellClick) {
	createToothNumberRowsUsingIterator(tables.lower.lingual, ToothNumbers.iterateLowerRightQuadrant(), ToothNumbers.iterateLowerLeftQuadrant(), onToothNumberCellClick);
}

function createToothNumberRowsUsingIterator(targetTables, rightIterator, leftIterator, onToothNumberCellClick) {
	addToothNumberRowToTableWithLeadingEmptyCell(targetTables.right, rightIterator, onToothNumberCellClick);
	addToothNumberRowToTable(targetTables.left, leftIterator, onToothNumberCellClick);
}

function createToothNumberRow(toothNumberIterator, onToothNumberCellClick) {
	let toothRow = Element.create('tr')
		.add(Array.from(toothNumberIterator).map(toothNumber => createToothNumberCell(toothNumber, onToothNumberCellClick)))
		.build();
	return toothRow;
}

function createToothNumberCell(toothNumber, onToothNumberCellClick) {
	let cell = Element
		.create('th')
		.className(`tooth_number tooth_${toothNumber}`)
		.text(`${toothNumber}`)
		.build();
	cell.addEventListener('click', onToothNumberCellClick.bind(null, toothNumber))
	return cell;
}

function createStatementRows(tables, onGingivalMarginChange, onProbingDepthChange, onBleedingOnProbingCheck, onPlaqueCheck) {
	const creators = {
		gingivalMargin:     { rowGenerator: createGingivalMarginRow.bind(null, onGingivalMarginChange), label: 'Gingival Margin' },
		bleedingOnProbing:  { rowGenerator: createBleedingOnProbingRow.bind(null, onBleedingOnProbingCheck), label: 'Bleeding on Probing' },
		probingDepth:       { rowGenerator: createProbingDepthRow.bind(null, onProbingDepthChange), label: 'Probing Depth' },
		plaque:             { rowGenerator: createPlaqueRow.bind(null, onPlaqueCheck), label: 'Plaque' },
	};

	const toothNumberIterators = {
		upper: {
			right: ToothNumbers.iterateUpperRightQuadrant,
			left: ToothNumbers.iterateUpperLeftQuadrant,
		},
		lower: {
			right: ToothNumbers.iterateLowerRightQuadrant,
			left: ToothNumbers.iterateLowerLeftQuadrant,
		}
	};

	const rowsOrder = {
		upper: {
			buccal:     [ 'bleedingOnProbing', 'plaque', 'gingivalMargin', 'probingDepth' ],
			lingual:    [ 'gingivalMargin', 'probingDepth', 'bleedingOnProbing', 'plaque' ],
		},
	};
	rowsOrder.lower = {
		buccal: rowsOrder.upper.lingual,
		lingual: rowsOrder.upper.buccal,
	};

	for (const jaw of ['upper', 'lower']) {
		for (const laterality of ['right', 'left']) {
			for (const buccoLingualPosition of Object.values(BUCCO_LINGUAL_POSITION)) {
				let isRight = laterality == 'right';
				let table = tables[jaw][buccoLingualPosition][laterality];
				let makeToothNumberIterator = toothNumberIterators[jaw][laterality];

				let element = Element.from(table);
				for (let creatorId of rowsOrder[jaw][buccoLingualPosition]) {
					let creator = creators[creatorId];
					let row = creator.rowGenerator(makeToothNumberIterator(), buccoLingualPosition);
					if (isRight) {
						row = wrapRowAddingLeadingCellWithLabel(row, creator.label);
					}
					element
						.add(row);
				}
			}
		}
	}
}

function wrapRowAddingLeadingCellWithLabel(row, label) {
	row = Element.from(row).build();
	let cell = Element.create('td').className('no_borders').add(Element.create('div').text(label)).build();
	row.prepend(cell);
	return row;
}

function generateRow(toothNumberIterator, cellCreator, cellClassName) {
	return Element.create('tr')
		.add(Array.from(toothNumberIterator).map(toothNumber => generateCellWithToothNumber(cellCreator, toothNumber, cellClassName)))
		.build();
}

function generateCellWithToothNumber(cellCreator, toothNumber, cellClassName) {
	return Element.from(cellCreator(toothNumber)).className(`${cellClassName} tooth_${toothNumber}`);
}

function generateRowWithToothSitesCell(toothNumberIterator, cellClassName, toothSiteElementGenerator) {
	return generateRow(toothNumberIterator, toothNumber => {
		return Element.create('td')
			.add(
				Element.create('div').className('container').add(
					ToothNumbers.getToothSitesFromPatientRightToLeft(toothNumber)
						.map(position => toothSiteElementGenerator(toothNumber, position))
				)
			).build();
	}, cellClassName);
}

function createGingivalMarginRow(onGingivalMarginChange, toothNumberIterator, buccoLingualPosition) {
	return generateRowWithToothSitesCell(toothNumberIterator, 'gingival_margin',
		(toothNumber, position) => {
			let gingivalMarginInput = document.createElement('input');
			gingivalMarginInput.id = createToothSiteId('gingival-margin', toothNumber, position, buccoLingualPosition);
			InputFilter.setupInputTextFilter(gingivalMarginInput, InputFilter.ALLOW_LEADING_HYPHENS_REQUIRE_DIGITS);
			gingivalMarginInput.addEventListener('change', event => {
				let sitePosition = `${buccoLingualPosition}-${position}`;
				onGingivalMarginChange(toothNumber, sitePosition, event);
			});
			return gingivalMarginInput;
		});
}

function createProbingDepthRow(onProbingDepthChange, toothNumberIterator, buccoLingualPosition) {
	return generateRowWithToothSitesCell(toothNumberIterator, 'probing_depth',
		(toothNumber, position) => {
			let probingDepthInput = document.createElement('input');
			InputFilter.setupInputTextFilter(probingDepthInput, InputFilter.REQUIRE_DIGITS);
			probingDepthInput.addEventListener('input', function(event) {
				if (ProbingDepth.isUnhealthy(parseInt(event.target.value)))
					event.target.classList.add('unhealthy');
				else
					event.target.classList.remove('unhealthy');
			});

			probingDepthInput.addEventListener('change', event => {
				let sitePosition = `${buccoLingualPosition}-${position}`;
				onProbingDepthChange(toothNumber, sitePosition, event);
			});

			return probingDepthInput;
		});
}

function createBleedingOnProbingRow(onBleedingOnProbingCheck, toothNumberIterator, buccoLingualPosition) {
	return generateRowWithToothSitesCell(toothNumberIterator, 'bleeding_on_probing',
		(toothNumber, position) => {
			return createCheckboxWithInput('bleeding-on-probing', toothNumber, position, buccoLingualPosition, onBleedingOnProbingCheck);
		});
}

function createPlaqueRow(onPlaqueCheck, toothNumberIterator, buccoLingualPosition) {
	return generateRowWithToothSitesCell(toothNumberIterator, 'plaque',
		(toothNumber, position) => {
			return createCheckboxWithInput('plaque', toothNumber, position, buccoLingualPosition, onPlaqueCheck);
		});
}

function createToothSiteId(id_prefix, toothNumber, position, buccoLingualPosition) {
	return `${id_prefix}_${toothNumber}_${position}_${buccoLingualPosition}`;
}

function createCheckboxWithInput(id_prefix, toothNumber, position, buccoLingualPosition, onInputCheck) {
	let id = createToothSiteId(id_prefix, toothNumber, position, buccoLingualPosition);
	let checkbox = Element.create('input').id(id).type('checkbox').build();
	checkbox.addEventListener('change', onInputCheck);
	return Element.create('div').add([
		checkbox,
		Element.create('label').htmlFor(id)
	]);
}

