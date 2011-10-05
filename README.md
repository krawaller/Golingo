Golingo
===

You're looking at the repository of Golingo, the #1 Paid Word Game in the Swedish App Store.
This is the full source code, basking naked in all its dirty glory.
There is an [accompanying blog post](http://blog.krawaller.se/opensourcing-golingo) spilling most of the beans about this release.
Dig in to the code, and feel free to do what you like with it. We ask you kindly to play nice, but the code is yours to (ab)use.

If you have any questions, don't hesitate to let us know - either through Github, our [blog](http://blog.krawaller.se) or by [mail](mailto:jacob@krawaller.se).

Features
---

* Not a single line of Objective-C written, courtesy of Titanium Mobile
* Only one (!) image ingame - the rest is CSS3 magic
* Fluid gameplay thanks to CSS Transitions and Animations
* All logic using pure, beautiful JavaScript
* Multitouch draggables using iPhone Touch API
* Logic encapsulated using Low Pro - meaning split screen mode was easy pie
* jQuery 1.4.2 for development speed (and sanity of developer)
* CouchDB as highscore storage, with storage logic in JavaScript
* Predictable randomness means replayable games, all courtesy of excellent seedrandom


Challenges, aka. "We dare you!"
---

* Make it run on Android
* Make it run on webOS
* Translate to more languages
* Add multiplayer capabilities through Bonjour, nodejs, PusherApp or similar.


LICENSE
---

Copyright (c) 2010 Krawaller, MIT Licensed, apart from:
DSSO (Den Stora Svenska Ordlistan) found in `Resources/db/swe.sqlite`, Copyright (c) 2010 Göran Andersson, CC BY-SA 3.0
