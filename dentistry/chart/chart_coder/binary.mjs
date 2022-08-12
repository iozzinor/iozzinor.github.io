export let SECTION_VERSIONS = {};
Object.defineProperty(SECTION_VERSIONS, 'PATIENT_LAST_NAME',    { value: 1, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'PATIENT_FIRST_NAME',   { value: 2, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'PRACTITIONER',         { value: 3, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'DATE',                 { value: 4, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'FOLLOW_TYPE',          { value: 5, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'GINGIVAL_MARGINS',     { value: 6, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'PROBING_DEPTHS',       { value: 7, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'BLEEDING_ON_PROBING',  { value: 8, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'PLAQUE',               { value: 9, writable: false });
Object.defineProperty(SECTION_VERSIONS, 'MISSING_TEETH',        { value: 10, writable: false });
Object.freeze(SECTION_VERSIONS);

export function makeBinary(chart) {
	const sections = [
		[ SECTION_VERSIONS.PATIENT_LAST_NAME, makePatientLastNameSection ],
		[ SECTION_VERSIONS.PATIENT_FIRST_NAME, makePatientFirstNameSection ],
		[ SECTION_VERSIONS.PRACTITIONER, makePractitionerSection ],
		[ SECTION_VERSIONS.DATE, makeDateSection ],
		[ SECTION_VERSIONS.FOLLOW_TYPE, makeFollowTypeSection ],
		[ SECTION_VERSIONS.GINGIVAL_MARGINS, makeGingivalMarginsSection ],
		[ SECTION_VERSIONS.PROBING_DEPTHS, makeProbingDepthsSection ],
		[ SECTION_VERSIONS.BLEEDING_ON_PROBING, makeBleedingOnProbingSection ],
		[ SECTION_VERSIONS.PLAQUE, makePlaqueSection ],
		[ SECTION_VERSIONS.MISSING_TEETH, makeMissingTeethSection ],
	];
	let binarySections = sections.map(([version, makeSection]) => {
		let binary = makeSection(chart);
		return [version, binary];
	});
	let totalSize = binarySections.reduce((total, section) => total + section[1].byteLength + 1, 0);

	let index = 0;
	let resultBuffer = new ArrayBuffer(totalSize);
	let resultView = new Uint8Array(resultBuffer);
	for (const [version, binary] of binarySections) {
		resultView[index] = version;
		index += 1;

		let binaryView = new Uint8Array(binary);
		for (var i = 0; i < binary.byteLength; ++i) {
			resultView[index + i] = binaryView[i];
		}
		index += binary.byteLength;
	}
	return resultBuffer;
}

function makePatientLastNameSection(chart) {
	return convertStringToBinary(chart.patient.lastName);
}

function makePatientFirstNameSection(chart) {
	return convertStringToBinary(chart.patient.firstName);
}

function makePractitionerSection(chart) {
	return convertStringToBinary(chart.practitioner);
}

function makeDateSection(chart) {
	return convertStringToBinary(chart.date);
}

function makeFollowTypeSection(chart) {
	return convertStringToBinary(chart.followType);
}

function convertStringToBinary(string) {
	let bytes = [string.length];
	for (var i = 0; i < string.length; ++i)
		bytes.push(string.charCodeAt(i));
	return Uint16Array.from(bytes).buffer;
}

function makeGingivalMarginsSection(chart) {
	let result = new ArrayBuffer(192);
	let view = new Int8Array(result);
	for (const [index, gingivalMargin] of Object.entries(chart.gingivalMargins))
		view[index] = createGingivalMarginByte(gingivalMargin);
	return result;
}

const createGingivalMarginByte = (gingivalMargin) => {
	return (gingivalMargin == null || Number.isNaN(gingivalMargin)) ? -128 : gingivalMargin;
};

function makeProbingDepthsSection(chart) {
	let result = new ArrayBuffer(192);
	let view = new Uint8Array(result);
	for (const [index, probingDepth] of Object.entries(chart.probingDepths))
		view[index] = createProbingDepthByte(probingDepth);
	return result;
}

const createProbingDepthByte = (probingDepth) => {
	return (probingDepth == null || Number.isNaN(probingDepth)) ? 0xFF : probingDepth;
};

function makeBleedingOnProbingSection(chart) {
	let result = new ArrayBuffer(24);
	let view = new Uint8Array(result);
	for (var i = 0; i < chart.plaque.length; ++i) {
		let byteIndex = parseInt(i / 8);
		let bitIndex = i % 8;
		let currentBleedingOnProbing = chart.bleedingOnProbing[i] == '1';
		if (currentBleedingOnProbing)
			view[byteIndex] |= 1 << (8 - bitIndex - 1);
	}
	return result;
}

function makePlaqueSection(chart) {
	let result = new ArrayBuffer(24);
	let view = new Uint8Array(result);
	for (var i = 0; i < chart.plaque.length; ++i) {
		let byteIndex = parseInt(i / 8);
		let bitIndex = i % 8;
		let currentPlaque = chart.plaque[i] == '1';
		if (currentPlaque)
			view[byteIndex] |= 1 << (8 - bitIndex - 1);
	}
	return result;
}

function makeMissingTeethSection(chart) {
	let encoded = [...chart.missingTeeth].reduce((result, current) => (result << 1) | (current == '1' ? 1 : 0), 0);
	return Uint32Array.from([encoded]).buffer;
}

export function createFromBinary(binary) {
	let resultChart = {};
	let restoreSections = {};
	restoreSections[SECTION_VERSIONS.PATIENT_LAST_NAME] = restorePatientLastName;
	restoreSections[SECTION_VERSIONS.PATIENT_FIRST_NAME] = restorePatientFirstName;
	restoreSections[SECTION_VERSIONS.PRACTITIONER] = restorePractitioner;
	restoreSections[SECTION_VERSIONS.DATE] = restoreDate;
	restoreSections[SECTION_VERSIONS.FOLLOW_TYPE] = restoreFollowType;
	restoreSections[SECTION_VERSIONS.GINGIVAL_MARGINS] = restoreGingivalMargins;
	restoreSections[SECTION_VERSIONS.PROBING_DEPTHS] = restoreProbingDepths;
	restoreSections[SECTION_VERSIONS.BLEEDING_ON_PROBING] = restoreBleedingOnProbing;
	restoreSections[SECTION_VERSIONS.PLAQUE] = restorePlaque;
	restoreSections[SECTION_VERSIONS.MISSING_TEETH] = restoreMissingTeeth;

	let view = new Uint8Array(binary);
	let index = 0;
	while (index < view.length) {
		let currentSectionVersion = view[index];
		if (!(currentSectionVersion in restoreSections))
			break;
		let restoreFunction = restoreSections[currentSectionVersion];
		index += 1 + restoreFunction(resultChart, view, index + 1);
	}
	return resultChart;
}

function restorePatientLastName(resultChart, view, index) {
	const [readBytes, lastName] = readStringFromBinary(view, index);
	if (!('patient' in resultChart))
		resultChart.patient = {};
	resultChart.patient.lastName = lastName;
	return readBytes;
}

function restorePatientFirstName(resultChart, view, index) {
	const [readBytes, firstName] = readStringFromBinary(view, index);
	if (!('patient' in resultChart))
		resultChart.patient = {};
	resultChart.patient.firstName = firstName;
	return readBytes;
}

function restorePractitioner(resultChart, view, index) {
	const [readBytes, practitioner] = readStringFromBinary(view, index);
	resultChart.practitioner = practitioner;
	return readBytes;
}

function restoreDate(resultChart, view, index) {
	const [readBytes, date] = readStringFromBinary(view, index);
	resultChart.date = date;
	return readBytes;
}

function restoreFollowType(resultChart, view, index) {
	const [readBytes, followType] = readStringFromBinary(view, index);
	resultChart.followType = followType;
	return readBytes;
}

function readStringFromBinary(view, index) {
	const mergeTwoBytes = (first, second) => {
		let buffer = Uint8Array.from([first, second]).buffer;
		return (new Uint16Array(buffer))[0];
	};

	let result = '';
	let stringLength = mergeTwoBytes(view[index], view[index+1]);
	for (var i = 0; i < stringLength; ++i) {
		let first = view[index + 2 + i * 2];
		let second = view[index + 2 + i * 2 + 1];
		let charCode = mergeTwoBytes(first, second);
		result += String.fromCharCode(charCode);
	}
	return [stringLength * 2 + 2, result];
}

function restoreGingivalMargins(resultChart, view, index) {
	let gingivalMargins = [];
	let slice = view.slice(index, index + 192);
	let signedView = Int8Array.from(slice);
	for (var i = 0; i < 192; ++i)
		gingivalMargins[i] = gingivalMarginFromByte(signedView[i]);
	resultChart.gingivalMargins = gingivalMargins;
	return 192;
}

const gingivalMarginFromByte = (gingivalMarginByte) => {
	return gingivalMarginByte == -128 ? null : gingivalMarginByte;
};

function restoreProbingDepths(resultChart, view, index) {
	resultChart.probingDepths = [];
	for (var i = 0; i < 192; ++i)
		resultChart.probingDepths[i] = probingDepthFromByte(view[index + i]);
	return 192;
}

const probingDepthFromByte = (probingDepthByte) => {
	return probingDepthByte == 0xFF ? null : probingDepthByte;
};

function restoreBleedingOnProbing(resultChart, view, index) {
	let bleedingOnProbing = '';
	for (var i = 0; i < 24; ++i) {
		for (var j = 0; j < 8; ++j) {
			let bit = (view[index+i] >> (8 - j - 1)) & 1;
			bleedingOnProbing += (bit == 1 ? '1' : '0');
		}
	}
	resultChart.bleedingOnProbing = bleedingOnProbing;
	return 24;
}

function restorePlaque(resultChart, view, index) {
	let plaque = '';
	for (var i = 0; i < 24; ++i) {
		for (var j = 0; j < 8; ++j) {
			let bit = (view[index+i] >> (8 - j - 1)) & 1;
			plaque += (bit == 1 ? '1' : '0');
		}
	}
	resultChart.plaque = plaque;
	return 24;
}

function restoreMissingTeeth(resultChart, view, index) {
	let missingTeeth = '';
	let slice = view.slice(index, index + 4);
	let buffer = new Uint32Array(Uint8Array.from(slice).buffer);
	for (var i = 0; i < 32; ++i) {
		let bit = (buffer[0] >> (32 - i - 1)) & 1;
		missingTeeth += (bit == 1 ? '1' : '0');
	}
	resultChart.missingTeeth = missingTeeth;
	return 4;
}
