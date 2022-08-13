import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';

const START_DRAG_FILE_MESSAGE = 'Drag a file here!';

export class SingleFileDropTarget {
	constructor(startDragFileMessage, onDrop, onLeave) {
		let dropHint = Element.create('p').text(startDragFileMessage).build();
		let dropTarget = Element.create('div')
			.className('file-opener_drop-target')
			.add(dropHint)
			.build();
		dropTarget.addEventListener('dragover', onDropTargetDragOver.bind(null, dropHint));
		dropTarget.addEventListener('drop', function(event) {
			dropTarget.classList.remove('dragged-over');
			onDrop(event);
		});
		dropTarget.addEventListener('dragleave', function(event) {
			event.target.classList.remove('dragged-over');
			dropHint.textContent = startDragFileMessage;
			onLeave(event);
		});
		this._elements = {
			dropHint: dropHint,
			dropTarget: dropTarget,
		}
	}

	element() {
		return this._elements.dropTarget;
	}

	setHintTextContent(hintTextContent) {
		this._elements.dropHint.textContent = hintTextContent;
	}
}

function onDropTargetDragOver(dropHint, event) {
	event.target.classList.add('dragged-over');
	event.preventDefault();

	if (!('dataTransfer' in event)) {
		dropHint.textContent = 'Oops, it looks like a file is missing.';
		return;
	}
	if (event.dataTransfer.items.length != 1 || event.dataTransfer.items[0].kind != 'file') {
		dropHint.textContent = 'One file exactly is required.';
		return;
	}
	dropHint.textContent = 'Everything looks good so far!';
}

function fileOpener_onDrop(fileOpener, event) {
	if (event.dataTransfer.items.length == 1 && event.dataTransfer.items[0].kind === 'file') {
		fileOpener._singleFileDropTarget.setHintTextContent('Importing file...');
		let file = event.dataTransfer.items[0].getAsFile();
		if (file == null) {
			fileOpener._singleFileDropTarget.setHintTextContent('Could not read the file, please try again.');
		} else {
			fileOpener.close();
			fileOpener._didSelectFile(file);
		}
	} else {
		fileOpener._singleFileDropTarget.setHintTextContent('An error occurred, please try again.');
	}
	event.preventDefault();
}


export class FileOpenerDialog {
	constructor(acceptedFiles, didSelectFile) {
		fileOpener_setupDropTarget(this);
		fileOpener_cacheElements(this, acceptedFiles, this._singleFileDropTarget);
		fileOpener_cacheDialogButtons(this);

		this._dialogId = null;
		this._didSelectFile = didSelectFile;
	}

	show() {
		if (this._dialogId != null)
			this.close();
		this._singleFileDropTarget.setHintTextContent(START_DRAG_FILE_MESSAGE);
		this._dialogId = Dialog.box('Import File')
			.button(this._buttons.cancel)
			.button(this._buttons.done)
			.content(this._elements.content)
			.show();
		fileOpener_updateDoneButtonEnable(this);
	}

	close() {
		if (this._dialogId == null)
			return;
		Dialog.close(this._dialogId);
		this._dialogId = null;
	}
}

function fileOpener_cacheElements(fileOpener, acceptedFiles, singleFileDropTarget) {
	let fileInput = fileOpener_createFileInput(fileOpener, acceptedFiles);
	let content = Element.create('div').className('file-opener_container')
		.add([
			Element.create('p').text('Please select a file to import using the button below, or drag and drop a file!'),
			fileInput,
			singleFileDropTarget.element(),
		])
		.build();
	fileOpener._elements = {
		fileInput: fileInput,
		content: content,
	};
}

function fileOpener_createFileInput(fileOpener, acceptedFiles) {
	let fileInput = createFileInput(acceptedFiles);
	fileInput.addEventListener('change', function(event) {
		fileOpener_updateDoneButtonEnable(fileOpener);
	});
	return fileInput;
}

function fileOpener_setupDropTarget(fileOpener) {
	fileOpener._singleFileDropTarget = new SingleFileDropTarget(START_DRAG_FILE_MESSAGE, fileOpener_onDrop.bind(null, fileOpener), () => {});
}

function fileOpener_cacheDialogButtons(fileOpener) {
	fileOpener._buttons = {
		done: fileOpener_createDoneButton(fileOpener),
		cancel: fileOpener_createCancelButton(fileOpener),
	};
	fileOpener._doneButtonProxy = fileOpener._buttons.done.proxy();
}

function fileOpener_createDoneButton(fileOpener) {
	return Dialog.button('Done')
		.onClick(function() {
			fileOpener._dialogId = null;
			fileOpener._didSelectFile(fileOpener._elements.fileInput.files[0]);
			return true;
		});
}

function fileOpener_createCancelButton(fileOpener) {
	return Dialog.button('Cancel')
		.onClick(function() {
			fileOpener._dialogId = null;
			return true;
		});
}

function fileOpener_createDropZone(fileOpener) {
}

function createFileInput(acceptedFiles) {
	return Element.create('input')
		.type('file')
		.accept(acceptedFiles)
		.build();
}

function fileOpener_updateDoneButtonEnable(fileOpener) {
	fileOpener._doneButtonProxy.setEnabled(fileOpener._elements.fileInput.files.length > 0);
}
