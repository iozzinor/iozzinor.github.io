const URL_CHART_CONTENT_PARAM = 'content';
export class ChartUrlHandler {
	constructor(convertChartToUrlValue, extractChartFromUrlValue) {
		this._convertChartToUrlValue = convertChartToUrlValue;
		this._extractChartFromUrlValue = extractChartFromUrlValue;
	}

	generateUrl(currentUrl, chart) {
		let url = new URL(currentUrl);
		let search = new URLSearchParams(url.search);
		search.set(URL_CHART_CONTENT_PARAM, this._convertChartToUrlValue(chart));
		url.search = search;
		return url;
	}

	extractChart(currentUrl) {
		let url = new URL(currentUrl);
		let params = new URLSearchParams(url.search);
		let chartValue = params.get(URL_CHART_CONTENT_PARAM);
		if (chartValue != undefined)
			return this._extractChartFromUrlValue(chartValue);
		return null;
	}
}
