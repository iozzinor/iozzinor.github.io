import * as b64 from '/scripts/base64.mjs';
import * as ChartBinaryCoder from './binary.mjs';

export class ChartUrlComponentCoder {
	encode(chart) {
		let binary = ChartBinaryCoder.makeBinary(chart);
		return b64.binaryToBase64String(binary);
	}

	decode(urlComponent) {
		let binary = b64.base64StringToBinary(urlComponent);
		return ChartBinaryCoder.createFromBinary(binary);
	}
}
