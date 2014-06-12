var langeroids = require('langeroids/lib/langeroids.js');
var _ = langeroids._;
var Timer = require('langeroids/lib/timer.js');

var defaults = {
    zoom: 20,
    pause: false,
    step: 2000,
    selectedState: 1,
    borderColor: 'rgba(23, 84, 187, 0.3)',
    fillColors: null,

    grid: null,
    gridLogic: null
};

var ClientLogic = module.exports = function(options) {
    defaults.fillColors = [ 'rgba(23, 84, 187, 0.8)' ];

    _.extend(this, defaults, options);
};

_.extend(ClientLogic.prototype, {
    onInit: function(game) {
        var renderer = game.getComponent('renderer');

        this.viewportWidth = renderer.width;
        this.viewportHeight = renderer.height;

        this.cellWidth = this.zoom;
        this.cellHeight = this.zoom;

        this.visibleCellsX = Math.ceil(this.viewportWidth / this.cellWidth);
        this.visibleCellsY = Math.ceil(this.viewportHeight / this.cellHeight);
        if (!(this.visibleCellsX % 2)) this.visibleCellsX++;
        if (!(this.visibleCellsY % 2)) this.visibleCellsY++;

        this.realOffsetX = Math.round((this.viewportWidth - this.visibleCellsX * this.cellWidth) / 2);
        this.realOffsetY = Math.round((this.viewportHeight - this.visibleCellsY * this.cellHeight) / 2);

        this.gridStepTimer = new Timer({ game: game, tDuration: this.step });

        this.moveViewportCenter(0, 0);
    },

    onLastInputPosChanged: function(lastPosX, lastPosY) {
        var cellX = Math.floor((lastPosX - this.realOffsetX + 1) / this.cellWidth);
        var cellY = Math.floor((lastPosY - this.realOffsetY + 1) / this.cellHeight);

        var state = this.grid.getCell(cellX, cellY);
        state = state ? 0 : this.selectedState;
        this.grid.setCell(cellX, cellY, state);
    },

    onUpdate: function() {
        if (!this.pause && this.gridStepTimer.done()) {
            this.gridLogic.tick();
            this.gridStepTimer.repeat();
        }
    },

    onDraw: function(renderer) {
        var ctx = renderer.ctx;
        renderer.clear('rgb(0,0,0)');

        if (this.zoom > 4) {
            ctx.strokeStyle = this.borderColor;
        }

        var fillColors = this.fillColors;
        if (fillColors.length === 1) ctx.fillStyle = fillColors[0];

        // draw grid
        for (var y = 0; y < this.grid.height; y++) {
            for (var x = 0; x < this.grid.width; x++) {
                var state = this.grid.getCell(x, y);
                var posX = x * this.cellWidth + this.realOffsetX;
                var posY = y * this.cellHeight + this.realOffsetY;

                if (this.zoom > 4) {
                    ctx.strokeRect(posX, posY, this.cellWidth, this.cellHeight);
                }

                if (state) {
                    if (fillColors.length > 1) {
                        ctx.fillStyle = fillColors[state];
                    }
                    ctx.fillRect(posX, posY, this.cellWidth, this.cellHeight);
                }
            }
        }
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