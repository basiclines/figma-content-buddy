import UAParser from 'ua-parser-js'

const UUIDKey = 'UUID'
let singleton = null

class Tracking {
	constructor() {
		this.root = 'https://api.amplitude.com/httpapi'
		this.apiKey = ''
		this.userId = ''
		this.userProps = {}
		this.UUID = ''
		this.UA = ''
		this.parser = new UAParser()

		if (!singleton) singleton = this
		return singleton
	}

	createUUID(a) {
		// See: https://github.com/amplitude/Amplitude-Javascript/blob/master/src/uuid.js
		var uuid = function(a) {
			return a           // if the placeholder was passed, return
				? (              // a random number from 0 to 15
					a ^            // unless b is 8,
					Math.random()  // in which case
					* 16           // a random number from
					>> a / 4         // 8 to 11
				).toString(16) // in hexadecimal
				: (              // or otherwise a concatenated string:
					[1e7] +        // 10000000 +
					-1e3 +         // -1000 +
					-4e3 +         // -4000 +
					-8e3 +         // -80000000 +
					-1e11          // -100000000000,
				).replace(     // replacing
					/[018]/g,    // zeroes, ones, and eights with
					uuid         // random hex digits
				);
		}
		return uuid()
	}

	setup(apiKey, UUID) {
		this.apiKey = apiKey
		this.UUID = UUID
		this.UA = this.parser.getResult()
	}

	track(event, props) {
		if (WP_ENV == 'development') return console.log(event, props || {})

		let evtObj = {
			user_id: this.userId,
			device_id: this.UUID,
			event_type: event,
			os_name: this.UA.os.name,
			os_version: this.UA.os.version,
			platform: `${this.UA.browser.name} ${this.UA.browser.major}`,
			language: navigator.language,
			user_properties: this.userProps,
			event_properties: props,
			time: Math.floor(Date.now())
		}

		var data = new FormData()
		data.append( "api_key", this.apiKey)
		data.append( "event", JSON.stringify(evtObj))

		fetch(this.root, {
			method: 'POST',
			body: data
		})
	}
	
}

export default new Tracking()
