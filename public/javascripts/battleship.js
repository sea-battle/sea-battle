/*
window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();
*/


const HORIZONTAL = 'h';
const VERTICAL = 'v';
const SPRITE = {
    tp: {
        y: 0
    },
    sm: {
        y: 5
    },
    dt: {
        y: 2
    },
    cr: {
        y: 8
    },
    ca: {
        y: 12
    }
};
const DEFAULT_BOATS = {
    tp: {
        name: 'Torpedo',
        size: 2,
        id: 'tp'
    },
    sm: {
        name: 'Submarine',
        size: 3,
        id: 'sm'
    },
    dt: {
        name: 'Destroyer',
        size: 3,
        id: 'dt'
    },
    cr: {
        name: 'Cruiser',
        size: 4,
        id: 'cr'
    },
    ca: {
        name: 'Carrier',
        size: 5,
        id: 'ca'
    }
};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var boatsContainer = document.getElementById('boats-container');
var canvasContainer = document.getElementById('canvas-wrapper');
var randomGenerator = document.getElementById('random');

var previousMouseCoords = undefined;
// images 
var boatsSprite = new Image();
boatsSprite.src = "/images/sprites.png";

var grid = new Grid(canvas);
var selectedBoat = null;

boatsSprite.onload = function () {
    canvas.addEventListener('mousemove', function (e) {
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
                    grid.drawPreviewBoat(boatsSprite, selectedBoat, SPRITE[selectedBoat.id].y, e.gridInfo, alpha);
                }
                previousMouseCoords = grid.getMouseCoord(pos);
            }
        }
    });
    canvas.addEventListener('click', function (e) {
        if (selectedBoat != null) {
            var possibleToPlace = grid.canPlaceBoat(e.gridInfo.coords, selectedBoat);
            if (possibleToPlace) {
                var boatSelector = document.getElementById(selectedBoat.id);
                boatSelector.setAttribute('data-placed', 'true');
                boatSelector.setAttribute('class', 'boat-selector placed');
                grid.placeBoat(selectedBoat, e.gridInfo.coords, SPRITE[selectedBoat.id].y);
                selectedBoat = null;
                grid.clearCanvas();
                grid.renderGrid();
                grid.drawPlacedBoats(boatsSprite);
            }
        } else {
            if (e.gridInfo.cell.containBoat) {
                var boatId = e.gridInfo.cell.boatId;
                var boatOrientation = e.gridInfo.cell.boatOrientation;
                grid.removePlacedBoat(boatId);

                var removedBoat = JSON.parse(JSON.stringify(DEFAULT_BOATS[boatId]));
                selectedBoat = new Boat(removedBoat.name, removedBoat.size, boatOrientation, removedBoat.id);
                document.getElementById(boatId).setAttribute('class', 'boat-selector');

                grid.clearCanvas();
                grid.renderGrid();
                grid.drawPlacedBoats(boatsSprite);
                grid.drawPreviewBoat(boatsSprite, selectedBoat, SPRITE[selectedBoat.id].y, e.gridInfo, .5);
            }
        }
    });
    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (selectedBoat) {
            selectedBoat.orientation = selectedBoat.orientation == HORIZONTAL ? VERTICAL : HORIZONTAL;
            var possibleToPlace = grid.canPlaceBoat(e.gridInfo.coords, selectedBoat);
            var alpha = possibleToPlace ? 1 : .5;
            grid.clearCanvas();
            grid.renderGrid();
            grid.drawPlacedBoats(boatsSprite);
            grid.drawPreviewBoat(boatsSprite, selectedBoat, SPRITE[selectedBoat.id].y, e.gridInfo, alpha);
        }
    });

    var boatSelecters = document.getElementsByClassName('boat-selector');
    for (var i = 0; i < boatSelecters.length; i++) {
        boatSelecters[i].addEventListener('click', function (e) {
            var placed = this.getAttribute('data-placed').toBool();
            if (!placed) {
                var boatSelecters = document.getElementsByClassName('boat-selector');
                var previousBoatOrientation = HORIZONTAL;

                var name = this.innerHTML,
                    size = this.getAttribute('data-boat-size'),
                    id = this.id;
                selectedBoat = new Boat(name, size, previousBoatOrientation, id);
            }
        });
    }

    randomGenerator.addEventListener('click', random);

    function random(e) {
        grid.randomBoatsPosition(JSON.parse(JSON.stringify(DEFAULT_BOATS)));
        grid.drawPlacedBoats(boatsSprite);
        selectedBoat = null;

        var selectors = document.getElementsByClassName('boat-selector');
        for (var i = 0; i < selectors.length; i++) {
            selectors[i].className = 'boat-selector placed';
        }
        
        randomGenerator.removeEventListener('click', random);
        randomGenerator.remove();
    }
}
window.addEventListener('resize', function (e) {
    var newWidth = parseInt(getComputedStyle(canvasContainer).width);
    grid.rescaleCanvas(newWidth);
});

/*
(function animloop() {
	requestAnimFrame(animloop);
	// functions
})();
*/