import 'src/ui/Bulletproof.css'
import 'src/App.css'
import 'src/ui/FigmaUI.css'

import Tracking from 'src/utils/Tracking'
import 'src/ui/views/form/FormView'
import Element from 'src/ui/Element'

class ui extends Element {

	beforeMount() {
		window.addEventListener('message', (e) => {
			var msg = event.data.pluginMessage
			if (msg.type === 'init') {
				Tracking.setup(WP_AMPLITUDE_KEY, msg.UUID)
				Tracking.track('openPlugin', { selection: msg.selection })
			}
		})
	}

	render() {
		return`
			<v-form></v-form>
		`
	}
}

customElements.define('root-ui', ui)
