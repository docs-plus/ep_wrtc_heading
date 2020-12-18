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

  const hasHeaderOnLine = function hasHeaderOnLine(lineNumber, firstColumn, lastColumn, attributeManager) {
    let foundHeadOnLine = false;
    let headId = null;
    for (let column = firstColumn; column <= lastColumn && !foundHeadOnLine; column++) {
      headId = _.object(attributeManager.getAttributesOnLine(lineNumber)).headingTagId;
      if (headId) {
        foundHeadOnLine = true;
      }
    }
    return {foundHeadOnLine, headId};
  };

  const hasHeaderOnMultipleLineSelection = function hasHeaderOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager) {
    let foundLineWithHeader = false;
    for (let line = firstLineOfSelection; line <= lastLineOfSelection && !foundLineWithHeader; line++) {
      const firstColumn = getFirstColumnOfSelection(line, rep, firstLineOfSelection);
      const lastColumn = getLastColumnOfSelection(line, rep, lastLineOfSelection);
      const hasHeader = hasHeaderOnLine(line, firstColumn, lastColumn, attributeManager);
      if (hasHeader) {
        foundLineWithHeader = true;
      }
    }
    return foundLineWithHeader;
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
      hasVideoHeader = hasHeaderOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager);
    } else {
      hasVideoHeader = hasHeaderOnLine(firstLineOfSelection, firstColumn, lastColumn, attributeManager);
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
    rawHtml.find(':header nd-video').each(function () {
      $(this).attr({class: `nd-video ${randomString(16)}`});
    });
    return rawHtml.html();
  }

  function selectionOneLine(headerId) {
    const hTag = padInner.contents()
        .find(`.videoHeader.${headerId}`)
        .attr('data-htag');

    const content = padInner.contents()
        .find(`.videoHeader.${headerId}`)
        .html();

    if (!hTag && !content) return false;
    const rawHtml = $('<div></div>').append(`<${hTag}><nd-video class="videoHeader ${randomString(16)}">${content}</nd-video></${hTag}>`);
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
        e.originalEvent.clipboardData.setData('text/wrtc', JSON.stringify({raw: rawHtml, multiLine: selection.hasMultipleLine}));
        e.preventDefault();
        return false;
      }

      // if it is a cut event we have to remove the selection
      if (removeSelection) {
        padInner.contents()[0].execCommand('delete');
      }
    }
  };


  const pastOnSelection = (event, padInner) => {
    const hasWrtcObject = event.originalEvent.clipboardData.getData('text/wrtc');

    if (hasWrtcObject) {
      let rawHtml = JSON.parse(hasWrtcObject);
      rawHtml = $('<div></div>').append(rawHtml.raw);
      rawHtml.find('nd-video').each(function () {
        $(this).attr({class: `nd-video ${randomString(16)}`});
      });

      const selection = padInner.contents()[0].getSelection();
      if (!selection.rangeCount) return false;

      // console.log(rawHtml.html())
      selection.deleteFromDocument();
      // selection.getRangeAt(0).insertNode(rawHtml[0]);

      $(selection.anchorNode).html(rawHtml);
      // [optional] make sure focus is on the element
      selection.anchorNode.focus();
      // select all the content in the element
      padInner.contents()[0].execCommand('selectAll', false, null);
      // collapse selection to the end
      padInner.contents()[0].getSelection().collapseToEnd();


      setTimeout(() => {
        WRTC_Room.findTags();
      }, 250);


      event.preventDefault();
    }
  };

  return {
    hasHeaderOnSelection,
    addTextOnClipboard,
    pastOnSelection,
  };
})();
