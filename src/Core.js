import Tracking from 'src/utils/Tracking'

var orderedUniques = []
var previewNodes = []
var initialSelection = figma.currentPage.selection.slice(0)
var initMessage = {}

// Obtain UUID then trigger init event
Promise.all([
	figma.clientStorage.getAsync('UUID'),
	figma.clientStorage.getAsync('AD_LAST_SHOWN_DATE')
]).then(promisesData => {
	
	let UUID = promisesData[0]
	let AD_LAST_SHOWN_DATE = promisesData[1] || Date.now()

	if (!UUID) {
		UUID = Tracking.createUUID()
		figma.clientStorage.setAsync('UUID', UUID)
	}

	initMessage = {
		type: 'init',
		UUID: UUID,
		AD_LAST_SHOWN_DATE: AD_LAST_SHOWN_DATE,
		selection: initialSelection.length
	}

	function getTextNodesFrom(selection) {
		var nodes = []
		function childrenIterator(node) {
			if (node.children) {
				node.children.forEach(child => {
					childrenIterator(child)
				})
			} else {
				if (node.type === 'TEXT') nodes.push({ id: node.id, characters: node.characters })
				if (node.type === 'SHAPE_WITH_TEXT') nodes.push({ id: node.id, characters: node.text.characters })
			}
		}
	
		selection.forEach(item => childrenIterator(item))
		return nodes
	}
	
	function renderContent(selection) {
		var selection = selection
		var textNodes = getTextNodesFrom(selection)
		var uniques = {}
	
		textNodes.map(item => {
			if (typeof uniques[item.characters] != 'undefined') {
				uniques[item.characters].push(item.id)
			} else {
				uniques[item.characters] = [item.id]
			}
		})
	
		for (var item in uniques) {
			orderedUniques.push({ key: item, nodes: uniques[item] })
		}
	
		orderedUniques.sort(function(a, b) {
			var nameA = a.key.toUpperCase()
			var nameB = b.key.toUpperCase()
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		})
	
		var message = { type: 'render', uniques: orderedUniques }
		figma.ui.postMessage(message)
	}
	
	if (figma.currentPage.selection.length === 0){
		figma.showUI(__html__, { width: 320, height: 80 })
		initMessage.type = 'init-empty'
		figma.ui.postMessage(initMessage)
	} else {
		figma.showUI(__html__, { width: 320, height: 544 })
		figma.ui.postMessage(initMessage)
		renderContent(initialSelection)
	
		figma.ui.onmessage = msg => {
			
			if (msg.type === 'displayImpression') {
				figma.ui.resize(320, 544+124)
				figma.clientStorage.setAsync('AD_LAST_SHOWN_DATE', Date.now())
			}
			
			if (msg.type === 'previewNodes') {
				var idx = msg.options
				var nodes = orderedUniques[idx].nodes
				previewNodes = nodes.reduce((buffer, item) => {
					buffer.push(figma.getNodeById(item))
					return buffer
				}, [])
				figma.viewport.scrollAndZoomIntoView(previewNodes)
				figma.currentPage.selection = previewNodes
			}
	
			if (msg.type === 'restoreSelection') {
				figma.viewport.scrollAndZoomIntoView(initialSelection)
				figma.currentPage.selection = initialSelection
			}
	
			if (msg.type === 'freeMatch') {
	
			}
	
			if (msg.type === 'uniqueMatch') {
				var replacement = msg.options
				var alertOnce = false
				previewNodes.forEach(node => {
					var font = null
					var wrapperNode = null
					
					// Check node types supported in Figma and FigJam files
					if (node.type === 'TEXT') {
						wrapperNode = node
					} else
					if (node.type === 'SHAPE_WITH_TEXT') {
						wrapperNode = node.text
					}
									
					if (typeof wrapperNode.fontName != 'symbol') {
						font = wrapperNode.fontName
						figma.loadFontAsync(font).then(() => {
							wrapperNode.characters = replacement
							figma.ui.postMessage({ type: 'replaced', replacement: replacement })
							figma.notify(`Replaced ${previewNodes.length} layers`)
						})
					} else
					if (!alertOnce) {
						alertOnce = true
						alert('Content Buddy cannot modify text layers with mixed font properties.')
					}
				})
			}
		}
	}
})
