import './FormView.css'
import Element from 'leo/element'
import SelectComponent from 'src/ui/components/select/SelectComponent'
import Tracking from 'src/utils/Tracking'
import AppState from 'src/AppState'

class FormView extends Element {

	get replaceMode() {
		return this.querySelector('#replace_mode')
	}

	get AIReplaceModeNode() {
		return this.querySelector('#ai_replace')
	}

	get selectAndEditPromptNode() {
		return this.querySelector('#select_and_edit_prompt')
	}

	get addOpenAITokenNode() {
		return this.querySelector('#add_openai_token')
	}

	get OpenAITokenNode() {
		return this.querySelector('#openai_token')
	}

	get selectPromptNode() {
		return this.querySelector('#ai_replace_prompt')
	}

	get promptDetailNode() {
		return this.querySelector('#prompt_detail')
	}

	get defaultReplaceModeNode() {
		return this.querySelector('#default_replace')
	}

	mount() {
		this.handleReplaceMode('simple')
		this.handleAddTokenView('')
		AppState.setSelectedPrompt(this.getPrompt('typos'))
	}

	getPrompt(id) {
		let prompts = {
			typos: 'Fix typos on the following text, fixed text should use the same language: ',
			translate: 'Translate to EN: ',
			shorter: 'Make a slightly shorter version of the following text, use the same language as provided: ',
			longer: 'Make a 10% longer version of the following text, longer text should use the same language: ',
			iterate: 'Create an alternative iteration of the following text keeping the same text length and use the same language: '
		}
		return prompts[id]
	}

