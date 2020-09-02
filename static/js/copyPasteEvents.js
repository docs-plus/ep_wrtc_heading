
// inspired by ep_comments_page plugin, used and modified copyPasteEvents.js

'use strict';

var _ = require('ep_etherpad-lite/static/js/underscore');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;
var padInner = null;

var getFirstColumnOfSelection = function getFirstColumnOfSelection(line, rep, firstLineOfSelection) {
	return line !== firstLineOfSelection ? 0 : rep.selStart[1];
};

var getLength = function getLength(line, rep) {
	var nextLine = line + 1;
	var startLineOffset = rep.lines.offsetOfIndex(line);
	var endLineOffset = rep.lines.offsetOfIndex(nextLine);

	// lineLength without \n
	var lineLength = endLineOffset - startLineOffset - 1;

	return lineLength;
};

var getLastColumnOfSelection = function getLastColumnOfSelection(line, rep, lastLineOfSelection) {
	var lastColumnOfSelection;
	if (line !== lastLineOfSelection) {
		lastColumnOfSelection = getLength(line, rep); // length of line
	} else {
		lastColumnOfSelection = rep.selEnd[1] - 1; // position of last character selected
	}
	return lastColumnOfSelection;
};


var hasCommentOnLine = function hasCommentOnLine(lineNumber, firstColumn, lastColumn, attributeManager) {
	var foundHeadOnLine = false;
	var headId = null;
	for (var column = firstColumn; column <= lastColumn && !foundHeadOnLine; column++) {
		headId = _.object(attributeManager.getAttributesOnPosition(lineNumber, column)).headingTagId;
		if (headId) {
			foundHeadOnLine = true;
		}
	}
	return { foundHeadOnLine: foundHeadOnLine, headId: headId };
};

var hasCommentOnMultipleLineSelection = function hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager) {
	var foundLineWithComment = false;
	for (var line = firstLineOfSelection; line <= lastLineOfSelection && !foundLineWithComment; line++) {
		var firstColumn = getFirstColumnOfSelection(line, rep, firstLineOfSelection);
		var lastColumn = getLastColumnOfSelection(line, rep, lastLineOfSelection);
		var hasComment = hasCommentOnLine(line, firstColumn, lastColumn, attributeManager);
		if (hasComment) {
			foundLineWithComment = true;
		}
	}
	return foundLineWithComment;
};

var hasMultipleLineSelected = function hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection) {
	return firstLineOfSelection !== lastLineOfSelection;
};

exports.hasHeaderOnSelection = function hasHeaderOnSelection() {
	var hasVideoHeader;
	var attributeManager = this.documentAttributeManager;
	var rep = this.rep;
	var firstLineOfSelection = rep.selStart[0];
	var firstColumn = rep.selStart[1];
	var lastColumn = rep.selEnd[1];
	var lastLineOfSelection = rep.selEnd[0];
	var selectionOfMultipleLine = hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection);
	if (selectionOfMultipleLine) {
		hasVideoHeader = hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager);
	} else {
		hasVideoHeader = hasCommentOnLine(firstLineOfSelection, firstColumn, lastColumn, attributeManager);
	}
	return { hasVideoHeader: hasVideoHeader.foundHeadOnLine, headId: hasVideoHeader.headId, hasMultipleLine: selectionOfMultipleLine };
};

function getSelectionHtml() {
	var html = '';
	if (typeof window.getSelection !== 'undefined') {
		var sel = padInner.contents()[0].getSelection();
		if (sel.rangeCount) {
			var container = document.createElement('div');
			for (var i = 0, len = sel.rangeCount; i < len; ++i) {
				container.appendChild(sel.getRangeAt(i).cloneContents());
			}
			html = container.innerHTML;
		}
	} else if (typeof document.selection !== 'undefined') {
		if (document.selection.type === 'Text') {
			html = document.selection.createRange().htmlText;
		}
	}
	return html;
}

function selectionMultipleLine() {
	var rawHtml = getSelectionHtml();
	rawHtml = $('<div></div>').append(rawHtml);
	rawHtml.find(':header span').removeClass(function removeClass(index, css) {
		return (css.match(/\headingTagId_\S+/g) || []).join(' ');
	}).addClass(function addClass(index, css) {
		return 'headingTagId_' + randomString(16) + ' ' + css;
	});
	return rawHtml.html();
}

function selectionOneLine(headerId) {
	var hTag = padInner.contents().find('.headingTagId_' + headerId).closest(':header').eq(0).prop("tagName").toLowerCase();
	var content = padInner.contents().find('.headingTagId_' + headerId).closest(':header span').removeClass(function(index, css) {
		return (css.match(/\headingTagId_\S+/g) || []).join(' ');
	}).html();
	if(!hTag && !content) return false;
	var rawHtml = $('<div></div>').append('<' + hTag + "><span class='headingTagId_" + randomString(16) + "'>" + content + '</span></' + hTag + '>');
	return rawHtml.html();
}

exports.addTextOnClipboard = function addTextOnClipboard(e, aces, inner, removeSelection) {
	padInner = inner;

	var selection;
	aces.callWithAce(function callWithAce(ace) {
		selection = ace.ace_hasHeaderOnSelection();
	});

	if (selection.hasVideoHeader || selection.hasMultipleLine) {
		var rawHtml;
		if (selection.hasMultipleLine) {
			var htmlSelection = getSelectionHtml();
			rawHtml = selectionMultipleLine(htmlSelection);
		} else {
			if(!selection.headId) return false;
			rawHtml = selectionOneLine(selection.headId);
		}

		if (rawHtml) {
			e.originalEvent.clipboardData.setData('text/html', rawHtml);
			e.preventDefault();
			return false;
		}

		// if it is a cut event we have to remove the selection
		if (removeSelection) {
			padInner.contents()[0].execCommand('delete');
		}
	}
};
