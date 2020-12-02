// inspired by ep_comments_page plugin, used and modified copyPasteEvents.js

'use strict';
var _ = require('ep_etherpad-lite/static/js/underscore');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

var events = (function () {
  let padInner = null;

  const getFirstColumnOfSelection = function getFirstColumnOfSelection(line, rep, firstLineOfSelection) {
    return line !== firstLineOfSelection ? 0 : rep.selStart[1];
  };

  const getLength = function getLength(line, rep) {
    const nextLine = line + 1;
    const startLineOffset = rep.lines.offsetOfIndex(line);
    const endLineOffset = rep.lines.offsetOfIndex(nextLine);

    // lineLength without \n
    const lineLength = endLineOffset - startLineOffset - 1;

    return lineLength;
  };

  const getLastColumnOfSelection = function getLastColumnOfSelection(line, rep, lastLineOfSelection) {
    let lastColumnOfSelection;
    if (line !== lastLineOfSelection) {
      lastColumnOfSelection = getLength(line, rep); // length of line
    } else {
      lastColumnOfSelection = rep.selEnd[1] - 1; // position of last character selected
    }
    return lastColumnOfSelection;
  };

  const hasCommentOnLine = function hasCommentOnLine(lineNumber, firstColumn, lastColumn, attributeManager) {
    let foundHeadOnLine = false;
    let headId = null;
    for (let column = firstColumn; column <= lastColumn && !foundHeadOnLine; column++) {
      headId = _.object(attributeManager.getAttributesOnPosition(lineNumber, column)).headingTagId;
      if (headId) {
        foundHeadOnLine = true;
      }
    }
    return {foundHeadOnLine, headId};
  };

  const hasCommentOnMultipleLineSelection = function hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager) {
    let foundLineWithComment = false;
    for (let line = firstLineOfSelection; line <= lastLineOfSelection && !foundLineWithComment; line++) {
      const firstColumn = getFirstColumnOfSelection(line, rep, firstLineOfSelection);
      const lastColumn = getLastColumnOfSelection(line, rep, lastLineOfSelection);
      const hasComment = hasCommentOnLine(line, firstColumn, lastColumn, attributeManager);
      if (hasComment) {
        foundLineWithComment = true;
      }
    }
    return foundLineWithComment;
  };

  const hasMultipleLineSelected = function hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection) {
    return firstLineOfSelection !== lastLineOfSelection;
  };

  const hasHeaderOnSelection = function hasHeaderOnSelection() {
    let hasVideoHeader;
    const attributeManager = this.documentAttributeManager;
    const rep = this.rep;
    const firstLineOfSelection = rep.selStart[0];
    const firstColumn = rep.selStart[1];
    const lastColumn = rep.selEnd[1];
    const lastLineOfSelection = rep.selEnd[0];
    const selectionOfMultipleLine = hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection);
    if (selectionOfMultipleLine) {
      hasVideoHeader = hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager);
    } else {
      hasVideoHeader = hasCommentOnLine(firstLineOfSelection, firstColumn, lastColumn, attributeManager);
    }
    return {
      hasVideoHeader: hasVideoHeader.foundHeadOnLine,
      headId: hasVideoHeader.headId,
      hasMultipleLine: selectionOfMultipleLine,
    };
  };

  function getSelectionHtml() {
    let html = '';
    if (typeof window.getSelection !== 'undefined') {
      const sel = padInner.contents()[0].getSelection();
      if (sel.rangeCount) {
        const container = document.createElement('div');
        for (let i = 0, len = sel.rangeCount; i < len; ++i) {
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
    let rawHtml = getSelectionHtml();
    rawHtml = $('<div></div>').append(rawHtml);
    rawHtml.find(':header span').removeClass((index, css) => (css.match(/\headingTagId_\S+/g) || []).join(' ')).addClass((index, css) => `headingTagId_${randomString(16)} ${css}`);
    return rawHtml.html();
  }

  function selectionOneLine(headerId) {
    const hTag = padInner.contents().find(`.headingTagId_${headerId}`).closest(':header').eq(0).prop('tagName').toLowerCase();
    const content = padInner.contents().find(`.headingTagId_${headerId}`).closest(':header span').removeClass((index, css) => (css.match(/\headingTagId_\S+/g) || []).join(' ')).html();
    if (!hTag && !content) return false;
    const rawHtml = $('<div></div>').append(`<${hTag}><span class='headingTagId_${randomString(16)}'>${content}</span></${hTag}>`);
    return rawHtml.html();
  }

  const addTextOnClipboard = function addTextOnClipboard(e, aces, inner, removeSelection) {
    padInner = inner;

    let selection;
    aces.callWithAce((ace) => {
      selection = ace.ace_hasHeaderOnSelection();
    });

    if (selection.hasVideoHeader || selection.hasMultipleLine) {
      let rawHtml;
      if (selection.hasMultipleLine) {
        const htmlSelection = getSelectionHtml();
        rawHtml = selectionMultipleLine(htmlSelection);
      } else {
        if (!selection.headId) return false;
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

  return {
    hasHeaderOnSelection,
    addTextOnClipboard,
  };
})();
