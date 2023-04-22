import 'src/ui/Bulletproof.css'
import 'src/App.css'
import 'src/ui/FigmaUI.css'


import AppState from 'src/AppState'
import Tracking from 'src/utils/Tracking'
import 'src/ui/views/form/FormView'
import 'src/ui/components/display/DisplayComponent'
import Element from 'src/ui/Element'

class ui extends Element {

	beforeMount() {
		window.addEventListener('message', (e) => {
			var msg = event.data.pluginMessage

			// init events
			if (msg.type === 'init') {
				AppState.setAppInit(msg.UUID, msg.OPENAI_TOKEN)
				Tracking.track('openPlugin', { selection: msg.selection })
				this.insertDisplay(msg.AD_LAST_SHOWN_DATE, msg.AD_LAST_SHOWN_IMPRESSION)
			} else
			if (msg.type === 'init-empty') {
				AppState.setAppInit(msg.UUID)
				AppState.setAppEmptyState()
				Tracking.track('openPlugin', { selection: msg.selection })
			}

			// state trigger events
			if (msg.type === 'render') {
				AppState.setAppRenderState(msg.uniques)
			} else
			if (msg.type === 'replaced') {
				AppState.setAppReplacedState(msg.replacement)
			} else
			if (msg.type === 'multipleReplaced') {
				AppState.setAppReplacedState(msg.replacement, msg.original)
			}
		})
	}

	insertDisplay(lastShownDate, lastShownImpression) {
		let elem = document.createElement('c-display')
		elem.setAttribute('lastshowndate', lastShownDate)
		elem.setAttribute('lastshownimpression', lastShownImpression)
		elem.setAttribute('hidden', '')
		this.insertBefore(elem, this.find('v-form'))
	}

	removeDisplay() {
		this.find('c-display').setAttribute('hidden')
	}

	render() {
		return`
			<v-form></v-form>
		`
	}
}

customElements.define('root-ui', ui)
