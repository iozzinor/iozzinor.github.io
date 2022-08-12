// sui: Simple UI
/**
 * Element module.
 * Handle element creation, DOM manipulation, and so more.
 * @module element
 */

/**
 * Element builder.
 *
 * Store a document element that is beeing configured.
 */
class _ElementBuilder
{
	/**
	 * Create a new builder.
	 */
	constructor(element)
	{
		this._element = element;
	}

	/**
	 * Create a new text node and append it to the element beeing built.
	 * @param {string} content - The content of the new text node.
	 * @return {module:element~_ElementBuilder} The current builder, to allow chained calls.
	 */
	text(content)
	{
		this._element.appendChild(document.createTextNode(content));
		return this;
	}

	/**
	 * Add child node(s) to the element.
	 * Call [_ElementBuilder#build]{@link module:element~_ElementBuilder#build} if needed.
	 * @param {(Array|module:element~_ElementBuilder|Node)} added - The child node(s) to add.
	 * @return {module:element~_ElementBuilder} The current builder, to allow chained calls.
	 */
	add(added)
	{
		if (Array.isArray(added))
			added.forEach(child => _elementBuilderAdd(this, child))
		else
			_elementBuilderAdd(this, added);
		return this;
	}

	/**
	 * Finalize the element build.
	 * @return {Node} The built element.
	 */
	build()
	{
		return this._element;
	}
}

/**
 * Add a child to the element beeing built.
 */
function _elementBuilderAdd(elementBuilder, child)
{
	elementBuilder._element.appendChild(build(child));
}

/**
 * Wrap an element builder in a new proxy.
 * @param {module:element~_ElementBuilder} builder - The builder to be wrapped.
 */
function _createElementBuilderWithProxy(builder)
{
	return new Proxy(builder, {
		get: function(target, property, receiver) {
			//  If the builder (the target) does not have the property and the property is a either an element one or a style one, then return a function updating this property.
			//  This function returns the receiver (i.e. the builder proxy) in order to allow chaining calls.
			if (!Reflect.has(target, property))
			{
				if (Reflect.has(target._element, property))
					return parameter => { target._element[property] = parameter; return receiver; };
				else if (Reflect.has(target._element.style, property))
					return parameter => { target._element.style[property] = parameter; return receiver; };
			}
			// Use the default behaviour to access the property on the target.
			return Reflect.get(...arguments);
		}
	});
}

/**
 * Create a text node.
 */
export function text(content) {
	return document.createTextNode(content);
}

/**
 * Create text nodes.
 *
 * For each encountered linebreak, generate a \<br\/\> node.
 * @param {string} content - The text content.
 * @return {Element[]} The generated text nodes and / or \<br\/\> elements.
 */
export function multilineText(content) {
	let nodes = content.split('\n').flatMap(line => {
		if (line.length < 1)
			return [document.createElement('br')];
		return [document.createTextNode(line), document.createElement('br')]
	});
	nodes.splice(nodes.length - 1);
	return nodes;
}

/**
 * Create a new builder element.
 *
 * @param {string} type - The name of the element tag.
 */
export function create(type)
{
	let builder = new _ElementBuilder(document.createElement(type));
	return _createElementBuilderWithProxy(builder);
}

/**
 * Create a new builder from an existing element.
 * @param {Element} element - The element to alter.
 */
export function from(element)
{
	let builder = new _ElementBuilder(element);
	return _createElementBuilderWithProxy(builder);
}

/**
 * Build a node.
 *
 * If the parameter is a string, then create a new text node.
 * If the parameter is an instance of module:element~_ElementBuilder, then call the build() function.
 * Else, return as is.
 * @param {module:element~_ElementBuilder|Element|string} - The node to be built.
 */
export function build(toBuild) {
	if (typeof toBuild === "string")
		return text(toBuild);
	if (toBuild instanceof _ElementBuilder)
		return toBuild.build();
	return toBuild;
}

/**
 * Remove all children of a node.
 * @param {Element} element - The target HTML element.
 */
export function clearChildren(element) {
	if (element == null || element.children == null) return;
	Array.from(element.children).reverse().forEach(child => child.remove());
}

/**
 * Remove all child nodes of a node.
 * @param {Element} element - The target HTML element.
 */
export function clearChildNodes(element)
{
	if (element == null || element.childNodes == null) return;
	Array.from(element.childNodes).reverse().forEach(child => child.remove());
}

