import './DisplayComponent.css'
import Element from 'src/ui/Element'
import DisplayNetwork from 'src/utils/DisplayNetwork'
import Tracking from 'src/utils/Tracking'

const PLUGIN_NAME = 'content_buddy'

class DisplayComponent extends Element {
	
	beforeMount() {
		// avoid display without proper data
		if (this.attrs.lastshowndate == 'undefined') return
		
		DisplayNetwork.getAvailableAd(this.attrs.lastshowndate, this.attrs.lastshownimpression)
		.then(ad => {
			// if we have an available ad, then render and display it
			if (!!ad) {
				ad.link = ad.link + '&utm_campaign='+PLUGIN_NAME
				this.data.ad = ad
				this.showDisplay()
			}
		})
	}
	
	showDisplay() {
		this.removeAttribute('hidden')		
		Tracking.track('displayImpression', { campaign: this.data.ad.tracking })
		parent.postMessage({ pluginMessage: { type: 'displayImpression' } }, '*')
	}
	
	bind() {
		this.addEventListener('click', e => {
			if (e.target.getAttribute('data-trigger') == 'cta') {
				Tracking.track('displayClick', { campaign: this.data.ad.tracking })
			}
		})
	}
	
	render() {
		if (!this.data.ad) return
		
		let ad = this.data.ad
		return ` 
			<em>Sponsored</em>
			<picture><img src="${ad.icon}" /></picture>
			<section>
				<h1>${ad.headline}</h1>
				<p>${ad.description}</p>
				<a data-trigger="cta" href="${ad.link}" target="_blank">${this.data.ad.cta}</a>
			</section>
		`
	}
}

customElements.define('c-display', DisplayComponent)
