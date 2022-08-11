export class FileSaver {
	static download(fileName, blob) {
		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(blob, fileName);
		} else {
			let downloadLink = document.createElement('a');
			let url = URL.createObjectURL(blob);
			document.body.appendChild(downloadLink);
			downloadLink.href = url;
			downloadLink.download = fileName;
			downloadLink.addEventListener('click', function() {
				downloadLink.remove();
			});

			downloadLink.click();
		}
	}
}
