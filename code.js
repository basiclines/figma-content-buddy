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


figma.showUI(__html__, { width: 320, height: 248 });

figma.ui.onmessage = msg => {

	if (msg.type === 'pluginReady') {
		var selection = figma.currentPage.selection
		var textNodes = getTextNodesFrom(selection)
		// var textNodes = figma.currentPage.findAll(n => n.type === 'TEXT')
		var uniques = {}

		textNodes.map(item => {
			if (typeof uniques[item.characters] != 'undefined') {
				uniques[item.characters].push(item)
			} else {
				uniques[item.characters] = [item]
			}
		})

		var message = { type: 'render', uniques: uniques }
		figma.ui.postMessage(message)
	}

	  // figma.closePlugin();
}
