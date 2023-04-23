import Element from 'src/ui/Element'

class IconShow extends Element {
	render() {
		return`
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M7.64648 10.3536L4.64648 7.35359L5.35359 6.64648L8.00004 9.29293L10.6465 6.64648L11.3536 7.35359L8.35359 10.3536L8.00004 10.7071L7.64648 10.3536Z" fill="#03121C"/>
			</svg>
	
		`
	}
}

customElements.define('i-show', IconShow)
