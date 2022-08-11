export class ToothDimension {
	constructor(mesioDistal, buccoLingual, crownHeight, rootHeight) {
		this.mesioDistal = mesioDistal;
		this.buccoLingual = buccoLingual;
		this.crownHeight = crownHeight;
		this.rootHeight = rootHeight;
		this.totalHeight = crownHeight + rootHeight;
	}

	getSize(toothFace) {
		switch (toothFace) {
			case TOOTH_FACE.OCCLUSAL:
				return { width: this.mesioDistal, height: this.buccoLingual };
			case TOOTH_FACE.BUCCAL:
				return { width: this.mesioDistal, height: this.totalHeight };
			case TOOTH_FACE.LINGUAL:
				return { width: this.mesioDistal, height: this.totalHeight };
			default:
				throw new Error(`invalid tooth face ${toothFace}`)
		}
	}
}

export const TOOTH_FACE = {};
Object.defineProperty(TOOTH_FACE, 'OCCLUSAL', { value: 1, writable: false });
Object.defineProperty(TOOTH_FACE, 'BUCCAL', { value: 2, writable: false });
Object.defineProperty(TOOTH_FACE, 'LINGUAL', { value: 3, writable: false });
Object.freeze(TOOTH_FACE);

export function getToothFaceIdFromString(toothFaceString) {
	switch (toothFaceString) {
		case 'occlusal':
			return TOOTH_FACE.OCCLUSAL;
		case 'buccal':
			return TOOTH_FACE.BUCCAL;
		case 'lingual':
			return TOOTH_FACE.LINGUAL;
		default:
			throw new Error(`unknown tooth face string ${toothFaceString}`)
	}
}
