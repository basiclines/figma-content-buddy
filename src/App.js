import 'src/ui/Bulletproof.css'
import 'src/App.css'
import 'src/ui/FigmaUI.css'

import 'src/ui/views/form/FormView'
import Element from 'src/ui/Element'

class ui extends Element {

	render() {
		return`
			<v-form></v-form>
		`
	}
}

customElements.define('root-ui', ui)
