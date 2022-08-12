import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';

export class SettingsDialog {
	constructor(onApply) {
		this._onApply = onApply;

		let graphScaleFactorRange = Element.create('input').type('range').max('1.0').min('0.3').step('0.01').build();
		let graphScaleFactorSpan = Element.create('span').className('graph-scale-factor_value').build();
		let graphScaleFactorParagraph = Element.create('p').add([
			Element.text('Jaw graphs will be scaled by: '),
			graphScaleFactorSpan,
			Element.text('.'),
		]).build();
		this._elements = {
			graphScaleFactor: {
				range: graphScaleFactorRange,
				span: graphScaleFactorSpan,
				paragraph: graphScaleFactorParagraph,
				factorSpan: graphScaleFactorSpan
			}
		};

		graphScaleFactorRange.addEventListener('input', function(event) {
			graphScaleFactorSpan.textContent = event.target.value;
		});
	}

	show(settings) {
		let graphScaleFactor = settings['graphScaleFactor'];
		this._elements.graphScaleFactor.range.value = graphScaleFactor;
		this._elements.graphScaleFactor.span.textContent = graphScaleFactor;

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

function settingsDialog_onApply(settingsDialog) {
	let newSettings = {
		graphScaleFactor: parseFloat(settingsDialog._elements.graphScaleFactor.range.value),
	};
	settingsDialog._onApply(newSettings);
	return true;
}
