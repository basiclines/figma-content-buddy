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
	
	getAvailableAd(lastShownDate) {
		return new Promise((resolve, reject) => {
			this.getAds().then(response => {
				response.json().then(ads => {
					
					let availableAds = ads.reduce((prev, current) => {
						if (this.checkImpressionAvailability(parseInt(lastShownDate), current)) {
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
		if (WP_ENV == 'development') return 1000
		
		let interval = 0
		switch (ad.impressions_interval) {
				case 'daily': interval = DAILY_INTERVAL
				break;
				case 'weekly': interval = WEEKLY_INTERVAL
				break;
				case 'monthly': interval = MONTHLY_INTERVAL
				break;
		}
		
		return interval
	}
	
	checkImpressionAvailability(lastShownDate, ad) {
		let adInterval = this.getAdInterval(ad)
		let availableTimeWindow = (!lastShownDate || lastShownDate + adInterval < this.timeStampNow)
		
		return availableTimeWindow
	}
		
}

export default new DisplayNetwork()
