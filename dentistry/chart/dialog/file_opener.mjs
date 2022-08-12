import * as Element from '../sui/elements.mjs';
import * as Dialog from '../sui/dialog.mjs';

export class FileOpenerDialog {
	constructor(acceptedFiles, didSelectFile) {
		let self = this;

		this._inputFile = createInputFile(acceptedFiles);
		this._inputFile.addEventListener('change', function(event) {
			fileOpener_updateDoneButtonEnable(self);
		});

		this._doneButton = Dialog.button('Done')
			.onClick(function() {
				self._dialogId = null;
				self._didSelectFile(self._inputFile.files[0]);
				return true;
			})
		;
		this._cancelButton = Dialog.button('Cancel')
			.onClick(function() {
				self._dialogId = null;
				return true;
			});
		this._doneButtonProxy = this._doneButton.proxy();
		this._dialogId = null;
		this._didSelectFile = didSelectFile;
	}

	show() {
		if (this._dialogId != null)
			this.close();
		this._dialogId = Dialog.box('Import File')
			.button(this._cancelButton)
			.button(this._doneButton)
			.content(this._inputFile)
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

function createInputFile(acceptedFiles) {
	return Element.create('input')
		.type('file')
		.accept(acceptedFiles)
		.build();
}

function fileOpener_updateDoneButtonEnable(fileOpener) {
	fileOpener._doneButtonProxy.setEnabled(fileOpener._inputFile.files.length > 0);
}
