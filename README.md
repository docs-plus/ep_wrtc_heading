<p align="center">

<a href="LICENSE">
<img src="https://img.shields.io/badge/License-MIT%202.0-blue.svg">
</a>

<a href="#">
<img src="https://img.shields.io/npm/v/ep_wrtc_heading">
</a>

<a href="#">
<img src="https://img.shields.io/npm/dt/ep_wrtc_heading">
</a>

</p>

<p align="center">
<a href="https://nodei.co/npm/ep_wrtc_heading/">
<img src="https://nodei.co/npm/ep_wrtc_heading.png">
</a>
</p>

# ep_wrtc_heading

Video Headings Plugin for Etherpad.

WebRTC video/audio, a dedicated chat room for each headlines (h tags).

> Note: for better expriance use [ep_heading2](https://github.com/ether/ep_headings2), [ep_profile_modal](https://github.com/samirsayyad/ep_profile_modal)

## Installing

```bash
$ npm install ep_wrtc_heading
```

## Settings

To set a custom stun server, set ep_wrtc_heading.iceServer in your settings.json:

```json
"ep_wrtc_heading" : {
    "iceServers":[
        {"url": "stun:stun.l.google.com:19302"}
    ]
}
```

To ensure reliable connectivity we recommend setting both a STUN and TURN server. We don't set this by default and below are just example servers, you should ensure you use reliable STUN and TURN servers.

```json
"ep_wrtc_heading" : {
  "iceServers":[
    {
      "urls": [ "stun:216.246.6.224:3478", "stun:74.125.140.127:19302", "stun:[2a00:1450:400c:c08::7f]:19302" ]
    }
      ,
    {
      "urls": [ "turn:numb.viagenie.ca" ],
      "credential": "muazkh",
      "username": "webrtc@live.com"
    },
    {
      "urls": ["turn:192.158.29.39:3478?transport=udp"],
      "credential": "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      "username": "28224511:1379330808"
    }

    ],
}
```

To set a custom small and/or large size in pixels, for the video displays, set one or both of the following in your settings.json:

```json
"ep_wrtc_heading": {
  "video": {
    "sizes": {
      "small": 200,
      "large": 400
    }
  }
}
```

To set Limitation for video-chat room:

```json
"ep_wrtc_heading": {
  "videoChatLimit": 4 // default
}
```

## Metrics

You can see metrics for various errors that users have when attempting to connect their camera/microphone:

- `ep_webrtc_err_Hardware`: Some sort of hardware-related connection problem on the users' computer.
- `ep_webrtc_err_NotFound`: Could not find user's camera/microphone.
- `ep_webrtc_err_Abort`: Some sort of other, non-hardware related connection problem on the user's computer.
- `ep_webrtc_err_NotSupported`: User's environment does not support webrtc.
- `ep_webrtc_err_Permission`: User did not grant permission to their camera/microphone
- `ep_webrtc_err_SecureConnection`: Etherpad is not set up on a secure connection, which is requried for webrtc
- `ep_webrtc_err_Unknown`: Some other unspecified error. Perhaps a bug in this plugin.

## changelog

### [v0.27.0]

- Brought up the Gulp, to organize and speed up development workflow.
- Create the Gulp tasks for development and production flow.
- Priority of loading js file, to avoid loss of variable allocation.
- Minify and concat js files.
- If webrtc "failed to configure sdp remote response", the system now tries 10 times to reconnect and establish a stable connection between peers.

### [v0.28.0]

- Leaving the user now happens immediately, the video interface is removed immediately. and make sure that if the main socket is inactive, a leaving will occur.
- The `findTags` features is optimized.
- Fixed audio change, in case of changing audio, there was a problem that the audio source does not change properly.
- You can now set the video codec from the Etherpad settings. by defualt we set `vp9` for video and `opus` for audio.
- Bandwidth usage for video and audio is now limited. audio `50kbits min`, video `128kbits min/max`

### [v0.28.3]

- Added a new modal to display peer-to-peer video/audio realTime information, use [`getStats.js`](https://github.com/muaz-khan/getStats)
- Fixed reconnecting attempts, reset retry counting happening when we have a successful connection to the other peers
- Fixed bandwidth limit, this was an issue where bandwidth usage was not locked at "128 kbps".

### [v0.28.9]
- Fixed copy and paste functionality, this feature was lost during bundling
- Increase bandwidth cap and decrease and lock down video resolution to `QVGA` (`width: {exact: 320}, height: {exact: 240}`)
- Adjust reconnection process, increase the effort to 50 times, and delay cap between `200` to `1000` milliseconds
- Fixed header icon, the video icon did not display when the header was removed or then replaced with new content.
- A spinner is added when the user is waiting to join the room.
- Css adjustment, fixed misalignment(video and inline avatar icons)
- `inlineAvatars` now are clickable, and use the [ep_profile_modal](https://github.com/samirsayyad/ep_profile_modal) model to display user information.

### [v0.29.26]
- Full mesh network for Webrtc, set up and create queues for more stable handshake strategy. (beta-0)
- Revert user disconnection from socket.io to the etherpad userleave native function; (
  In the event of an unstable internet connection, the socket may fail and be disabled for a second, then try to connect again. in this case, etherpad is unlikely to make another request and the user will have to load the page. we will be waiting for the new version of Etherpad to optimize this feature again.
)
- The user will now receive an appropriate alert if the socket fails or the internet connection is unstable.
- A badge was added to the video interface to display network latency.
- Finding H tags function fixed, we only need searching lines that has an H tag.
- Adjust the new socket settings
- Webrtc modal error.
- Display latency status for all users who participate in video calling.
- Fixed video settings in Firefox, (Firefox does not support audio output).
- Fixed and replace depricated webrtc API.
- Redesign the reload button, the button will be dispatch reloading action to all users.
- Fix the page header when the cursor is at the end of the line (video icon is not displayed).


## License

This project is licensed under the [MIT License](./LICENSE).

> Inspire and use [ep_webrtc](https://github.com/ether/ep_webrtc)

If you have any further questions, please don’t hesitate to contact us.
<marzban98@gmail.com>
