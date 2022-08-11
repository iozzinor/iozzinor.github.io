export const ALLOW_LEADING_HYPHENS_REQUIRE_DIGITS = text => {
    let isNegative = text.startsWith('-');
    text = REQUIRE_DIGITS(text);
    return (isNegative ? '-' : '') + text;
};

export const REQUIRE_DIGITS = text => {
	return text.replace(/[^0-9]/g, '');
};

export function setupInputTextFilter(targetInput, textFilter) {
    targetInput.addEventListener('input', function(event) {
		event.target.value = textFilter(event.target.value);
    });
    targetInput.addEventListener('paste', function(event) {
        event.target.value = textFilter(event.clipboardData.getData('text'));
        event.preventDefault();
        event.stopPropagation();
        return false;
    });
}
