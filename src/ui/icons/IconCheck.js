import Element from 'src/ui/Element'

class IconCheck extends Element {
	render() {
		return`
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M13.2069 5.20724L7.70694 10.7072L6.99983 11.4144L6.29272 10.7072L3.29272 7.70724L4.70694 6.29303L6.99983 8.58592L11.7927 3.79303L13.2069 5.20724Z" fill="black"/>
			</svg>	
		`
	}
}

customElements.define('i-check', IconCheck)