	bind() {
		// PLUGIN UI CONTROLS
		var empty = document.getElementById('empty')
		var content = document.getElementById('content')
		var check = document.getElementById('free_match_check')
		var free_match = document.getElementById('free_match')
		var unique_match = document.getElementById('unique_match')
		var query = document.getElementById('query')
		var uniques = document.getElementById('uniques')
		var match = document.getElementById('match')
		var replace = document.getElementById('replace')
		var applyDefault = this.defaultReplaceModeNode.querySelector('button')
		var applyAI = this.AIReplaceModeNode.querySelector('[data-trigger="applyReplaceAI"]')

		// Enable/disable free match
		check.addEventListener('change', e => {
			var enabled = check.checked
			if (enabled) {
				unique_match.classList.add('hidden')
				free_match.classList.remove('hidden')
			} else {
				unique_match.classList.remove('hidden')
				free_match.classList.add('hidden')
			}
		})

		// Search box
		query.addEventListener('keydown', e => {
			setTimeout(() => {
				var value = query.value.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				if (value != '') {
					uniques.querySelectorAll('.item').forEach(elem => {
						elem.classList.add('hidden')
						if (elem.getAttribute('key').search(value) != -1) elem.classList.remove('hidden')
					})
				} else {
					uniques.querySelectorAll('.item').forEach(elem => { elem.classList.remove('hidden') })
				}
			}, 25)
		})

		query.addEventListener('click', e => {
			Tracking.track('focusSearch')
		})

		// Click handlers for unique items
		uniques.addEventListener('click', e => {
			if (e.target.nodeName == 'LI') {
				var content = e.target.querySelector('p').textContent
				var idx = parseInt(e.target.getAttribute('idx'))

				if (e.target.classList.contains('selected')) {
					e.target.classList.remove('selected')
					applyDefault.setAttribute('disabled', '')
					applyAI.setAttribute('disabled', '')
					replace.value = ''
					AppState.clearSelection(content)
					parent.postMessage({ pluginMessage: { type: 'restoreSelection', options: idx, content: content } }, '*')
					Tracking.track('unselectContent')
				} else {
					AppState.addSelection(content)
					parent.postMessage({ pluginMessage: { type: 'previewMultipleNodes', options: idx, length: AppState.selection.length } }, '*')
					applyAI.removeAttribute('disabled')
					applyDefault.removeAttribute('disabled')
					Tracking.track('selectContent')
					e.target.classList.add('selected')
				}
			}
		})

		// Apply Default replacements
		applyDefault.addEventListener('click', e => {
			var free_match = check.checked
			if (free_match) {
				parent.postMessage({ pluginMessage: { type: 'freeMatch', options: { match: match.value, replace: replace.value } } }, '*')
			} else {
				if (replace.value !== '' || replace.value === '' && confirm('Replace with empty content?')) {
					AppState.selection.forEach(content => {
						parent.postMessage({ pluginMessage: { type: 'multipleMatch', original: content, result: replace.value } }, '*')
					})
					Tracking.track('clickReplace', { mode: 'default' })
				}
			}
		})

		// Apply AI replacements
		applyAI.addEventListener('click', e => {
			var free_match = check.checked
			if (free_match) {
				parent.postMessage({ pluginMessage: { type: 'freeMatch', options: { match: match.value, replace: replace.value } } }, '*')
			} else {
				applyAI.classList.add('loading')

				let ctx = this
				function sequentialIteration(iteration, limit) {

					// Finish iterations
					if (iteration > limit - 1) {
						applyAI.classList.remove('loading')
						return
					}

					let content = AppState.selection[iteration]
					ctx.requestAIResponse(ctx.promptDetailNode.value, content).then(response => {
						parent.postMessage({ pluginMessage: { type: 'multipleMatch', original: content, result: response } }, '*')
						let counter = ++iteration
						sequentialIteration(counter, limit)
					}).catch(err => {
						let counter = ++iteration
						sequentialIteration(counter, limit)
						console.log('Error fetching AI response: ', err)
					})
				}

				sequentialIteration(0, AppState.selection.length)
				Tracking.track('clickReplace', { mode: 'ai' })
			}
		})

		this.replaceMode.addEventListener('change', e => {
			let mode = e.detail.value
			AppState.setReplacementMode(mode)
		})

		this.selectPromptNode.addEventListener('change', e => {
			let promptId = e.detail.value
			AppState.setSelectedPrompt(this.getPrompt(promptId))
		})

		this.addOpenAITokenNode.querySelector('button').addEventListener('click', e => {
			let token = this.OpenAITokenNode.value
			AppState.setOpenAIToken(token)
		})

		AppState.on('empty', () => { this.displayEmptyState() })
		AppState.on('render', data => { this.renderUniques(data) })
		AppState.on('replaced', (state) => { this.replaceUnique(state) })
		AppState.on('change:replacementMode', mode => { this.handleReplaceMode(mode) })
		AppState.on('change:OpenAIToken', token => { this.handleAddTokenView(token) })
		AppState.on('change:selectedPrompt', prompt => { this.printPrompt(prompt) })
	}

