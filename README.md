# ep_wrtc_heading
Video Headings Plugin for Etherpad



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

To set an element or class to listen for an init event set ep_wrtc_heading.listenClass in your settings.json. This is often stabled with "enabled":false and a button to provide a button to begin video sessions

```json
"ep_wrtc_heading" : {
    "listenClass": "#chatLabel"
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

## Metrics
You can see metrics for various errors that users have when attempting to connect their camera/microphone: