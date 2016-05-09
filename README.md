This is a web app, built in Meteor, to keep track of your media - or at least that's the end goal. Right now it's on its very initial stages towards that.

Some things work, some things don't. I'm always working on this project and updating it as I learn more. If you find any bugs or anything you see that can be done better, feel free to submit. The most troublesome and buggy part of the whole project is likely the [video seeking](http://stackoverflow.com/questions/35708098/set-currenttime-after-seeking-video).

## Todo

- Get video seeking working (right now it seeks, but the player doesn't reflect the new time after the source change.)
- Replace infinite scrolling with virtual scrolling. This will make it more performant in cases where sections have a ton of content.
- Save images locally. All images are currently loaded externally which creates noticeable lag in image load time (plus rare timeout bans).
- Probably change from Foundation to Semantic UI at some point. Only thing stopping me now is the lack of SASS support.
- ...lots more.


## To Run

1. Install [Meteor](https://github.com/meteor/meteor).
2. Install + run [GuessIt](https://github.com/guessit-io/guessit-rest). You could instead point directly to the hosted [api](http://api.guessit.io/) if you were so inclined - you'd just have to change the hardcoded localhost to the api url.
3. Run `meteor npm install` to install the npm dependencies. The Atmosphere deps should install on first run.
4. Run `meteor` or `meteor --your-port-here`.

At some point I'll likely start putting out actual releases that won't require Meteor to run, but that's a while away. You can always do it yourself, however, by using [Demeteorizer](https://github.com/onmodulus/demeteorizer).

