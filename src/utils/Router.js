import LEOObject from 'leo/object'

let singleton = null
class Router extends LEOObject {
	constructor() {
		super()
		this.url = window.location.hash
		this.history = []
		this.routes = {}
		this.bind()

		if (!singleton) singleton = this
		return singleton
	}

	get root() { return '' }

	updateURLBar(url) {
		window.location.hash = url
	}

	appendToHistory(url) {
		this.history.push(url)
	}

	navigate(url) {
		this.appendToHistory(url)
		this.updateURLBar(url)
		this.url = url
	}

	bind() {
		window.addEventListener('hashchange', (e) => this.url = window.location.hash)
	}
}

export default new Router()
