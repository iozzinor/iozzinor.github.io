const LOOKUP_TABLE = [
	'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
	'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
	'0','1','2','3','4','5','6','7','8','9','+','/'
];

export function binaryToBase64String(arrayBuffer) {
	let outputLength = outputLengthForBinary(arrayBuffer);
	let outputBlocks = new Array(outputLength);

	let inputView = new Uint8Array(arrayBuffer);
	let fullInputBlocksCount = parseInt(Math.floor(arrayBuffer.byteLength / 3));
	for (var i = 0; i < fullInputBlocksCount; ++i) {
		let inputBlock = inputView.slice(i * 3, (i + 1) * 3 + 1);
		let outputBlock = stringForFullBinaryInputBlock(inputBlock);
		outputBlocks.push(outputBlock);
	}
	if (inputView.length % 3 > 0) {
		let partialInputBlock = inputView.slice(parseInt(inputView.length / 3) * 3);
		let outputBlock = stringForPartialBinaryInputBlock(partialInputBlock);
		outputBlocks.push(outputBlock);
	}
	return outputBlocks.join('');
}

function stringForFullBinaryInputBlock(fullBinaryInputBlock) {
	let aIndex = fullBinaryInputBlock[0] >> 2;
	let bIndex = ((fullBinaryInputBlock[0] & 0b11) << 4) | (fullBinaryInputBlock[1] >> 4);
	let cIndex = ((fullBinaryInputBlock[1] & 0b1111) << 2) | (fullBinaryInputBlock[2] >> 6);
	let dIndex = fullBinaryInputBlock[2] & 0b111111;
	return [aIndex, bIndex, cIndex, dIndex].map(index => LOOKUP_TABLE[index]).join('');
}

function stringForPartialBinaryInputBlock(partialBinaryInputBlock) {
	if (partialBinaryInputBlock.length == 1)
	{
		let aIndex = partialBinaryInputBlock[0] >> 2;
		let bIndex = (partialBinaryInputBlock[0] & 0b11) << 4;
		return [aIndex, bIndex].map(index => LOOKUP_TABLE[index]).join('') + '==';
	}
	else if (partialBinaryInputBlock.length == 2)
	{
		let aIndex = partialBinaryInputBlock[0] >> 2;
		let bIndex = ((partialBinaryInputBlock[0] & 0b11) << 4) | (partialBinaryInputBlock[1] >> 4);
		let cIndex = ((partialBinaryInputBlock[1] & 0b1111) << 2);
		return [aIndex, bIndex, cIndex].map(index => LOOKUP_TABLE[index]).join('') + '=';
	}
	else
		throw new Error(`invalid partial input block length: ${partialBinaryInputBlock.length}`);
}

export function outputLengthForBinary(arrayBuffer) {
	return parseInt(Math.ceil(arrayBuffer.byteLength / 3)) * 4;
}

export function base64StringToBinary(base64String) {
	base64String = base64String.replace(/[=]+$/, '');
	let inputBytes = [...base64String].map(letter => LOOKUP_TABLE.indexOf(letter));
	let resultBytes = []
	while (inputBytes.length > 0) {
		let currentBlock = inputBytes.splice(0, 4);
		switch (currentBlock.length)
		{
		case 4:
			resultBytes.push((currentBlock[0] << 2) | (currentBlock[1] >> 4));
			resultBytes.push(((currentBlock[1] & 0b1111) << 4) | (currentBlock[2] >> 2));
			resultBytes.push(((currentBlock[2] & 0b11) << 6) | currentBlock[3]);
			break;
		case 3:
			resultBytes.push((currentBlock[0] << 2) | (currentBlock[1] >> 4));
			resultBytes.push(((currentBlock[1] & 0b1111) << 4) | (currentBlock[2] >> 2));
			break;
		case 2:
			resultBytes.push((currentBlock[0] << 2) | (currentBlock[1] >> 4));
			break;
		default:
			throw new Error('invalid base64 length');
		}
	}
	return Uint8Array.from(resultBytes).buffer;
}
