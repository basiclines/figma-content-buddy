import Tracking from 'src/utils/Tracking'
import LEOObject from 'leo/object'

const defaultState = {
	appInit: false
}

let singleton = null
class AppState extends LEOObject {
	constructor() {
		super(Object.assign({}, defaultState))
		if (!singleton) singleton = this
		return singleton
	}

	setAppInit(UUID) {
		Tracking.setup(WP_AMPLITUDE_KEY, UUID)
		this.appInit = true
	}
	
	setAppEmptyState() {
		this.trigger('empty')
	}
	
	setAppRenderState(data) {
		this.trigger('render', data)
	}

	setAppReplacedState(replacement) {
		this.trigger('replaced', replacement)
	}
}
	
export default new AppState()
