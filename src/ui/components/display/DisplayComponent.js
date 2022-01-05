import './DisplayComponent.css'
import Element from 'src/ui/Element'
import DisplayNetwork from 'src/utils/DisplayNetwork'
import Tracking from 'src/utils/Tracking'

class DisplayComponent extends Element {
	
	beforeMount() {
		// avoid display without proper data
		if (this.attrs.lastshowndate == 'undefined' || this.attrs.impressionscount == 'undefined') return
		
		DisplayNetwork.getAvailableAd(this.attrs.lastshowndate, this.attrs.impressionscount)
		.then(ad => {
			// if we have an available ad, then render and display it
			if (!!ad) {
				this.data.ad = ad
				this.showDisplay()
			}
		})
	}
	
	showDisplay() {
		this.removeAttribute('hidden')		
		Tracking.track('displayImpression', { campaign: this.data.ad.tracking })
		parent.postMessage({ pluginMessage: { type: 'displayImpression', impressionsCount: parseInt(this.attrs.impressionscount) } }, '*')
	}
	
	render() {
		if (!this.data.ad) return
		
		let ad = this.data.ad
		return ` 
			<img src="${ad.icon}" />
			<h1>${ad.headline}</h1>
			<p>${ad.description}</p>
			<a href="${ad.link}" target="_blank">${this.data.ad.cta}</p>
		`
	}
}

customElements.define('c-display', DisplayComponent)
