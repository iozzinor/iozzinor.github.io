(function(RecurrentDate){
	function computeInterval()
	{
		let startDate = new Date(elements.startDate.value);
		let interval = elements.interval.value;
		let repeatCount = elements.repeatCount.value;

		if (isNaN(startDate))
			return Promise.reject(new Error('The start date is invalid.'));

		if (String(parseInt(interval)) !== interval)
			return Promise.reject(new Error('The interval should be an integer.'));
		interval = parseInt(interval);
		if (interval < 1)
			return Promise.reject(new Error('Please provide a positive integer for the interval.'));

		if (String(parseInt(repeatCount)) !== repeatCount)
			return Promise.reject(new Error('The repeat count should be an integer.'));
		repeatCount = parseInt(repeatCount);
		if (repeatCount < 1)
			return Promise.reject(new Error('Please provide a positive integer for the repeat count.'));

		return Promise.resolve({startDate: startDate, interval: interval, repeatCount: repeatCount});
	}

	function refreshList(interval)
	{
		// set the correct count
		let rows = Array.from(elements.intervalResult.list.querySelectorAll('tr'));
		rows.splice(0, 1);

		let rowsCountDiff = rows.length - interval.repeatCount - 1;
		if (rowsCountDiff < 0)
		{
			for (let i = rowsCountDiff; i < 0; ++i)
			{
				let newRow = createDateRow();
				elements.intervalResult.list.appendChild(newRow);
				rows.push(newRow);
			}
		}
		else if (rowsCountDiff > 0)
		{
			for (let i = rows.length - 1; i > rows.length - rowsCountDiff - 1; --i)
			{
				rows[i].remove();
			}
			rows.splice(rows.length - rowsCountDiff);
		}

		let currentDate = interval.startDate;
		for (let i = 0; i < rows.length; ++i)
		{
			rows[i].className = (i & 1) ? 'odd' : 'even';
			let index = rows[i].querySelector('.index');
			let date = rows[i].querySelector('.date');
			let day = rows[i].querySelector('.day');

			if (i == 1 || i == rows.length - 1 || i % 5 == 0)
				index.classList.remove('temporary');
			else
				index.classList.add('temporary');

			index.innerHTML = i < 1 ? '' : i;
			date.innerHTML = dateToString(currentDate);
			day.innerHTML = DAYS[currentDate.getDay()];

			currentDate.setDate(currentDate.getDate() + interval.interval);
		}
	}

	function createDateRow()
	{
		let row = document.createElement('tr');
		let cells = ['index', 'date', 'day'].map(className => {
			let cell = document.createElement('td');
			cell.className = className;
			return cell;
		});
		for (let cell of cells)
			row.appendChild(cell);
		return row;
	}

	function dateToString(date)
	{
		return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
	}

	let elements = {
		startDate: document.getElementById('start_date'),
		interval: document.getElementById('interval'),
		repeatCount: document.getElementById('repeat_count'),
		intervalResult: {
			container: document.getElementById('interval_result'),
			list: document.getElementById('interval_result_list'),
			errorParagraph: document.getElementById('interval_result_error')
		},
		compute: document.getElementById('compute')
	};

	const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	elements.compute.addEventListener('click', function() {
		computeInterval()
			.then(interval => {
				refreshList(interval);
				elements.intervalResult.list.style.display = '';
				elements.intervalResult.errorParagraph.style.display = 'none';
			})
			.catch(error => {
				elements.intervalResult.list.style.display = 'none';
				elements.intervalResult.errorParagraph.style.display = '';
				elements.intervalResult.errorParagraph.innerHTML = error.message;
			});
	});
}(window.RecurrentDate = window.RecurrentDate || {}));

