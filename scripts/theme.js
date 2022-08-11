(function(Theme){
	function detectTheme()
	{
		let parameters = new URLSearchParams(url.search);
		let theme = parameters.get('theme');

		if (theme != 'light')
		{
			let themeLink = document.createElement('link');
			themeLink.rel = 'stylesheet';
			themeLink.href = '/styles/themes/' + (theme === null ? 'system-default' : theme) + '.css';
			document.head.appendChild(themeLink);
		}

		// update links
		if (theme !== null)
		{
			document.querySelectorAll('a').forEach(link => {
				let currentUrl = new URL(link.href);
				currentUrl.searchParams.set('theme', theme);
				link.href = currentUrl.toString();
			});
			return theme;
		}
		return 'system-default';
	}

	function insertThemePanel(currentTheme)
	{
		let themePanel = document.createElement('div');
		themePanel.className = 'theme_selection';

		let themeButton = document.createElement('button');
		themeButton.className = 'theme_button';
		themeButton.appendChild(document.createTextNode('Thème'));
		themeButton.addEventListener('click', function (event) {
			if (event.target.parentNode.classList.contains('selected'))
				event.target.parentNode.classList.remove('selected');
			else
				event.target.parentNode.classList.add('selected');
		});
		themePanel.appendChild(themeButton);

		let themeList = document.createElement('ul');
		themeList.className = 'theme_list';
		['system-default', 'light', 'dark', 'sepia'].forEach(theme => {
			url.searchParams.set('theme', theme);

			let themeItem = document.createElement('li');

			if (theme == currentTheme)
			{
				themeItem.appendChild(document.createTextNode(theme));
			}
			else
			{
				let themeLink = document.createElement('a');
				themeLink.href = url.toString();
				themeLink.appendChild(document.createTextNode(theme));
				themeItem.appendChild(themeLink);
			}

			themeList.appendChild(themeItem);
		});

		themePanel.appendChild(themeList);

		document.querySelector('header').appendChild(themePanel);
	}

	let url = new URL(window.location.href);
	let currentTheme = detectTheme();
	insertThemePanel(currentTheme);
}(window.Theme = window.Theme || {}));

