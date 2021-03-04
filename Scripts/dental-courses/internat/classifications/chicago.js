(function(Chicago){
	/**
	 * Update the 'selected' class of a given cell.
	 * If the cell is now selected, remove this attribute from all cells in the same line.
	 */
	function toggleInlineSelection(cell)
	{
		if (cell.classList.contains('selected'))
		{
			cell.classList.remove('selected');
		}
		// remove selection for previous cells in the current row
		// add selection for the new cell
		else
		{
			let parentRow = cell.parentNode;
			parentRow.querySelectorAll('.value').forEach(node => node.classList.remove('selected'));
			cell.classList.add('selected');
		}
	}

	function updateHighestSelection(targetTable, targetHeaderCells, targetCallback)
	{
		targetHeaderCells.forEach(stepHeaderCell => stepHeaderCell.classList.remove('selected'));
		let maxStep = 0;
		targetTable.querySelectorAll('.value').forEach(valueCell => {
			if (valueCell.classList.contains('selected'))
			{
				let parentRow = valueCell.parentNode;
				let currentCellStep = 0;
				let valueCells = Array.from(parentRow.querySelectorAll('.value'));
				for (let iterateValueCell of valueCells)
				{
					let isLastCell = (iterateValueCell == valueCell);
					currentCellStep += (isLastCell ? 1 : iterateValueCell.colSpan);
					if (isLastCell)
						break;
				}

				maxStep = Math.max(maxStep, currentCellStep);
			}
		});
		if (maxStep > 0)
		{
			targetHeaderCells[maxStep - 1].classList.add('selected');
		}

		targetCallback(maxStep);
	}

	let elements = {
		stepTarget: document.getElementById('step_target'),
		stepTable: document.getElementById('steps'),
		gradeTarget: document.getElementById('grade_target'),
		gradeTable: document.getElementById('grades')
	};

	// the number of steps is the number of header cells of the first row
	elements.stepHeaderCells = Array.from(elements.stepTable.querySelector('tr').querySelectorAll('th.classification_entry'));
	elements.gradeHeaderCells = Array.from(elements.gradeTable.querySelector('tr').querySelectorAll('th.classification_entry'));

	// add value listeners
	elements.stepTable.querySelectorAll('.value').forEach(valueCell => {
		valueCell.addEventListener('click', function(event) {
			toggleInlineSelection(event.target);
			updateHighestSelection(elements.stepTable, elements.stepHeaderCells, maxStep => {
				if (maxStep < 1)
				{
					elements.stepTarget.innerHTML = 'Stade : pas de critère';
				}
				else
				{
					elements.stepTarget.innerHTML = 'Stade : ' + maxStep;
				}
			});
		});
	});
	elements.gradeTable.querySelectorAll('.value').forEach(valueCell => {
		valueCell.addEventListener('click', function(event) {
			toggleInlineSelection(event.target);
			updateHighestSelection(elements.gradeTable, elements.gradeHeaderCells, updateGradeLabel);
		});
	});

	function updateGradeLabel(maxStep)
	{
		let grade = '';
		switch (maxStep)
		{
			case 1:
				grade = 'A';
				break;
			case 2:
				grade = 'B';
				break;
			case 3:
				grade = 'C';
				break;
			default:
				grade = 'pas de critère';
				break;
		}
		elements.gradeTarget.innerHTML = 'Grade : ' + grade;
	}
}(window.Chicago = window.Chicago || {}));