/**
 * Insert nodes into the target node, using a document fragment to insert them all at once.
 * @param {Node} target - The node in which the children will be added.
 * @param {Node[]} children - The child nodes to insert.
 */
export function appendChildren(target, children) {
	let documentFragment = document.createDocumentFragment();
	children.forEach(child => documentFragment.appendChild(child));
	target.appendChild(documentFragment);
}

/**
 * @callback ElementPredicate
 * @param {Node} node - The node to check.
 * @return {boolean} Whether the node has the desired characteristics.
 */

/**
 * Find a node.
 * @param {Node} node - The starting node.
 * @param {module:element~ElementPredicate} matching - The predicate to apply to the nodes.
 * @return {?Node} The first node (the provided node or its closest parent) matching the predicate, or `null` if not found.
 */
export function firstElement(node, matching) {
	let parentNode = node;
	while (parentNode != null) {
		if (matching(parentNode))
			return parentNode;
		parentNode = parentNode.parentElement;
	}
	return null;
}

// -----------------------------------------------------------------------------
// METRICS
// -----------------------------------------------------------------------------
/**
 * Compute the width for a given text using the font of a specific element.
 *
 * @param {Element} element - The HTML element whose font will be used.
 * @param {string} text - The text to render.
 * @return {number} The width of the given text.
 */
