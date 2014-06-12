var langeroids = require('langeroids/lib/langeroids.js');
var _ = langeroids._;
var Game = require('langeroids/lib/game.js');
var Canvas2dRenderer = require('langeroids/lib/canvas-2d-renderer.js');
var TouchInput = require('langeroids/lib/touch-input.js');

var Grid = require('cellular-automata/lib/grid.js');
var GridLogic = require('cellular-automata/lib/grid-logic.js');
var GameOfLife = require('cellular-automata/lib/logic/game-of-life.js');
var ClientLogic = require('./client-logic.js');

(function() {
    var game = new Game();

    var grid = new Grid({
        width: 100,
        height: 100
    });

    _.extend(GridLogic.prototype, {
        init: function() {
            this.automata = {
                'gameOfLife': new GameOfLife()
            };
            this.currentAutomaton = 'gameOfLife';
        },

        updateStates: function() {
            return this.automata[this.currentAutomaton].tick(this.grid);
        }
    });
    var gridLogic = new GridLogic({
        grid: grid
    });

    game.addComponent(new Canvas2dRenderer({
        canvas: 'canvas',
        width: 327,
        height: 215,
        scale: 1
    }));

    game.addComponent(new TouchInput());

    game.addComponent(new ClientLogic({
        grid: grid,
        gridLogic: gridLogic,
        zoom: 20
    }));

    game.start();
})();