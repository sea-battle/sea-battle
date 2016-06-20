var gameHandlers = {
    placementStage: {
        click: function (e) {
            if (selectedBoat != null) {
                var possibleToPlace = grid.canPlaceBoat(e.gridInfo.coords, selectedBoat);
                if (possibleToPlace) {
                    var boatSelector = document.getElementById(selectedBoat.id);
                    boatSelector.setAttribute('data-placed', 'true');
                    boatSelector.setAttribute('class', 'boat-selector placed');
                    grid.placeBoat(selectedBoat, e.gridInfo.coords);
                    selectedBoat = null;
                    grid.clearCanvas();
                    grid.drawPlacedBoats(boatsSprite);
                }
            } else {
                if (e.gridInfo.cell.containBoat) {
                    var boatId = e.gridInfo.cell.boatId;
                    var boatOrientation = e.gridInfo.cell.boatOrientation;
                    grid.removePlacedBoat(boatId);

                    var removedBoat = grid.getDefaultBoats(boatId);
                    selectedBoat = new Boat(removedBoat.name, removedBoat.size, boatOrientation, removedBoat.id);
                    document.getElementById(boatId).setAttribute('class', 'boat-selector');

                    grid.clearCanvas();
                    grid.drawPlacedBoats(boatsSprite);
                    grid.drawPreviewBoat(boatsSprite, selectedBoat, e.gridInfo, .5);
                }
            }
        },
        mousemove: function (e) {
            var pos = {
                x: e.offsetX || e.layerX,
                y: e.offsetY || e.layerY
            };
            if (!previousMouseCoords) {
                previousMouseCoords = grid.getMouseCoord(pos);
            }

            if (selectedBoat != null) {
                var currentCoords = e.gridInfo.coords;
                if (currentCoords.x >= 0 && currentCoords.y >= 0) {
                    if (previousMouseCoords.x != currentCoords.x ||
                        previousMouseCoords.y != currentCoords.y) { // still in the same place
                        var possible = grid.canPlaceBoat(e.gridInfo.coords, selectedBoat);
                        var alpha = possible ? 1 : .5;
                        grid.clearCanvas();
                        grid.renderGrid();
                        grid.drawPlacedBoats(boatsSprite);
                        grid.drawPreviewBoat(boatsSprite, selectedBoat, e.gridInfo, alpha);
                    }
                    previousMouseCoords = grid.getMouseCoord(pos);
                }
            }
        },
        contextmenu: function (e) {
            e.preventDefault();
            if (selectedBoat) {
                selectedBoat.orientation = selectedBoat.orientation == HORIZONTAL ? VERTICAL : HORIZONTAL;
                var possibleToPlace = grid.canPlaceBoat(e.gridInfo.coords, selectedBoat);
                var alpha = possibleToPlace ? 1 : .5;
                grid.clearCanvas();
                grid.renderGrid();
                grid.drawPlacedBoats(boatsSprite);
                grid.drawPreviewBoat(boatsSprite, selectedBoat, e.gridInfo, alpha);
            }
        },
        selectBoat: function (e) {
            var placed = this.getAttribute('data-placed').toBool();
            if (!placed) {
                var boatSelecters = document.getElementsByClassName('boat-selector');
                var previousBoatOrientation = HORIZONTAL;

                var name = this.innerHTML,
                    size = this.getAttribute('data-boat-size'),
                    id = this.id;
                selectedBoat = new Boat(name, size, previousBoatOrientation, id);
            }
        },
        random: function (e) {
            grid.randomBoatsPosition();
            grid.drawPlacedBoats(boatsSprite);
            selectedBoat = null;

            var selectors = document.getElementsByClassName('boat-selector');
            for (var i = 0; i < selectors.length; i++) {
                selectors[i].className = 'boat-selector placed';
            }

            randomGenerator.removeEventListener('click', random);
            randomGenerator.remove();
        }
    },
    battleStage: {
        otherPlayersGrid: {
            click: function (e) {
                cloneTargetedGridToShooter(this.getAttribute('data-player-id'));
            }
        },
        shooterGrid: {
            click: function (e) {
                console.log(e.gridInfo);
            },
            mousemove: function (e) {
                console.log(e);
            }
        }
    },
    test: {
        mousemove: function (e) {
            grid.highlightCell(e.gridInfo.coords);
            grid.highlightedOver = e.gridInfo.coords;
        },
        click: function (e) {
            if (grid.highlightedSelected.x != null &&
                grid.highlightedSelected.y != null) {
                grid.clearHighlightCell(grid.highlightedSelected);
            }

            grid.highlightedSelected = e.gridInfo.coords
            grid.highlightCell(e.gridInfo.coords);
        }
    }
};
var previousMouseCoords = undefined;
const HORIZONTAL = 'h';
const VERTICAL = 'v';
var selectedBoat = new Boat('name', 2, 'h', 'tp');
var boatsSprite = new Image();
boatsSprite.src = "/images/sprites.png";
boatsSprite.onload = function () {
    var canvasTest = document.getElementById('canvas-test');
    grid = new Grid(canvasTest, 'test');
    grid.randomBoatsPosition();
    grid.drawPlacedBoats(boatsSprite);

    canvasTest.addEventListener('click', gameHandlers.test.click);
    canvasTest.addEventListener('mousemove', gameHandlers.test.mousemove);
}