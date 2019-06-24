var MIN_HEIGHT = 480
var MAX_HEIGHT = 640
var orderedUniques = []
var previewNodes = []
var initialSelection = figma.currentPage.selection.slice(0)

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

figma.showUI(__html__, { width: 320, height: MAX_HEIGHT });

figma.ui.onmessage = msg => {

	if (msg.type === 'pluginReady') {
		var selection = figma.currentPage.selection
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
		console.log(previewNodes)
		previewNodes.forEach(node => {
			var font = null
			if (typeof node.fontName != 'symbol') {
				font = node.fontName
			} else {
				console.log('isSymbol', node.fontName)
			}
			figma.loadFontAsync(font).then(() => {
				node.characters = replacement
			})
		})
	}


	  // figma.closePlugin();
}
