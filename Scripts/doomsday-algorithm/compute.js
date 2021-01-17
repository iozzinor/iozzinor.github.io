(function(DoomsdayAlgorithmCompute){
	function spanWithClass(className, value)
	{
		return '<span class="' + className + '">' + value + '</span>';
	}

	function updateDate()
	{
		elements.date.value = elements.year.value.padStart(4, '0') + '-' + elements.month.value.padStart(2, '0') + '-' + elements.day.value.padStart(2, '0');
		let newDate = new Date(elements.date.value);
		let isValid = !isNaN(newDate);
		setInputError(elements.date, isValid ? '' : 'The date is invalid');
		displayExample(isValid);
	}

	function displayExample(show)
	{
		function exampleValueSpan(value)
		{
			return spanWithClass('example_value', value);
		}

		function codeConstantSpan(value)
		{
			return spanWithClass('code-constant', value);
		}

		Object.values(elements.example).forEach(element => element.innerHTML = '');
		Object.values(elements.lookup).forEach(lookupTable => {
			lookupTable.querySelectorAll('tr').forEach(row => row.classList.remove('example_value'));
		});
		if (show)
		{
			// year
			let year = parseInt(elements.year.value);
			let yearHigh = parseInt(parseInt(year) / 100);
			let yearLow = (year % 100);
			elements.example.yearHigh.innerHTML = ' = ' + exampleValueSpan(year) + ' / ' + codeConstantSpan(100) + ' = ' + exampleValueSpan(yearHigh);
			elements.example.yearLow.innerHTML = ' = ' + exampleValueSpan(year) + ' % ' + codeConstantSpan(100) + ' = ' + exampleValueSpan(yearLow);
			let yearLookupRows = Array.from(elements.lookup.year.querySelectorAll('tr'));
			yearLookupRows[yearHigh % 4 + 1].classList.add('example_value');

			let a = YEAR_LOOKUP[yearHigh % 4];
			let b = parseInt(yearLow / 12);
			let c = (yearLow % 12);
			let d = parseInt(c / 4);
			let yearAnchor = (a + b + c + d) % 7;
			elements.example.a.innerHTML = ' = ' + exampleValueSpan(a);
			elements.example.b.innerHTML = ' = ' + exampleValueSpan(yearLow) + ' / ' + codeConstantSpan(12) + ' = ' + exampleValueSpan(b);
			elements.example.c.innerHTML = ' = ' + exampleValueSpan(yearLow) + ' % ' + codeConstantSpan(12) + ' = ' + exampleValueSpan(c);
			elements.example.d.innerHTML = ' = ' + exampleValueSpan(c) + ' / ' + codeConstantSpan(4) + ' = ' + exampleValueSpan(d);
			elements.example.yearAnchor.innerHTML = ' = (' + [a, b, c, d].map(exampleValueSpan).join(' + ') + ') % ' + codeConstantSpan(7) + ' = ' + exampleValueSpan(yearAnchor);

			// month
			let month = parseInt(elements.month.value);
			let monthLookupRows = Array.from(elements.lookup.month.querySelectorAll('tr'));
			monthLookupRows[month].classList.add('example_value');
			let isLeapYear = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0);
			elements.example.leapYear.innerHTML = exampleValueSpan(year) + ' is ' + (isLeapYear ? '' : 'not ') + ' a leap year.';
			let monthAnchor = MONTH_LOOKUP[month];
			if (isLeapYear && month < 3) monthAnchor = month == 1 ? 4 : 1;

			// day
			let day = parseInt(elements.day.value);
			let weekDayCode = (yearAnchor + day - monthAnchor) % 7;
			if (weekDayCode < 0) weekDayCode += 7;
			elements.example.weekDayCode.innerHTML = ' = (' + exampleValueSpan(yearAnchor) + ' + ' + exampleValueSpan(day) + ' - ' +  exampleValueSpan(monthAnchor) + ') % ' + codeConstantSpan(7) + ' = ' +  exampleValueSpan(weekDayCode);
			let dayLookupRows = Array.from(elements.lookup.day.querySelectorAll('tr'));
			dayLookupRows[weekDayCode + 1].classList.add('example_value');

			// week day
			let now = new Date();
			let target = new Date(elements.date.value);
			elements.example.weekDay.innerHTML = 'It ' + (target < now ? 'was' : 'is') + ' a ' + exampleValueSpan(WEEK_DAY[weekDayCode]) + '.';
		}
	}

	function setInputError(input, error)
	{
		input.parentNode.parentNode.querySelector('.error').innerHTML = error;
	}

	let elements = {
		date: document.getElementById('date'),
		day: document.getElementById('day'),
		month: document.getElementById('month'),
		year: document.getElementById('year'),
		example: {
			yearHigh: document.getElementById('doomsday_example-year_high'),
			yearLow: document.getElementById('doomsday_example-year_low'),
			a: document.getElementById('doomsday_example-a'),
			b: document.getElementById('doomsday_example-b'),
			c: document.getElementById('doomsday_example-c'),
			d: document.getElementById('doomsday_example-d'),
			yearAnchor: document.getElementById('doomsday_example-year_anchor'),
			leapYear: document.getElementById('doomsday_example-leap_year'),
			weekDayCode: document.getElementById('doomsday_example-week_day_code'),
			weekDay: document.getElementById('doomsday_example-week_day')
		},
		lookup: {
			year: document.getElementById('year_lookup_table'),
			month: document.getElementById('month_lookup_table'),
			day: document.getElementById('day_lookup_table')
		}
	};

	elements.date.addEventListener('change', function (event) {
		let currentDate = new Date(event.target.value);
		if (isNaN(currentDate))
		{
			setInputError(elements.date, 'The date is invalid');
			elements.day.value = '';
			elements.month.value = '';
			elements.year.value = '';
			displayExample(false);
			return;
		}
		setInputError(event.target, '');
		setInputError(elements.day, '');
		setInputError(elements.month, '');
		setInputError(elements.year, '');

		elements.day.value = currentDate.getDate();
		elements.month.value = currentDate.getMonth() + 1;
		elements.year.value = currentDate.getFullYear();

		displayExample(true);
	});

	const YEAR_LOOKUP = { '0': 2, '1': 0, '2': 5, '3': 3 };
	const MONTH_LOOKUP = { '1': 3, '2': 7, '3': 7, '4': 4, '5': 2, '6': 6, '7': 4, '8': 1, '9': 5, '10': 3, '11': 7, '12': 5 };
	const WEEK_DAY = { '0': 'sunday', '1': 'monday', '2': 'tuesday', '3': 'wednesday', '4': 'thursday', '5': 'friday', '6': 'saturday' };

	elements.day.addEventListener('input', function (event) {
		let newDay = parseInt(event.target.value);
		updateDate();
		if (event.target.value.length == 0)
			setInputError(elements.day, 'The day is empty');
		else if (newDay < 1)
			setInputError(elements.day, 'The day can not be lower than 1.');
		else
			setInputError(elements.day, '');
	});
	elements.month.addEventListener('input', function (event) {
		let newMonth = parseInt(event.target.value);
		updateDate();
		if (event.target.value.length == 0)
			setInputError(elements.month, 'The month is empty.');
		else if (newMonth < 1)
			setInputError(elements.month, 'The month can not be lower than 1.');
		else if (newMonth > 12)
			setInputError(elements.month, 'The month can not be greater than 12.');
		else
			elements.month.parentNode.parentNode.querySelector('.error').innerHTML = '';
			setInputError(elements.month, '');
	});
	elements.year.addEventListener('input', function (event) {
		let newYear = parseInt(event.target.value);
		updateDate();
		if (event.target.value.length == 0)
			setInputError(elements.year, 'The year is empty.');
		else if (newYear < 1)
			setInputError(elements.year, 'The year can not be lower than 1.');
		else
			setInputError(elements.year, '');
	});
}(window.DoomsdayAlgorithmCompute = window.DoomsdayAlgorithmCompute || {}));