	requestAIResponse(prompt, text) {
		let payload = {
			model: "text-davinci-003",
			prompt: prompt+text,
			max_tokens: 2500,
			temperature: 0
		}

		return new Promise((resolve, reject) => {
			fetch("https://api.openai.com/v1/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${AppState.OpenAIToken}`
				},
				body: JSON.stringify(payload)
			})
			.then(response => response.json())
			.then(data => resolve(data.choices[0].text.trim()))
			.catch(err => reject(err))
		})
	}

	handleAddTokenView(token) {
		if (token == '') {
			this.addOpenAITokenNode.removeAttribute('hidden')
			this.selectAndEditPromptNode.setAttribute('hidden', '')
		} else {
			this.selectAndEditPromptNode.removeAttribute('hidden')
			this.addOpenAITokenNode.setAttribute('hidden', '')
		}
	}

	handleReplaceMode(mode) {
		if (mode == 'simple') {
			this.defaultReplaceModeNode.removeAttribute('hidden')
			this.AIReplaceModeNode.setAttribute('hidden', '')
		} else if (mode == 'ai') {
			this.AIReplaceModeNode.removeAttribute('hidden')
			this.defaultReplaceModeNode.setAttribute('hidden', '')
		}
	}

	printPrompt(prompt) {
		this.promptDetailNode.value = prompt
		Tracking.track('selectPrompt', { prompt: prompt })
	}

	displayEmptyState() {
		var empty = document.getElementById('empty')
		var content = document.getElementById('content')
		content.classList.add('hidden')
		empty.classList.remove('hidden')
	}

	renderUniqueItem(item, idx) {
		var emptyClass = (item.key == ' ') ? 'empty': '';
		var text = (item.key == ' ') ? 'Empty layer': item.key;
		return `
		<li class="item ${emptyClass}" idx="${idx}" key="${item.key.toLowerCase()}">
			<div class="icon icon--recent icon--blue"></div>
			<p class="type type--11-pos" data-render="text">${text}</p>
		</li>
	`
	}

	renderUniques(data) {
		let uniques = document.getElementById('uniques')
		uniques.innerHTML = data.reduce((buffer, item, idx) =>  buffer += this.renderUniqueItem(item, idx),'')
	}

	replaceUnique(state) {
		let replacement = state.replacement
		let original = state.original
		let uniques = document.getElementById('uniques')
		let nodes = uniques.querySelectorAll('.selected')

		nodes.forEach(node => {
			let contentNode = node.querySelector('[data-render=text]')
			if (contentNode.innerHTML == original || original == '') {
				node.setAttribute('key', replacement)
				contentNode.innerHTML = replacement
				AppState.clearSelection(original)
				AppState.addSelection(replacement)
			}
		})
	}

	render() {
		return `
		 <form id="form">
			<section id="empty" class="empty-state hidden">
				<p class="type type--11-pos-bold">
					Empty selection
				</p>
				<p class="type type--11-pos-medium">
					Select some text layers, groups or frames and run Content Buddy again.
				</p>
			</section>

			<section id="content">
				<fieldset class="hidden">
					<label class="switch">
						<div class="switch__container">
							<input id="free_match_check" type="checkbox" class="switch__checkbox">
							<span class="switch__slider"></span>
						</div>
						<div class="switch__label">Free match</div>
					</label>
				</fieldset>

				<fieldset id="unique_match">
					<p class="type type--11-pos-bold">1. Select your content</p>
					<label class="search">
						<div class="icon icon--search"></div>
						<input id="query" type="text" class="input" placeholder="Search content">
					</label>
					<ul class="list" id="uniques"></ul>
				</fieldset>

				<fieldset id="free_match" class="hidden">
					<p class="type type--11-pos-bold">Free match</p>
					<input id="match" type="text" class="input" placeholder="Match content">
				</fieldset>

				<section class="main-actions">
					<p class="type type--11-pos-bold">2. Replacement mode</p>
					<c-select id="replace_mode">
						<option selected value="simple">Simple replace</option>
						<option value="ai">AI replace</option>
					</c-select>

					<fieldset id="default_replace">
						<p class="type type--11-pos-bold">Replace to</p>
						<input id="replace" type="text" class="input" placeholder="New content">
						<button type="button" class="button button--primary" disabled>Replace</button>
					</fieldset>

					<fieldset id="ai_replace" hidden>
						<section id="select_and_edit_prompt">
							<p class="type type--11-pos"><i>Replace your content using one of the available prompts:</i></p>
							<c-select id="ai_replace_prompt">
								<option selected value="typos">Fix typos</option>
								<option value="translate">Translate</option>
								<option value="shorter">Make it shorter</option>
								<option value="longer">Make it longer</option>
								<option value="iterate">Iterate</option>
							</c-select>
							<textarea id="prompt_detail" class="input"></textarea>
							<button type="button" class="button button--primary" data-trigger="applyReplaceAI" disabled>AI Replace</button>
						</section>

						<section id="add_openai_token" hidden>
							<p class="type type--11-pos-bold">Add your OpenAI API Key</p>
							<p class="type type--11-pos">API Key are stored locally. <br/> <a target="_blank" href="https://help.openai.com/en/articles/6614209-how-do-i-check-my-token-usage">How to obtain an API Key?</a></p>
							<input id="openai_token" type="text" class="input" placeholder="Your API key">
							<button type="button" class="button button--primary">Add API key</button>
						</section>
					</fieldset>

				</section>
			</section>
		</form>
		`
	}
}

customElements.define('v-form', FormView)