export function getTextWidth(element, text)
{
	var canvas = getTextWidth.canvas ?? (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	var font = window.getComputedStyle(element, null).getPropertyValue('font');
	text = (text ?? element.value) + ' ';
	context.font = font;
	var textMeasurement = context.measureText(text);
	return textMeasurement.width;
}

/**
 * Use the input value and placeholders to retrieve the minimum input width.
 * @return {number} The input minimum width.
 */
export function getMinimumInputWidth(input)
{
	return input.value === '' ? getTextWidth(input, input.placeholder): getTextWidth(input, input.value);
}

// -----------------------------------------------------------------------------
// TABLE
// -----------------------------------------------------------------------------
/**
 * Provide function to determine header cells.
 * @see module:element~IsHeaderCell
 */
export class TableHeader
{
	/**
	 * @param {number} headerSize - The number of rows that belong to the header.
	 * @param {number} [offset=0] - Number of offset rows.
	 * @return {module:element~IsHeaderCell}
	 */
	static horizontal(headerSize, offset)
	{
		offset = offset ?? 0;
		return (row, _column) => row > offset - 1 && row < headerSize + offset;
	}

	/**
	 * Define a header for a given amount of rows at the bottom of the table.
	 * @param {number} headerSize - The number of rows the header occupies.
	 * @param {number} rows - The total count of rows in the table.
	 */
	static horizontalBottom(headerSize, rows)
	{
		return (row, _column) => row > rows - headerSize - 1;
	}

	/**
	 * @param {number} headerSize - The number of columns that belong to the header.
	 * @param {number} [offset=0] - Number of offset columns.
	 * @return {module:element~IsHeaderCell}
	 */
	static vertical(headerSize, offset)
	{
		offset = offset ?? 0;
		return (_row, column) => column > offset - 1 && column < headerSize + offset;
	}

	/**
	 * Define a header for a given amount of rows at the right of the table.
	 * @param {number} headerSize - The number of columns the header occupies.
	 * @param {number} columns - The total count of columns in the table.
	 */
	static verticalRight(headerSize, columns)
	{
		return (_row, column) => column > columns - headerSize - 1;
	}
}

/**
 * @callback IsHeaderCell
 * @param {number} row - The row index of the cell.
 * @param {number} column - The column index of the cell.
 * @return {boolean} Whether the cell for at given position is a header one.
 */

/**
 * @callback CreateCellContent
 * @param {*} cellData - The data to be displayed in the cell
 * @param {number} rowIndex - The index of the row for which the content will be created.
 * @param {number} columnIndex - The index of the column for which the content will be created.
 * @return {(Node|Element|module:element~_ElementBuilder|Array)} The cell content.
 */

/**
 * Create a table element builder.
 * Populate the table using the data.
 * If functions to create cell content are not provided, then add a text node using the cell data.
 * @param {Iterator} data - Iterator over the data. The yielded value should also be an iterator.
 * @param {module:element~IsHeaderCell} [IsHeaderCell] - Callback defining whether a cell is a header or a regular one.
 * @param {module:element~CreateCellContent} [createHeaderCellContent] - Function invoked when populating an header cell (tag 'th').
 * @param {module:element~CreateCellContent} [createCellContent] - Function invoked when populating a regular cell (tag 'td').
 * @return {module:element~_ElementBuilder} An element builder for a table, populated using the provided data.
 */
export function createTable(data, isHeaderCell, createHeaderCellContent, createCellContent)
{
	isHeaderCell = isHeaderCell ?? TableHeader.horizontal(1);
	const createHeaderCell =
		createHeaderCellContent === undefined ?
		cellData => create('th').text(cellData) :
		(cellData, row, column) => create('th').add(createHeaderCellContent(cellData, row, column));
	const createCell =
		createCellContent === undefined ?
		cellData => create('td').text(cellData) :
		(cellData, row, column) => create('td').add(createCellContent(cellData, row, column));

	let resultTable = create('table');
	var rowIndex = 0;
	for (let rowData of data)
	{
		let row = create('tr');
		var columnIndex = 0;
		for (let cellData of rowData)
		{
			if (isHeaderCell(rowIndex, columnIndex))
				row.add(createHeaderCell(cellData, rowIndex, columnIndex));
			else
				row.add(createCell(cellData, rowIndex, columnIndex));
			++columnIndex;
		}
		resultTable.add(row);
		++rowIndex;
	}
	return resultTable;
}

/**
 * @callback GetItemElements
 * @param {Element} container - The container that holds the elements.
 * @return {Iterator<Element>} - An iterator over the currently held item elements.
 */
/**
 * @callback RefreshItemElement
 * @param {Element} itemElement - The element representing the item.
 * @param {*} item - The item to be displayed in the element.
 * @param {number} itemIndex - The index of the item to refresh.
 */
/**
 * @callback RefreshItemElementHide
 * @param {Element} itemElement - The element representing the item.
 * @param {boolean} hide - Whether the element should be hidden (`true` for the last item elements when the new items has a greater length than the current items).
 */
/**
 * @callback CreateItemElement
 * @param {*} item - The represented item.
 * @param {number} itemIndex - The index of the item to be created.
 * @return [Element] - The new element, representing the item.
 */
/**
 * @callback AppendItemElement
 * @param {Element} container - The main item elements container.
 * @param {Element} itemElement - The new item element to insert.
 */

/**
 * Refresh a view that is a container for a list of items.
 *
 * @param {Element} container - The container element to be refreshed.
 * @param {Array<*>} items - The items that are displayed by the view, i.e. the container.
 * @param {?module:element~GetItemElements} [getItemElements] - Callback to retrieve the current item elements from a container. By default, query all 'tr' nodes.
 * @param {?module:element~RefreshItemElement} [refreshItemElement] - Update a single item element (the view) using the new item (the model). By default, set the textContent of the element to the String value of the item.
 * @param {?module:element~RefreshItemElementHide} [refreshItemElementHide] - Called for each existing item element view to update the hide property. By default, set the style.hide value to 'none' or ''.
 * @param {?module:element~CreateItemElement} [createItemElement] - When the creation of an item element is needed. By default, create a row that has the item String value has inner text.
 * @param {?module:element~AppendItemElement} [appendItemElement] - Insert a child element in the container. By default, push the new element in the container by calling `appendChild`.
 */
export function refreshContainer(container, items, getItemElements, refreshItemElement, refreshItemElementHide, createItemElement, appendItemElement)
{
	getItemElements        = getItemElements        != undefined ? getItemElements         : container => container.getElementsByTagName('tr');
	refreshItemElement     = refreshItemElement     != undefined ? refreshItemElement      : (element, item) => element.textContent = item.toString();
	refreshItemElementHide = refreshItemElementHide != undefined ? refreshItemElementHide  : (itemElement, hide) => itemElement.style.display = hide ? 'none' : '';
	createItemElement      = createItemElement      != undefined ? createItemElement       : item => create('tr').text(item.toString()).build();
	appendItemElement      = appendItemElement      != undefined ? appendItemElement       : (container, itemElement) => container.appendChild(itemElement);

	let itemElements = getItemElements(container);
	var i = 0;
	for (let itemElement of itemElements)
	{
		if (i < items.length)
			refreshItemElement(itemElement, items[i], i);
		refreshItemElementHide(itemElement, i + 1 > items.length);
		++i;
	}
	for (; i < items.length; ++i)
	{
		let newElement = createItemElement(items[i], i);
		appendItemElement(container, newElement);
	}
}
