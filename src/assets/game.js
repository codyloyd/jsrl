import ROT from "rot-js";
import Colors from "./colors";
import Screen from "./screens";
import * as firebase from "firebase";

require("firebase/firestore");

firebase.initializeApp({
  apiKey:'AIzaSyAXOyEARiK9iNGZYrtLb-_KUuag15wE94g',
  projectId:'warriororc-rl'
});

const db = firebase.firestore();
const highScoresDB = db.collection("games")

highScoresDB.orderBy('score', 'desc').limit(3).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data().name}: ${doc.data().score}`);
    });
});


const Game = {
  _display: null,
  _currentScreen: null,
  _screenWidth: 80,
  _screenHeight: 30,
  _highScoresDB: highScoresDB,

  init: function() {
    this._display = new ROT.Display({
      width: this._screenWidth,
      height: this._screenHeight + 1,
      fg: Colors.white,
      bg: Colors.black,
      fontWeight: 'bold',
      spacing: 1
    });
    const game = this;
    const bindEventToScreen = function(event) {
      window.addEventListener(event, function(e) {
        if (game._currentScreen !== null) {
          game._currentScreen.handleInput(event, e, game);
        }
      });
    };
    bindEventToScreen("keydown");
    // bindEventToScreen("keyup");
    bindEventToScreen("keypress");
  },

  refresh: function() {
    this._currentScreen.render(this._display, this);
  },

  getDisplay: function() {
    return this._display;
  },

  getScreenWidth: function() {
    return this._screenWidth;
  },

  getScreenHeight: function() {
    return this._screenHeight;
  },

  switchScreen: function(screen, opt) {
    if (this._currentScreen !== null) {
      this._currentScreen.exit();
    }
    this.getDisplay().clear();
    this._currentScreen = screen;
    if (!this._currentScreen !== null) {
      this._currentScreen.enter(this, opt);
      this.refresh();
    }
  }
};

export default Game;

window.onload = function() {
  if (!ROT.isSupported()) {
    alert("The rot.js library isn't supported by your browser.");
  } else {
    Game.init();
    document.body.appendChild(Game.getDisplay().getContainer());
    Game.switchScreen(Screen.startScreen);
  }
};
