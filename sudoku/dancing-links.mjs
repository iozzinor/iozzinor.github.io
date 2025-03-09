export function solve(booleanGrid) {
	let matrix = new Matrix(booleanGrid);
	let answers = [];
	let answer = [];
	solveRecursive(matrix, answer, answers);
	return answers;
}

function solveRecursive(matrix, partialAnswer, answers) {
	let columnToCover = matrix.findColumnToCover();
	if (columnToCover == null)
		storeCurrentPartialAnswer(matrix, partialAnswer, answers);
	else
		exploreColumn(matrix, partialAnswer, answers, columnToCover);
}

function storeCurrentPartialAnswer(matrix, partialAnswer, answers) {
	answers.push(Array.from(partialAnswer));
}

function exploreColumn(matrix, partialAnswer, answers, columnToCover) {
	matrix.cover(columnToCover);
	exploreColumnThatHasBeenCovered(matrix, partialAnswer, answers, columnToCover);
	matrix.uncover(columnToCover);
}

function exploreColumnThatHasBeenCovered(matrix, partialAnswer, answers, columnToCover) {
	let row = columnToCover.down;
	while (row != columnToCover) {
		partialAnswer.push(row.tag.y);
		exploreCoveredColumnPartialAnswer(matrix, partialAnswer, answers, row);
		partialAnswer.pop();
		row = row.down;
	}
}

function exploreCoveredColumnPartialAnswer(matrix, partialAnswer, answers, row) {
	let columns = [];
	let x = row.right;
	while (x != row) {
		columns.push(x.column);
		x = x.right;
	}
	for (let x of columns)
		matrix.cover(x);
	solveRecursive(matrix, partialAnswer, answers);
	columns.reverse();
	for (let x of columns)
		matrix.uncover(x);
}

class Matrix {
	#header;

	constructor(booleanGrid) {
		this.#header = Matrix_createHeader(booleanGrid);
	}

	findColumnToCover() {
		let minSize = Number.MAX_VALUE;
		let column = this.#header.right;
		let minColumn = null;

		while (column != this.#header) {
			if (column.size < minSize) {
				minColumn = column;
				minSize = column.size;
			}
			column = column.right;
		}
		return minColumn;
	}

	cover(columnCell) {
		if (!columnCell.tag.startsWith('column'))
			throw new Error(columnCell.tag);
		var row = columnCell.down;
		columnCell.right.left = columnCell.left;
		columnCell.left.right = columnCell.right;
		while (row != columnCell) {
			row = row.right;
			while (row.column != columnCell) {
				row.up.down = row.down;
				row.down.up = row.up;
				row.column.size -= 1;
				row = row.right;
			}
			row = row.down;
		}
	}

	uncover(columnCell) {
		if (!columnCell.tag.startsWith('column'))
			throw new Error(columnCell.tag);
		var row = columnCell.up;
		columnCell.right.left = columnCell;
		columnCell.left.right = columnCell;
		while (row != columnCell) {
			row = row.left;
			while (row.column != columnCell) {
				row.up.down = row;
				row.down.up = row;
				row.column.size += 1;
				row = row.left;
			}
			row = row.up;
		}
	}
}

function Matrix_createHeader(booleanGrid) {
	let width = booleanGrid.reduce((acc, row) => Math.max(acc, row.length), 0);
	let height = booleanGrid.length;
	let columnSizes = matrixGetColumnSizes(booleanGrid, width, height);
	let flatGrid = matrixGetFlatGrid(booleanGrid, width, height);

	let columnHeaders = matrixInitializeColumnHeaders(columnSizes);
	let rootHeader = {
		right: columnHeaders[0],
		left: columnHeaders[columnHeaders.length - 1],
		up: null,
		down: null,
	};
	columnHeaders[columnHeaders.length - 1].right = rootHeader;
	columnHeaders[0].left = rootHeader;
	matrixCreateCells(flatGrid, width, height, columnHeaders);
	return rootHeader;
}

function matrixGetColumnSizes(booleanGrid, width, height) {
	let columnSizes = Array(width).fill(0);
	for (let y = 0; y < height; ++y)
		for (let [x, isOne] of Object.entries(booleanGrid[y]))
			if (isOne)
				columnSizes[x] += 1;
	return columnSizes;
}

function matrixGetFlatGrid(booleanGrid, width, height) {
	let result = Array(width * height).fill(false);
	for (let y = 0; y < height; ++y)
		for (let [x, isOne] of Object.entries(booleanGrid[y]))
			if (isOne)
				result[y * width + parseInt(x)] = true;
	return result;
}

function matrixInitializeColumnHeaders(columnSizes) {
	let result = [];
	for (let [columnIndex, size] of Object.entries(columnSizes)) {
		result.push({
			tag: `column-${columnIndex}`,
			up: null,
			down: null,
			right: null,
			left: null,
			size,
		});
	}
	for (let i = 0; i < columnSizes.length; ++i) {
		let nextIndex = (i == columnSizes.length - 1) ? 0 : i + 1;
		result[i].right = result[nextIndex];
		result[nextIndex].left = result[i];
	}
	return result;
}

function matrixCreateCells(flatGrid, width, height, columnHeaders) {
	let cells = Array(width * height).fill(null);
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (!flatGrid[x + y * width])
				continue;
			cells[x + y * width] = {
				tag: {
					x,
					y,
					i: x + y * width,
				},
				up: null,
				down: null,
				right: null,
				left: null,
				column: columnHeaders[x],
			};
		}
	}
	matrixCreateCells_connectRows(flatGrid, width, height, cells);
	matrixCreateCells_connectColumns(flatGrid, width, height, columnHeaders, cells);
}

function matrixCreateCells_connectRows(flatGrid, width, height, cells) {
	for (let y = 0; y < height; ++y)
		matrixCreateCells_connectRow(flatGrid, width, height, cells, y);
}

function matrixCreateCells_connectRow(flatGrid, width, height, cells, row) {
	let cellsToConnect = [];
	for (let x = 0; x < width; ++x)
		if (flatGrid[x + row * width])
			cellsToConnect.push(cells[x + row * width]);
	for (let i = 0; i < cellsToConnect.length; ++i) {
		let nextIndex = (i == cellsToConnect.length - 1 ? 0 : i + 1);
		cellsToConnect[i].right = cellsToConnect[nextIndex];
		cellsToConnect[nextIndex].left = cellsToConnect[i];
	}
}

function matrixCreateCells_connectColumns(flatGrid, width, height, columnHeaders, cells) {
	for (let x = 0; x < width; ++x)
		matrixCreateCells_connectColumn(flatGrid, width, height, columnHeaders, cells, x);
}

function matrixCreateCells_connectColumn(flatGrid, width, height, columnHeaders, cells, column) {
	let cellsToConnect = [columnHeaders[column]];
	for (let y = 0; y < height; ++y)
		if (flatGrid[column + y * width])
			cellsToConnect.push(cells[column + y * width]);
	for (let i = 0; i < cellsToConnect.length; ++i) {
		let nextIndex = (i == cellsToConnect.length - 1 ? 0 : i + 1);
		cellsToConnect[i].down = cellsToConnect[nextIndex];
		cellsToConnect[nextIndex].up = cellsToConnect[i];
	}
}
