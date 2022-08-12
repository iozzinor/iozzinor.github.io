const URL_CHART_CONTENT_PARAM = 'content';

export class ChartUrlCoder {
	constructor(chartUrlComponentCoder) {
		this._coder = chartUrlComponentCoder;
	}

	generateUrl(currentUrl, chart) {
		let url = new URL(currentUrl);
		let search = new URLSearchParams(url.search);
		search.set(URL_CHART_CONTENT_PARAM, this._coder.encode(chart));
		url.search = search;
		return url;
	}

	extractChart(currentUrl) {
		let url = new URL(currentUrl);
		let params = new URLSearchParams(url.search);
		let chartValue = params.get(URL_CHART_CONTENT_PARAM);
		if (chartValue != undefined)
			return this._coder.decode(chartValue);
		return null;
	}
}
