/**
 * Create a blocking dialog.
 * Handle message boxes that display information to the user.
 * @module dialog
 */
import * as Element from './elements.mjs';

/**
 * A dialog box builder.
 * Configure a box before showing it.
 * Boxes are showed one on top of another.
 */
class _DialogBuilder
{
	/**
	 * @param {string|Element|module:element~_ElementBuilder} title - The text content to be displayed as the box title, or the element to use instead.
	 */
	constructor(title)
	{
		this._id = boxes.map(box => box._id).reduce((previous, currentIndex) => Math.max(previous, currentIndex), 0) + 1;
		boxes.push(this);
		this._container = Element.create('div').className('dialog');

		this._pending = { title: title };
		this._handlers = [];
	}

	/**
	 * Provide a hook to configure the dialog box element.
	 * The callback is called just before the newly created dialog container is added to the document.
	 */
	configureContainer(callback)
	{
		this._configureContainer = callback;
		return this;
	}

	/**
	 * Set the class name of the box container.
	 */
	className(name)
	{
		this._container.className('dialog ' + name);
		return this;
	}

	/**
	 * Register the message to be displayed.
	 */
	message(message)
	{
		this._pending.message = message;
		return this;
	}

	/**
	 * Set the node to be displayed below the message.
	 */
	content(node)
	{
		this._pending.content = node;
		return this;
	}

	/**
	 * Add a button handler.
	 * @param {module:dialog~_Button} handler - The handler to add.
	 * @see {module:dialog~_DialogBuilder.buttons}
	 */
	button(handler)
	{
		this._handlers.push(handler);
		return this;
	}

	/**
	 * Add button handlers to the list.
	 * The last added button will be the rightmost.
	 * @param {Array.<module:dialog~_Button>} handlers - The handlers to add.
	 * @see {module:dialog~button}
	 */
	buttons(handlers)
	{
		this._handlers.push(...handlers);
		return this;
	}

	/**
	 * Set a flag to prevent the default 'Ok' button handler to be used.
	 * The box will need to be programmatically closed, using its id.
	 */
	disableHandlers()
	{
		this._handlersDisabled = true;
		return this;
	}

	/**
	 * @return {number} The id of the created box.
	 */
	show()
	{
		_createBoxContent(this);
		_createBoxButtons(this);

		this._container = this._container.build();

		if (this._configureContainer !== undefined)
		{
			this._configureContainer(this._container);
			delete this._configureContainer;
		}

		document.body.appendChild(this._container);
		this._container.style.zIndex = this._id + 999;
		dialogVeil.style.display = '';
		return this._id;
	}
}

/**
 * Create the box child elements if appropriate: title, message and content container.
 * The content container is always generated as it is set to expand vertically.
 * @param {module:dialog~_DialogBuilder} box - The target box, in which the new elements are added.
 */
function _createBoxContent(box)
{
	// title if present
	if (box._pending.title != null)
	{
		if (typeof box._pending.title === 'string')
			box._container.add(Element.create('h1').text(box._pending.title));
	}
	// message if present
	if (box._pending.message != null)
	{
		if (typeof box._pending.message === 'string')
			box._container.add(Element.create('p').text(box._pending.message));
		else
			box._container.add(box._pending.message);
	}
	let contentContainer = Element.create('div').className('content');
	if (box._pending.content != null)
	{
		if (typeof box._pending.content === 'string')
			contentContainer.add(Element.create('p').text(box._pending.content));
		else
			contentContainer.add(box._pending.content);
	}
	box._container.add(contentContainer);
	delete box._pending;
}

/**
 * Use the provided handlers to create buttons.
 * @param {module:dialog~_DialogBuilder} box - The target box, in which the new buttons are added.
 */
function _createBoxButtons(box)
{
	if (!box._handlersDisabled)
	{
		let boxId = box._id;
		let handlers = box._handlers.length > 0 ? box._handlers : [defaultHandler]
		let buttonsContainer = Element.create('div').className('buttons').add(handlers.map(handler => {
			let button = Element.create('button').text(handler.title).build();
			// add a 'setEnabled' function to the button proxy
			if (handler._proxy != null)
				handler._proxy.setEnabled = enabled => button.disabled = !enabled;
			// set the button initial state to disabled
			if (handler._disabled === true)
				button.disabled = true;
			button.addEventListener('click',
				handler.callback == null ?
				() => close(boxId) :
				(event) => handler.callback(event) !== false ? close(boxId) : {}
			);
			return button;
		}));
		box._container.add(buttonsContainer);
		delete box._handlers;
	}
}

/**
 * Hold information to create a button action.
 * The title will be displayed on the button added at the bottom of the message box.
 * The callback is called when the user presses the button.
 * It dictates whether the box should be closed.
 */
class _Button
{
	/**
	 * Create a new button handler.
	 * @param {string} title - The button title. It will be the text content of the new node.
	 */
	constructor(title)
	{
		this.title = title;
	}

	/**
	 * The callback will be called when the button is clicked.
	 * It if returns `false`, then the box dismiss is prevented.
	 */
	onClick(callback)
	{
		this.callback = callback;
		return this;
	}

	/**
	 * Set the initial button state to disabled.
	 */
	disabled()
	{
		this._disabled = true;
		return this;
	}

	/**
	 * Define a hook to enable or disable the associated button.
	 *
	 * The result is an object.
	 * Once the dialog is shown, this object will have a property 'setEnabled'.
	 * This property will be a function that updates the disabled state of the button.
	 */
	proxy()
	{
		this._proxy = this._proxy ?? {};
		return this._proxy;
	}
}

/**
 * Create a new dialog box builder.
 */
export function box() {
	return new _DialogBuilder(...arguments);
}

/**
 * Create a button handler.
 * @param {string} title - The button title.
 */
export function button(title) {
	return new _Button(title);
}

/**
 * Close the dialog identified by the number.
 * @param {number} id - The unique identifier of the box to close.
 */
export function close(id) {
	let toCloseIndex = boxes.findIndex(box => box._id == id);
	if (toCloseIndex < 0) return;
	let toClose = boxes.splice(toCloseIndex, 1)[0];
	toClose._container.remove();
	if (boxes.length == 0)
		dialogVeil.style.display = 'none';
}

function setupEscapeCloseListener() {
    window.addEventListener('keydown', function(event) {
        if (event.key == 'Escape') {
            let ids = boxes.map(box => box._id);
            ids.forEach(close);
        }
    });
}

let dialogVeil = Element.create('div').id('dialog_veil').display('none').build();
document.body.appendChild(dialogVeil);
let boxes = [];
let defaultHandler = new _Button('Ok');
setupEscapeCloseListener();
