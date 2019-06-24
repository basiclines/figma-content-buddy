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

		console.log(uniques)

		var orderedUniques = []
		for (var item in uniques) {
			console.log(item, uniques[item])
		}


		var message = { type: 'render', uniques: uniques }
		figma.ui.postMessage(message)
	}

	  // figma.closePlugin();
}
