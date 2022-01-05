import 'src/ui/Bulletproof.css'
import 'src/App.css'
import 'src/ui/FigmaUI.css'

import Tracking from 'src/utils/Tracking'
import 'src/ui/views/form/FormView'
import 'src/ui/components/display/DisplayComponent'
import Element from 'src/ui/Element'

class ui extends Element {

	beforeMount() {
		window.addEventListener('message', (e) => {
			var msg = event.data.pluginMessage
			if (msg.type === 'init') {
				Tracking.setup(WP_AMPLITUDE_KEY, msg.UUID)
				Tracking.track('openPlugin', { selection: msg.selection })
				this.insertDisplay(msg.AD_LAST_SHOWN_DATE, msg.AD_IMPRESSIONS_COUNT)
			}
		})
	}
	
	insertDisplay(lastShownDate, impressionsCount) {
		let elem = document.createElement('c-display')
		elem.setAttribute('lastshowndate', lastShownDate)
		elem.setAttribute('impressionscount', impressionsCount)				
		elem.setAttribute('hidden', '')				
		this.insertBefore(elem, this.find('v-form'))
	}

	render() {
		return`
			<v-form></v-form>
		`
	}
}

customElements.define('root-ui', ui)
