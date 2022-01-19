let singleton = null
const DAILY_INTERVAL = 86400000
const WEEKLY_INTERVAL = DAILY_INTERVAL*7
const MONTHLY_INTERVAL = WEEKLY_INTERVAL*4

class DisplayNetwork {
	
	constructor() {
		this.root = 'https://figma-plugins-display-network.netlify.app/api.json'
		this.timeStampNow = Date.now()
		
		if (!singleton) singleton = this
		return singleton
	}
	
	getAds() {
		return fetch(this.root, { method: 'GET' })
	}
	
	getAvailableAd(lastShownDate, lastShownImpression) {
		return new Promise((resolve, reject) => {
			this.getAds().then(response => {
				response.json().then(ads => {
					
					let availableAds = ads.reduce((prev, current) => {
						if (this.checkImpressionAvailability(parseInt(lastShownDate), parseInt(lastShownImpression), current)) {
							prev.push(current)
						}
						return prev
					}, [])
					
					resolve(availableAds[this.getRandomInt(0, availableAds.length)])
				})
			}).catch(error => console.log('Error getAvailableAd', error))
		})
	}
	
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}
	
	getAdInterval(ad) {
		if (WP_ENV == 'development') return 10000
		
		return parseInt(ad.impression_net_interval)
	}
	
	checkImpressionAvailability(lastShownDate, lastShownImpression, ad) {
		
		let adInterval = this.getAdInterval(ad)
		let availableTimeWindow = (!lastShownDate || lastShownDate + adInterval < this.timeStampNow)
		
		// Check if the ad is optimised for impression rather than time
		if (ad.impression_count) {
			let availableImpression = (lastShownImpression < parseInt(ad.impression_count))
			
			if (availableTimeWindow && availableImpression || !availableTimeWindow && availableImpression) {
				// meanwhile there is impressions left, spend the impression
				return true
			} else
			if (availableTimeWindow && !availableImpression) {
				// when impressions limit is reached and time window is valid, reset the impression
				parent.postMessage({ pluginMessage: { type: 'resetImpression' } }, '*')
				return false
			} else {
				return false
			}
		} else {
			return availableTimeWindow
		}
		
	}
}

export default new DisplayNetwork()
