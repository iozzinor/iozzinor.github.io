import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';

export class FileOpenerDialog {
	constructor(acceptedFiles, didSelectFile) {
        fileOpener_cacheElements(this, acceptedFiles);
        fileOpener_cacheDialogButtons(this);

		this._dialogId = null;
		this._didSelectFile = didSelectFile;
	}

	show() {
		if (this._dialogId != null)
			this.close();
        this._elements.dropHint.textContent = 'Drag a file here!';
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

function fileOpener_cacheElements(fileOpener, acceptedFiles) {
    let fileInput = fileOpener_createFileInput(fileOpener, acceptedFiles);
    let dropHint = Element.create('p').text('Drag a file here!').build();
    let dropTarget = Element.create('div')
        .className('file-opener_drop-target')
        .add(dropHint)
        .build();
    dropTarget.addEventListener('dragover', onDropTargetDragOver.bind(null, dropHint));
    dropTarget.addEventListener('drop', fileOpener_onDropTargetDragOver.bind(null, fileOpener));
    dropTarget.addEventListener('dragleave', function(event) {
        event.target.classList.remove('dragged-over');
        dropHint.textContent = 'Drag a file here!';
    });
    let content = Element.create('div').className('file-opener_container')
        .add([
            Element.create('p').text('Please select a file to import using the button below, or drag and drop a file!'),
            fileInput,
            dropTarget,
        ])
        .build();
    fileOpener._elements = {
        fileInput: fileInput,
        content: content,
        dropHint: dropHint,
        dropTarget: dropTarget,
    };
}

function onDropTargetDragOver(dropHint, event) {
    event.target.classList.add('dragged-over');
    event.preventDefault();

    if (!('dataTransfer' in event))
    {
        dropHint.textContent = 'Oops, it looks like a file is missing.';
        return;
    }
    if (event.dataTransfer.items.length != 1 || event.dataTransfer.items[0].kind != 'file')
    {
        dropHint.textContent = 'One file exactly is required.';
        return;
    }
    dropHint.textContent = 'Everything looks good!';
}

function fileOpener_onDropTargetDragOver(fileOpener, event) {
    fileOpener._elements.dropTarget.classList.remove('dragged-over');
    if (event.dataTransfer.items.length == 1 && event.dataTransfer.items[0].kind === 'file') {
        fileOpener._elements.dropHint.textContent = 'Importing file...';
        let file = event.dataTransfer.items[0].getAsFile();
        if (file == null) {
            fileOpener._elements.dropHint.textContent = 'Could not read the file, please try again.';
        } else {
            fileOpener.close();
            fileOpener._didSelectFile(file);
        }
    } else {
        fileOpener._elements.dropHint.textContent = 'An error occurred, please try again.';
    }
    event.preventDefault();
}

function fileOpener_createFileInput(fileOpener, acceptedFiles) {
    let fileInput = createFileInput(acceptedFiles);
    fileInput.addEventListener('change', function(event) {
        fileOpener_updateDoneButtonEnable(fileOpener);
    });
    return fileInput;
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
