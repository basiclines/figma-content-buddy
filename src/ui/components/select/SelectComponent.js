import './SelectComponent.css'
import Element from 'src/ui/Element'
import 'src/ui/icons/IconShow'
import 'src/ui/icons/IconCheck'

class SelectComponent extends Element {

	toggleList() {
		let list = this.find('[data-select=list]');
		(list.hasAttribute('hidden')) ? list.removeAttribute('hidden') : list.setAttribute('hidden', '')
	}

	selectItem(item) {
		let value = ''
		let group = item.getAttribute('data-group')
		let isToggle = (item.hasAttribute('data-toggle'))

		if (!isToggle) {
			let list = this.findAll(`[data-select=item][data-group=${group}]`)
			value = item.getAttribute('data-value')
			list.forEach(node => node.removeAttribute('selected'))
			item.setAttribute('selected', '')
			if (!this.attrs.label) this.find('[data-select=label]').innerHTML = item.getAttribute('data-label')
		} else {
			let values = JSON.parse(item.getAttribute('data-toggle'))
			let isSelected = (item.hasAttribute('selected'));
			value = (isSelected) ? `${values[0]}` : `${values[1]}`;
			(isSelected) ? item.removeAttribute('selected') : item.setAttribute('selected', '');
		}
		this.toggleList()
		this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: value, group: group } }))
	}

	onClick(e) {
		if (e.target.getAttribute('data-trigger') == 'open') {
			this.toggleList()
		}

		if (e.target.getAttribute('data-select') == 'item') {
			this.selectItem(e.target)
		}
	}

	renderItem(item) {
		let isSelected = (item.hasAttribute('selected'))
		let hasGroup = (item.hasAttribute('group'))
		let hasToggle = (item.hasAttribute('toggle'))
		let toggleValues = (item.getAttribute('toggle'))
		let groupName = item.getAttribute('group')
		let valueAttr = (hasToggle) ? `data-toggle="${toggleValues}"` : `data-value="${item.value}"`;
		let putSeparator = (hasGroup && this.lastGroup != '' && this.lastGroup != groupName)
		if (hasGroup) this.lastGroup = groupName

		return `
			${(putSeparator) ? `<li class="separator"></li>` : ''}
			<li data-select="item" data-group="${groupName || 'default'}" ${valueAttr} data-label="${item.innerText}" ${isSelected ? 'selected' : ''}>
				<i-check class="c-icon"></i-check>
				${item.innerText}
			</li>
		`
	}

	render() {
		this.lastGroup = ''
		let defaults = Array.from(this.findAll('option'))
		let defaultSelection = defaults.reduce((buffer, item) => {
			if (item.hasAttribute('selected')) buffer += item.innerText
			return buffer
		}, '')

		return`
			<button type="button" data-trigger="open">
				<span data-select="label">${ this.attrs.label || defaultSelection || 'Select an option'}</span>
				<i-show class="c-icon default"></i-show>
				<i-show class="c-icon hover"></i-show>
			</button>
			<ul data-select="list" hidden>
				${defaults.reduce((buffer, item) => {
					buffer += this.renderItem(item)
					return buffer
				}, '')}
			</ul>
		`
	}
}

customElements.define('c-select', SelectComponent)
