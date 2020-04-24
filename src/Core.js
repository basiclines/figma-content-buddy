import Tracking from 'src/utils/Tracking'

var orderedUniques = []
var previewNodes = []
var initialSelection = figma.currentPage.selection.slice(0)

// Obtain UUID then trigger init event
figma.clientStorage.getAsync('UUID').then(data => {
	let UUID = ''

	if (!data) {
		UUID = Tracking.createUUID()
		figma.clientStorage.setAsync('UUID', UUID)
	} else {
		UUID = data
	}

	figma.ui.postMessage({ type: 'init', UUID: UUID, selection: initialSelection.length })

})


function getTextNodesFrom(selection) {
	var nodes = []
	function childrenIterator(node) {
		if (node.children) {
			node.children.forEach(child => {
				childrenIterator(child)
			})
		} else {
			if (node.type === 'TEXT') nodes.push({ id: node.id, characters: node.characters })
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
	var message = { type: 'empty' }
	figma.ui.postMessage(message)
} else {
	figma.showUI(__html__, { width: 320, height: 544 })
	renderContent(initialSelection)

	figma.ui.onmessage = msg => {
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
				if (typeof node.fontName != 'symbol') {
					font = node.fontName
					figma.loadFontAsync(font).then(() => {
						node.characters = replacement
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

