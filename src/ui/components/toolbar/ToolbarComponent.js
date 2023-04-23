import './ToolbarComponent.css'
import Router from 'src/utils/Router'
import Tracking from 'src/utils/Tracking'
import Element from 'src/ui/Element'

class ToolbarComponent extends Element {

	beforeMount() {
		this.data.currentView = Router.url
	}

	onClick(e) {
		Tracking.track('clickToolbarLink', { url: event.target.getAttribute('href') })
	}

	bind() {
		super.bind()
		Router.on('change:url', url => this.data.currentView = url)
	}

	render() {
		let currentView = this.data.currentView
		let isIndex = (currentView === Router.routes.index || currentView === '' || typeof currentView === 'undefined')
		let isPreferences = (currentView === Router.routes.preferences)

		return`
			<nav data-select="view">
				<ul data-select="nav">
					<li class="${(isIndex) ? 'active' : ''}"><a href="${Router.routes.index}">Actions</a></li>
					<li class="${(isPreferences) ? 'active' : ''}"><a href="${Router.routes.preferences}">Preferences</a></li>
				</ul>
			</nav>
		`
	}
}

customElements.define('c-toolbar', ToolbarComponent)
