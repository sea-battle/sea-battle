fillPlayersInfos();
var HORIZONTAL = 'h';
var VERTICAL = 'v';

var playerCanvas = document.getElementById('player-canvas');
var boatsContainer = document.getElementById('boats-container');
var canvasWrapper = document.getElementById('canvas-wrapper');
var randomGenerator = document.getElementById('random');
var boatSelecters = document.getElementsByClassName('boat-selector');
var timer = document.getElementById('timer');
var otherPlayersCanvasContainer = document.getElementById('other-players-canvas');
var fireCanvasContainer = document.getElementById('fire-canvas-wrapper');
var rankList = document.getElementById('rank-list');
var phaseTitle = document.getElementById('phase-title');

var grids = [];
var shooterGrid;
var selectedBoat = null;
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
					grid.drawCoords();
					grid.renderGrid();
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
					grid.renderGrid();
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
						grid.drawPlacedBoats(boatsSprite);
						grid.drawPreviewBoat(boatsSprite, selectedBoat, e.gridInfo, alpha);
						grid.drawCoords();
						grid.renderGrid();
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
				grid.drawPlacedBoats(boatsSprite);
				grid.drawPreviewBoat(boatsSprite, selectedBoat, e.gridInfo, alpha);
				grid.drawCoords();
				grid.renderGrid();
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
			grid.renderGrid();
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
				var gridId = this.getAttribute('data-player-id');
				cloneGrid(gridId, grid);
				grid.clearCanvas();
				grid.renderGrid();
				grid.drawPlacedBoats(boatsSprite);
				grid.drawShoots(boatsSprite);
			}
		},
		shooterGrid: {
			click: function (e) {
				if (shooterGrid.highlightedSelected.x != null &&
					shooterGrid.highlightedSelected.y != null) {
					grids.forEach(function (g) {
						shooterGrid.clearHighlightCell(shooterGrid.highlightedSelected);
					});
				}

				grids.forEach(function (g) {
					g.clearHighlightCell(shooterGrid.highlightedSelected);
					g.highlightedSelected = e.gridInfo.coords
					g.highlightCell(e.gridInfo.coords);
				});
				if (!shooterGrid.cellIsShooted(e.gridInfo.coords)) {
					socket.emit('game-shoot', e.gridInfo.coords);
				}
			},
			mousemove: function (e) {
				grids.forEach(function (g) {
					g.highlightCell(e.gridInfo.coords);
					g.highlightedOver = e.gridInfo.coords;
				});
			}
		}
	},
	gameover: {
		replay: function (e) {
			ajax.get('/wait', function (data) {
				socket.emit('game-replay');
				socket.on('replay-init-done', function () {
					handlers.onComplete(data);
				});
			});
		},
		quit: function (e) {
			window.location.href = '/rooms';
		}
	}
};
var previousMouseCoords = undefined;
var boatsSprite = new Image();
var grid;

function findGridByPlayerId(playerId) {
	for (var i = 0; i < grids.length; i++) {
		if (grids[i].playerId == playerId) {
			return grids[i];
		}
	}
	return null;
}
function manageRankList(playersInfos) {
	rankList.removeChildren();
	var position = 1;
	for (var i = playersInfos.length - 1; i >= 0; i--, position++) {
		var infos = playersInfos[i];
		var newLi = document.createElement('li');
		var pPosition = document.createElement('p');
		var pPseudo = document.createElement('p');
		var pPoints = document.createElement('p');

		pPosition.className = 'rank-position';
		pPosition.innerHTML = position;
		pPseudo.className = 'rank-username';
		pPseudo.innerHTML = infos.name;
		pPoints.className = 'rank-points';
		pPoints.id = infos.id + '-points';
		pPoints.innerHTML = infos.points;

		newLi.appendChild(pPosition);
		newLi.appendChild(pPseudo);
		newLi.appendChild(pPoints);
		rankList.appendChild(newLi);
	}
}
function cloneGrid(from, to) {
	var g;
	if (typeof from == 'string') {
		g = findGridByPlayerId(from);
	} else if (typeof from == 'object') {
		if (from instanceof Grid) {
			g = from;
		} else {
			console.error('Bad param');
			return;
		}
	}
	to.cells = JSON.parse(JSON.stringify(g.cells));
	to.cellsContainingBoats = JSON.parse(JSON.stringify(g.cellsContainingBoats));
	to.shootedCells = JSON.parse(JSON.stringify(g.shootedCells));
}

