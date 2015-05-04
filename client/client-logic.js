var langeroids = require('langeroids');
var _ = langeroids._;

var PIXI = require('pixi.js');

var defaults = {
    zoom: 20,
    pause: false,
    step: 2000,
    selectedState: 1,
    borderColor: [ 0x1754bb, 0.3 ],
    fillColors: null,
    grid: null
};

var ClientLogic = module.exports = function(settings) {
    defaults.fillColors = [ [ 0, 0 ], [ 0x1754bb, 0.8 ] ];

    _.extend(this, defaults, settings);
};

_.extend(ClientLogic.prototype, {
    onInit: function() {
        this.renderer = new PIXI.WebGLRenderer(600, 300);
        document.body.appendChild(this.renderer.view);
        this.graphics = new PIXI.Graphics();

        var animationLoop = this.getComponent('animation-loop');

        this.viewportWidth = this.renderer.width;
        this.viewportHeight = this.renderer.height;

        this.cellWidth = this.zoom;
        this.cellHeight = this.zoom;

        this.visibleCellsX = Math.ceil(this.viewportWidth / this.cellWidth);
        this.visibleCellsY = Math.ceil(this.viewportHeight / this.cellHeight);
        if (!(this.visibleCellsX % 2)) this.visibleCellsX++;
        if (!(this.visibleCellsY % 2)) this.visibleCellsY++;

        this.realOffsetX = Math.round((this.viewportWidth - this.visibleCellsX * this.cellWidth) / 2);
        this.realOffsetY = Math.round((this.viewportHeight - this.visibleCellsY * this.cellHeight) / 2);

        this.gridStepTimer = animationLoop.getTimer(this.step);

        this.moveViewportCenter(0, 0);
    },

    onLastInputPosChanged: function(lastPos) {
        var cellX = Math.floor((lastPos.x - this.realOffsetX + 1) / this.cellWidth);
        var cellY = Math.floor((lastPos.y - this.realOffsetY + 1) / this.cellHeight);

        var state = this.grid.getCell(cellX, cellY);
        state = state ? 0 : this.selectedState;
        this.grid.setCell(cellX, cellY, state);

        this.emit('draw', this.graphics);
    },

    onUpdate: function() {
        if (!this.pause && this.gridStepTimer.done(true)) {
            this.grid.update();
            this.emit('draw', this.graphics);
        }
    },

    onDraw: function(graphics) {
        graphics.clear();

        if (this.zoom > 4) {
            graphics.lineStyle(1, this.borderColor[0], this.borderColor[1]);
        }
        var fillColors = this.fillColors;

        // draw grid
        for (var y = 0; y < this.grid.height; y++) {
            for (var x = 0; x < this.grid.width; x++) {
                var state = this.grid.getCell(x, y);
                var posX = x * this.cellWidth + this.realOffsetX;
                var posY = y * this.cellHeight + this.realOffsetY;

                if (state) {
                    graphics.beginFill(fillColors[state][0], fillColors[state][1]);
                }
                graphics.drawRect(posX, posY, this.cellWidth, this.cellHeight);
                graphics.endFill();
            }
        }

        this.renderer.render(graphics);
    },

    moveViewportCenter: function(absPosX, absPoxY) {
        absPosX -= Math.floor(this.visibleCellsX / 2);
        absPoxY -= Math.floor(this.visibleCellsY / 2);

        this.setPos(absPosX, absPoxY);
    },

    setPos: function(absPosX, absPosY) {
        this.absPosX = (absPosX + this.gridWidth) % this.gridWidth;
        this.absPosY = (absPosY + this.gridHeight) % this.gridHeight;
    }
});