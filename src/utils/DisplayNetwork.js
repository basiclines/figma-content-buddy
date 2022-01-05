let singleton = null
const DAILY_INTERVAL = 86400
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
	
	getAvailableAd(lastShownDate, impressionsCount) {
		return new Promise((resolve, reject) => {
			this.getAds().then(response => {
				response.json().then(ads => {
					
					let availableAds = ads.reduce((prev, current) => {
						if (this.checkImpressionAvailability(lastShownDate, impressionsCount, current)) { return current } 
					}, [])
					
					resolve(availableAds)
				})
			}).catch(error => console.log('Error getAvailableAd', error))
		})
	}
	
	getAdInterval(ad) {
		let interval = 0
		switch (ad.max_impressions_interval) {
				case 'daily': interval = DAILY_INTERVAL
				break;
				case 'weekly': interval = WEEKLY_INTERVAL
				break;
				case 'monthly': interval = MONTHLY_INTERVAL
				break;
		}
		
		return interval
	}
	
	checkImpressionAvailability(lastShownDate, impressionsCount, ad) {
		let adInterval = this.getAdInterval(ad)
		let availableTimeWindow = (!lastShownDate || lastShownDate + adInterval > this.timeStampNow)
		let availableImpressions = (!impressionsCount || impressionsCount < ad.max_impressions_count)
		
		return (availableTimeWindow && availableImpressions)
	}
		
}

export default new DisplayNetwork()
