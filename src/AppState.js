import Tracking from 'src/utils/Tracking'
import LEOObject from 'leo/object'

const defaultState = {
	appInit: false,
	replacementMode: 'default',
	selectedPrompt: '',
	OpenAIToken: ''
}

let singleton = null
class AppState extends LEOObject {
	constructor() {
		super(Object.assign({}, defaultState))
		if (!singleton) singleton = this
		return singleton
	}

	setAppInit(UUID, OPENAI_TOKEN) {
		Tracking.setup(WP_AMPLITUDE_KEY, UUID)
		this.appInit = true
		this.OpenAIToken = OPENAI_TOKEN
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

	setReplacementMode(mode) {
		this.replacementMode = mode
	}

	setSelectedPrompt(prompt) {
		this.selectedPrompt = prompt
	}

	setOpenAIToken(token) {
		this.OpenAIToken = token
		parent.postMessage({ pluginMessage: { type: 'savePreference', options: { preference: "OPENAI_TOKEN", value: token } } }, '*')
	}

}

export default new AppState()