socket.emit('game-init');
socket.on('init', function (playerId, playersInfos) {
	grid = new Grid(playerCanvas, "viewer");
	grids.push(grid);
	manageRankList(playersInfos);

	
	boatsSprite.src = "/images/sprites.png";
	boatsSprite.onload = function () {
		// PLACEMENT STAGE
		playerCanvas.addEventListener('mousemove', gameHandlers.placementStage.mousemove);
		playerCanvas.addEventListener('click', gameHandlers.placementStage.click);
		playerCanvas.addEventListener('contextmenu', gameHandlers.placementStage.contextmenu);

		for (var i = 0; i < boatSelecters.length; i++) {
			boatSelecters[i].addEventListener('click', gameHandlers.placementStage.selectBoat);
		}
		randomGenerator.addEventListener('click', gameHandlers.placementStage.random);
	}

	window.addEventListener('resize', function (e) {
		grids.forEach(function (g) {
			var newWidth = parseInt(getComputedStyle(g.container).width);
			g.rescaleCanvas(newWidth, boatsSprite);
		});
	});
});
socket.on('game-timer-update', function (timeRemaining) {
	timer.innerHTML = timeRemaining + 's';
});
socket.on('game-check-grid', function () {
	if (!grid.allBoatsArePlaced()) {
		gameHandlers.placementStage.random();
		grid.drawPlacedBoats(boatsSprite);
	}
	playerCanvas.removeEventListener('click', gameHandlers.placementStage.click);
	playerCanvas.removeEventListener('mousemove', gameHandlers.placementStage.mousemove);
	playerCanvas.removeEventListener('contextmenu', gameHandlers.placementStage.contextmenu);

	socket.emit('game-set-ready', grid.cells);
});
socket.on('game-init-players-grids', function (players) {
	document.getElementById('boats-container').addClass('hidden')
	document.getElementById('other-players-canvas').removeClass('hidden');
	/*    canvasWrapper.removeClass('placement-phase');
	    canvasWrapper.addClass('fire-phase');*/
	phaseTitle.innerHTML = 'Phases de tir';
	players.forEach(function (player) {
		var div = document.createElement('div');
		var playerName = document.createElement('p');
		var otherCanvasWrapper = document.createElement('div');
		var otherPlayerCanvas = document.createElement('canvas');

		playerName.className = 'player-username';
		playerName.innerHTML = player.name;
		otherCanvasWrapper.className = 'canvas-wrapper';
		otherPlayerCanvas.setAttribute('data-player-id', player.id);

		div.appendChild(playerName);
		otherCanvasWrapper.appendChild(otherPlayerCanvas);
		div.appendChild(otherCanvasWrapper);
		otherPlayersCanvasContainer.appendChild(div);

		var otherPlayerGrid = new Grid(otherPlayerCanvas, player.id);
		grids.push(otherPlayerGrid);
		otherPlayerCanvas.addEventListener('click', gameHandlers.battleStage.otherPlayersGrid.click);
		if (playerInfos.id == player.id) {
			cloneGrid(grid, otherPlayerGrid);
			otherPlayerGrid.cells = JSON.parse(JSON.stringify(grid.cells));
			otherPlayerGrid.cellsContainingBoats = JSON.parse(JSON.stringify(grid.cellsContainingBoats));
			otherPlayerGrid.shootedCells = JSON.parse(JSON.stringify(grid.shootedCells));
			otherPlayerGrid.drawPlacedBoats(boatsSprite);
		}
	});

	// grid shooter
	var shooterCanvas = document.createElement('canvas');
	shooterCanvas.id = 'shooter-canvas';
	fireCanvasContainer.appendChild(shooterCanvas);
	document.getElementById('fire-canvas').removeClass('hidden');
	shooterGrid = new Grid(shooterCanvas, 'shooter');
	grids.push(shooterGrid);
	shooterCanvas.addEventListener('click', gameHandlers.battleStage.shooterGrid.click);
	shooterCanvas.addEventListener('mousemove', gameHandlers.battleStage.shooterGrid.mousemove);
});
socket.on('update-after-turn', function (touchedPlayers, playersInfos) {
    /*
	// TEST to implement (almost right)
	var playerHasTouched = false;
	var playerShootCoord = null;
	for (var player in touchedPlayers) {
	    var currentGrid = findGridByPlayerId(player);
	    touchedPlayers[player].touchedAt.forEach(function (data) {
	        currentGrid.cells[data.coords.x][data.coords.x].shooted = true;
	        currentGrid.cells[data.coords.x][data.coords.x].shootedBy = data.by;
	        currentGrid.shootedCells.push({
	            coords: JSON.parse(JSON.stringify(data.coords)),
	            touched: data.touched
	        });

	        // can enter here many times if player shooted many other players
	        if (data.byId == playerInfos.id) {
	            if (playerShootCoord == null) {
	                playerShootCoord = JSON.parse(JSON.stringify(data.coords));
	            }

	            if (data.touched) {
	                playerHasTouched = true;
	            }
	        }
	    });

	    shooterGrid.shootedCells.push({
	        coords: playerShootCoord,
	        touched: playerHasTouched
	    });

	    if (player == playerInfos.id) {
	        cloneGrid(currentGrid, grid);
	        grid.clearCanvas();
	        grid.renderGrid();
	        grid.drawPlacedBoats(boatsSprite);
	        grid.drawShoots(boatsSprite);
	    }
	}
    */

    
	// OLD VERSION (bugged but needed for demo...)
	for (var player in touchedPlayers) {
		var currentGrid = findGridByPlayerId(player);
		touchedPlayers[player].touchedAt.forEach(function (data) {
			currentGrid.cells[data.coords.x][data.coords.x].shooted = true;
			currentGrid.cells[data.coords.x][data.coords.x].shootedBy = data.by;
			currentGrid.shootedCells.push({
				coords: JSON.parse(JSON.stringify(data.coords)),
				touched: data.touched
			});
			if (data.byId == playerInfos.id) {
				shooterGrid.shootedCells.push({
					coords: JSON.parse(JSON.stringify(data.coords)),
					touched: data.touched
				});
			}

		});

		if (player == playerInfos.id) {
			cloneGrid(currentGrid, grid);
			grid.clearCanvas();
			grid.renderGrid();
			grid.drawPlacedBoats(boatsSprite);
			grid.drawShoots(boatsSprite);
		}
	}

	grids.forEach(function (g) {
		g.drawShoots(boatsSprite);
	});
	manageRankList(playersInfos);
});
socket.on('gameover', function (winners) {
	if (winners.length > 1) {
		var text = 'Winners are ';
		winners.forEach(function (winner, i) {
			if (i == 0) {
				text += winner.name;
			} else {
				text = +', ' + winner.name;
			}
		});
	} else {
		var text = 'The winner is ' + winners[0].name;
	}
	var shooterCan = document.getElementById('shooter-canvas');
	shooterCan.removeEventListener('click', gameHandlers.battleStage.shooterGrid.click);
	shooterCan.removeEventListener('mousemove', gameHandlers.battleStage.shooterGrid.mousemove);
	document.getElementById('replay-modal').style.display = 'block';
	document.getElementById('winner').innerHTML = text;

	document.getElementById('button-replay').addEventListener('click', gameHandlers.gameover.replay);
	document.getElementById('button-quit').addEventListener('click', gameHandlers.gameover.quit);
});