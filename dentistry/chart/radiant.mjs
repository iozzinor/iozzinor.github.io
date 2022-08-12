export function setupClickListeners() {
	for (let radiant of document.querySelectorAll('.radiant')) {
		radiant.addEventListener('click', function(event) {
			event.target.classList.add('clicked');
			setTimeout(() => event.target.classList.remove('clicked'), 7500);
		});
	}
}
