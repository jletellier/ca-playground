var langeroids = require('langeroids');
var _ = langeroids._;

var ComponentManager = require('langeroids/lib/component-manager');
var AnimationLoop = require('langeroids/lib/animation-loop');
var Canvas2dRenderer = require('langeroids/lib/canvas-2d-renderer');
var TouchInput = require('langeroids/lib/touch-input');

var Grid = require('cellular-automata/lib/grid');
var GameOfLife = require('cellular-automata/lib/logic/game-of-life');

var ClientLogic = require('./client-logic');


var cm = new ComponentManager();

cm.add(new AnimationLoop());
cm.add(new Canvas2dRenderer({
    canvas: 'canvas',
    width: 327,
    height: 215
}));
cm.add(new TouchInput());

var grid = new Grid({
    width: 100,
    height: 100,
    automaton: new GameOfLife()
});

cm.add(new ClientLogic({
    grid: grid,
    zoom: 20
}));

cm.init();