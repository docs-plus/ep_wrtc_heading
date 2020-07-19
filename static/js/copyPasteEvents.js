



exports.addTextOnClipboard = function(e, ace, padInner, removeSelection) {
	var removeSelection = false

	var selection;
	ace.callWithAce(function(ace) {
		selection = ace.ace_hasHeaderOnSelection();
	});

	if(selection.hasVideoHeader || selection.hasMultipleLine){
		var rawHtml;

		if(selection.hasMultipleLine){
			var htmlSelection = getSelectionHtml();
			rawHtml = selectionMultipleLine(htmlSelection);
		} else {
			rawHtml = selectionOneLine(selection.headId);
		}

		if(rawHtml){
			e.originalEvent.clipboardData.setData('text/html', rawHtml);
			e.preventDefault();
		}
		
		// if it is a cut event we have to remove the selection
		if(removeSelection){
			padInner.contents()[0].execCommand("delete");
		}
	}
}