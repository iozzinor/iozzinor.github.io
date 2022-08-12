const DEFAULT_SETTINGS_SET = {
	graphScaleFactor: 1.0,
};
const ALLOWED_KEYS = Array.from(Object.keys(DEFAULT_SETTINGS_SET));

export class Settings {
	static fromLocalStorage() {
		return new Settings(new LocalStorageProvider(DEFAULT_SETTINGS_SET));
	}

	constructor(settingsProvider) {
		this._provider = settingsProvider;
	}

	getGraphScaleFactor() {
		return this._provider.get('graphScaleFactor');
	}

	setGraphScaleFactor(newScaleFactor) {
		this._provider.set('graphScaleFactor',  parseFloat(newScaleFactor));
	}

	toObject() {
		return Array.from(Object.keys(DEFAULT_SETTINGS_SET)).reduce((result, key) => {
			result[key] = this._provider.get(key);
			return result;
		}, {});
	}

	setObject(newSettingsObject) {
		for (const [key, value] of Object.entries(newSettingsObject)) {
			if (!ALLOWED_KEYS.includes(key))
				continue;
			this._provider.set(key, value);
		}
	}
}

class LocalStorageProvider {
	constructor(defaultSet) {
		for (const [key, value] of Object.entries(defaultSet)) {
			if (localStorage.getItem(key) === null)
				localStorage.setItem(key, value);
		}
	}

	get(key) {
		return localStorage.getItem(key);
	}

	set(key, value) {
		localStorage.setItem(key, value);
	}
}
