function onLocationHashChange()
{
	// remove previous highlight if any
	let previous = document.querySelector('.highlighted_definition');
	if (previous !== null)
		previous.classList.remove('highlighted_definition');

	// apply new highlight if possible
	let definitionId = window.location.hash.substr(1);
	if (definitionId.length < 1) return;
	let displayedDefinition = document.getElementById(window.location.hash.substr(1));
	if (displayedDefinition !== null)
		displayedDefinition.classList.add('highlighted_definition');
}

window.addEventListener('hashchange', function() {
	onLocationHashChange();
});

onLocationHashChange();
