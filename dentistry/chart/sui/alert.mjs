/**
 * Show alert pop up.
 * @module alert
 */

import * as Element from './elements.mjs';

/**
 * A button to add to the alert box.
 * @typedef Button
 * @property {string} title - The button title.
 * @property {string} value - The button value, that will be given to the callback if the button is clicked.
 * @property {?string} className - Class name that will be set for the button element.
 */

/**
 * Callback invoked when the alert selection occurs.
 * @callback OnSelection
 * @param {string} value - The choice.
 */

/**
 * The alert is modal: only one can be displayed at a time.
 */
export class AlertBuilder
{
	/**
	 * @param {?string} title - The alter title.
	 * @param {?string} message - The alter message.
	 */
	constructor(title, message)
	{
		this._title = title ?? '';
		this._message = message ?? '';
		this._buttons = [];
	}

	/**
	 * Update the alert box title.
	 */
	title(title)
	{
		this._title = title ?? '';
		return this;
	}

	/**
	 * Update the alert box message.
	 */
	message(message)
	{
		this._message = message ?? '';
		return this;
	}

	/**
	 * Set the alert callback.
	 * @param {module:alert.OnSelection} onSelection - The function invoked once a button is clicked.
	 */
	onSelection(onSelection)
	{
		this._onSelection = onSelection;
		return this;
	}

	/**
	 * Add a button to the alert.
	 * @param {string|module:alert.Button} button - The button to add.
	 */
	button(button)
	{
		return this.buttons([button]);
	}

	/**
	 * Push buttons.
	 * @param {Array<string|module:alert.Button>} buttons - The buttons to add.
	 */
	buttons(buttons)
	{
		this._buttons.push(...buttons.map(button => {
			if (typeof button === 'string')
				return { title: button, value: button };
			else
			{
				if (button.value == undefined)
					button.value = button.title;
				return button;
			}
		}));
		return this;
	}

	/**
	 * Build and display the alter pop up.
	 */
	run()
	{
		_veil.style.display = '';
		_alert.style.display = '';

		_alert.querySelector('h1.title').textContent = this._title;
		_alert.querySelector('p.message').textContent = this._message;

		if (this._buttons.length < 1)
			this._buttons.push({title: 'Ok', value: 'Ok' });

		let choices = this._buttons.map(button => button.value);

		let buttonsHolder = _alert.querySelector('div.buttons_holder');
		Element.clearChildren(buttonsHolder);
		for (let button of this._buttons) {
			let buttonElement =
				Element.create('span').className('button')
				.add(Element.create('span').className(button.className ?? '').text(button.title))
				.build()

			buttonElement.addEventListener('click', _onAlertButtonClick.bind({choices: choices, onSelection: this._onSelection }));

			buttonsHolder.appendChild(buttonElement);
		}

		_setScrollingEnabled(false);
	}
}

function _onAlertButtonClick(event)
{
	hide();
	if (this.onSelection == undefined) return;
	let holder = event.target.closest('.buttons_holder');
	let button = event.target.closest('.button');
	let buttonIndex = Array.from(holder.querySelectorAll('.button')).indexOf(button);
	this.onSelection(this.choices[buttonIndex]);
}

/**
 * Convenience function to initialize an [AlertBuilder]{@link module:alert.AlterBuilder}.
 */
export function box() { return new AlertBuilder(...arguments); }

/**
 * Hide the current shown alert, if it is displayed.
 */
export function hide()
{
	_veil.style.display = 'none';
	_alert.style.display = 'none';
	_setScrollingEnabled(true);
}

/**
 * Disable scrolling for the body element.
 */
function _setScrollingEnabled(enabled)
{
	if (enabled)
	{
		document.body.style.height = ''
		document.body.style.overflow = '';
	}
	else
	{
		document.body.style.height = '100vh'
		document.body.style.overflow = 'hidden';
	}
}

// init
let _veil = Element.create('div').id('alert_veil').display('none').build();
document.body.appendChild(_veil);
let _alert = Element.create('div').className('alert').display('none')
	.add(Element.create('h1').className('title'))
	.add(Element.create('p').className('message'))
	.add(Element.create('div').className('buttons_holder'))
	.build();
document.body.appendChild(_alert);
