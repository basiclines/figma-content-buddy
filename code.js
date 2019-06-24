var MIN_HEIGHT = 480
var MAX_HEIGHT = 640

figma.showUI(__html__, { width: 320, height: MAX_HEIGHT });

figma.ui.onmessage = msg => {

	if (msg.type === 'pluginReady') {
		var selection = figma.currentPage.selection
		var textNodes = figma.currentPage.findAll(n => n.type === 'TEXT')
		var uniques = {}

		textNodes.map(item => {
			if (typeof uniques[item.characters] != 'undefined') {
				uniques[item.characters].push(item.id)
			} else {
				uniques[item.characters] = [item.id]
			}
		})

		var orderedUniques = []
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

	  // figma.closePlugin();
}
