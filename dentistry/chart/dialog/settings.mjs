import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';

export class SettingsDialog {
	constructor(onApply) {
		this._onApply = onApply;

		let graphScaleFactorRange = Element.create('input').type('range').max('1.0').min('0.3').step('0.01').build();
		let graphScaleFactorParagraph = Element.create('p').build();
		this._elements = {
			graphScaleFactor: {
				range: graphScaleFactorRange,
				paragraph: graphScaleFactorParagraph,
			}
		};

		graphScaleFactorRange.addEventListener('input', function(event) {
			graphScaleFactorParagraph.textContent = generateGraphScaleFactorTextContent(event.target.value);
		});
	}

	show(settings) {
		let graphScaleFactor = settings['graphScaleFactor'];
		this._elements.graphScaleFactor.range.value = graphScaleFactor;
		this._elements.graphScaleFactor.paragraph.textContent = generateGraphScaleFactorTextContent(graphScaleFactor);

		Dialog
			.box('Settings')
			.content([
				Element.create('p').text('Graph Scale Factor'),
				Element.create('div').className('graph-scale-factor').add([
					this._elements.graphScaleFactor.range,
					this._elements.graphScaleFactor.paragraph,
				])
			])
			.button(Dialog.button('Cancel'))
			.button(Dialog.button('Apply').onClick(settingsDialog_onApply.bind(null, this)))
			.show();
	}
}

function generateGraphScaleFactorTextContent(scaleFactor) {
	return `Jaw graphs will be scaled by: ${scaleFactor}.`;
}

function settingsDialog_onApply(settingsDialog) {
	let newSettings = {
		graphScaleFactor: parseFloat(settingsDialog._elements.graphScaleFactor.range.value),
	};
	settingsDialog._onApply(newSettings);
	return true;
}
