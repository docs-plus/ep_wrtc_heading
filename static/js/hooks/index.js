import * as Helper from '../lib/helpers';

const ignoreEvent =
  'handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps';

export const aceEditorCSS = () => {
  const version = clientVars.webrtc.version || 1;
  return [`ep_wrtc_heading/static/dist/css/innerLayer.css?v=${version}`];
};

export const aceEditEvent = (hookName, context) => {
  const eventType = context.callstack.editEvent.eventType;
  console.log(eventType)
  // ignore these types
  if (ignoreEvent.includes(eventType)) return;

  // TODO: refactor needed
  // when a new line create
  if (context.callstack.domClean) Helper.adjustAvatarAlignMent();
};

export const userLeave = (hookName, context) => {
  // WRTC.userLeave(null, context);
};

export const handleClientMessage_RTC_MESSAGE = (hookName, context) => {
  // WRTC.handleClientMessage_RTC_MESSAGE(hookName, context);
};

// TODO: refactore needed
export const acePostWriteDomLineHTML = (hookName, context) => {
  const hasHeader = $(context.node).find(':header');
  if (hasHeader.length) {
    const headerId = hasHeader.find('.videoHeader').attr('data-id');
    // FIXME: performance issue
    setTimeout(() => {
      // WRoom.syncVideoAvatart(headerId);
    }, 250);
  }
};

// TODO: refactor needed
export const aceDomLineProcessLineAttributes = (hookName, context) => {
  // const cls = context.cls;
  // const headingType = /(?:^| )headerId:([A-Za-z0-9]*)/.exec(cls);
  const result = [];

  // if (typeof Helper === 'undefined') return result;

  // if (headingType) {
  //   const headerType = /(?:^| )heading:([A-Za-z0-9]*)/.exec(cls);
  //   const headerId = headingType[1];
  //   const htagNum = headerType && headerType[1];

  //   // if video or textChat modal is open! update modal title
  //   if (Helper.wrtcStore.components.video.open) {
  //     const $header = Helper.findAceHeaderElement(headerId);
  //     Helper.wrtcPubsub.emit('updateWrtcToolbarTitleModal', $header.text, headerId);
  //   }

  //   const modifier = {
  //     preHtml: '',
  //     postHtml: `<chat-inline-icon data-headerid="${headerId}"></chat-inline-icon>`,
  //     processedMarker: true,
  //   };

  //   Helper.wrtcStore.rooms.set(
  //     headerId,
  //     {
  //       VIDEO: { list: [] },
  //       TEXT: { list: [] },
  //       USERS: {},
  //       headerCount: 0,
  //     },
  //   );
  //   if (htagNum && Helper.hTags.includes(htagNum)) result.push(modifier);
  // }

  return result;
};
