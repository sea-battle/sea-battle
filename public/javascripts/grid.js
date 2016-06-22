function Grid(canvas, playerId, type) {
	var self = this;
	this.playerId = playerId || null;
	this.canvas = canvas;
	this.container = this.canvas.parentNode;
	this.canvas.height = parseInt(getComputedStyle(this.container).height);
	this.canvas.width = this.canvas.height;
	this.ctx = this.canvas.getContext('2d');
	this.width = this.canvas.width;
	this.iterations = 10;
	this.cellWidth = this.width / this.iterations;
	this.cells = [];
	this.cellsContainingBoats = [];
	this.borderColor = '#000000';
	this.spriteCellDefaultSize = 32;
	this.shootedCells = [];
	this.highlightedOver = {
		x: null,
		y: null
	};
	this.highlightedSelected = {
		x: null,
		y: null
	};

	this.getCurrentCellInfos = function (e) {
		var pos = {
			x: e.offsetX || e.layerX,
			y: e.offsetY || e.layerY
		};

		e.cursorPos = pos;
		e.gridInfo = self.lookup(pos);
	}
	this.canvas.addEventListener('mousemove', this.getCurrentCellInfos);
	this.canvas.addEventListener('click', this.getCurrentCellInfos);
	this.canvas.addEventListener('contextmenu', this.getCurrentCellInfos);

	this.init();
	this.renderGrid(false);
	this.drawCoords();

	this.boats = {
		tp: {
			name: 'Torpedo',
			size: 2,
			id: 'tp',
			placed: false
		},
		sm: {
			name: 'Submarine',
			size: 3,
			id: 'sm',
			placed: false
		},
		dt: {
			name: 'Destroyer',
			size: 3,
			id: 'dt',
			placed: false
		},
		cr: {
			name: 'Cruiser',
			size: 4,
			id: 'cr',
			placed: false
		},
		ca: {
			name: 'Carrier',
			size: 5,
			id: 'ca',
			placed: false
		}
	};
	this.SPRITE = {
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
}
Grid.prototype = {
	init: function () {
		for (var i = 0; i < this.iterations; i++) {
			this.cells.push([]);
			for (var j = 0; j < this.iterations; j++) {
				this.cells[i].push({
					spriteY: null,
					containItem: false,
					containBoat: false,
					boatId: null,
					boatSize: null,
					boatOrientation: null,
					shooted: false,
					shootedBy: [],
					boatPart: null
				});
			}
		}
	},
	lookup: function (pos) {
		var x = Math.floor(pos.x / this.cellWidth);
		var y = Math.floor(pos.y / this.cellWidth);
		var cell = null;
		if (x >= 0 && y >= 0) {
			cell = this.cells[x][y];
		}
		return {
			coords: this.getMouseCoord(pos),
			cell: cell,
			positions: {
				t: this.cellWidth * y,
				l: this.cellWidth * x,
			},
			shootedCells: this.shootedCells
		}
	},
	getMouseCoord: function (pos) {
		return {
			x: Math.floor(pos.x / this.cellWidth),
			y: Math.floor(pos.y / this.cellWidth)
		};
	},
	renderGrid: function (optimised) {
		optimised = optimised == undefined ? true : false;
		var width = this.width;
		var cellWidth = this.cellWidth;
		this.ctx.strokeStyle = "#000";
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(0, 0);
		this.ctx.lineTo(width, 0);
		this.ctx.lineTo(width, width);
		this.ctx.lineTo(0, width);
		this.ctx.lineTo(0, 0);
		this.ctx.stroke()
		for (var n = 1; n < this.iterations; n++) {
			var position = cellWidth * n;

			this.ctx.moveTo(0, position);
			this.ctx.lineTo(width, position);
			this.ctx.moveTo(position, width);

			this.ctx.moveTo(position, 0);
			this.ctx.lineTo(position, width);
			this.ctx.moveTo(width, position);

			if (optimised) {
				this.ctx.stroke();
			} else {
				for (var i = 1; i <= 3; i++) {
					this.ctx.stroke();
				}
			}
		}
	},
	renderCell: function (coords) {
		this.ctx.strokeRect(this.cellWidth * coords.x, this.cellWidth * coords.y, this.cellWidth, this.cellWidth);
	},
	canPlaceBoat: function (cursorCoords, boat) {
		var limit = this.iterations;
		var checkedCoord = boat.orientation == HORIZONTAL ? 'x' : 'y';
		var i = 0;
		var inside = cursorCoords[checkedCoord] + parseInt(boat.size) < limit + 1;
		var canPlace = true;
		if (inside) {
			var coords = {
				x: cursorCoords.x,
				y: cursorCoords.y
			};
			while (i < boat.size && canPlace) {
				if (this.cells[coords.x][coords.y].containBoat) {
					canPlace = false;
				}
				coords[checkedCoord]++;
				i++;
			}
		} else {
			canPlace = false;
		}

		return canPlace;

	},
	highlightCell: function (coords) {
		var color = this.cellIsShooted(coords) ? "#F00" : "#FFA500";
		this.ctx.strokeStyle = color;
		if (this.highlightedOver.x != coords.x ||
			this.highlightedOver.y != coords.y) {
			if (this.highlightedOver.x != null &&
				this.highlightedOver.y != null) {
				this.clearHighlightCell(this.highlightedOver);
			}
			this.ctx.strokeStyle = color;
			for (var i = 1; i <= 3; i++) {
				this.renderCell(coords);
			}
		}

		if (this.highlightedSelected.x != null &&
			this.highlightedSelected.y != null) {
			color = this.cellIsShooted(this.highlightedSelected) ? "#F00" : "#FFA500";
			this.ctx.strokeStyle = color;
			for (var i = 1; i <= 3; i++) {
				this.renderCell(this.highlightedSelected);
			}
		}
	},
	clearHighlightCell: function (coords) {
		this.ctx.strokeStyle = "#000";
		for (var i = 1; i <= 3; i++) {
			this.renderCell(coords);
		}
	},
	clearCanvas: function () {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width);
	},
	drawImg: function (img, coords, deg, alpha) {
		var sx = coords.sx,
			sy = coords.sy,
			swidth = coords.swidth,
			x = coords.x,
			y = coords.y,
			width = coords.width;

		var rad = deg * Math.PI / 180;
		this.ctx.globalAlpha = alpha;
		this.ctx.translate(x + width / 2, y + width / 2);
		this.ctx.rotate(rad);
		this.ctx.drawImage(img, sx, sy, swidth, swidth, width / 2 * (-1), width / 2 * (-1), width, width);
		this.ctx.rotate(rad * (-1));
		this.ctx.translate((x + width / 2) * (-1), (y + width / 2) * (-1));

		//reset
		this.ctx.globalAlpha = 1;
	},
	drawPreviewBoat: function (sprite, boat, gridInfo, alpha) {
		var size = boat.size;
		if (boat.orientation == HORIZONTAL) {
			var coordToIncrement = 'x';
			var deg = -90;
		} else {
			var coordToIncrement = 'y';
			var deg = 0;
		}
		var drawCoord = {
			sx: 0,
			sy: 0,
			swidth: this.spriteCellDefaultSize,
			x: gridInfo.coords.x * this.cellWidth,
			y: gridInfo.coords.y * this.cellWidth,
			width: this.cellWidth,
		}
		var sy = this.SPRITE[boat.id].y;

		var coordToIncrementStartValue = drawCoord[coordToIncrement];
		for (var i = 0; i < size; i++) {
			drawCoord[coordToIncrement] = coordToIncrementStartValue + (this.cellWidth * i);
			drawCoord.sy = (this.spriteCellDefaultSize * sy) + (this.spriteCellDefaultSize * i);
			this.drawImg(sprite, drawCoord, deg, alpha);
		}
	},
	drawPlacedBoats: function (sprite) {
		var self = this;
		this.cellsContainingBoats.forEach(function (cell, i) {
			if (cell.orientation == HORIZONTAL) {
				var coordToIncrement = 'x';
				var deg = -90;
			} else {
				var coordToIncrement = 'y';
				var deg = 0;
			}

			var drawCoord = {
				sx: 0,
				sy: cell.spriteY * self.spriteCellDefaultSize,
				swidth: self.spriteCellDefaultSize,
				x: cell.coords.x * self.cellWidth,
				y: cell.coords.y * self.cellWidth,
				width: self.cellWidth,
			};
			var coordToIncrementStartValue = drawCoord[coordToIncrement];
			drawCoord[coordToIncrement] = coordToIncrementStartValue + (self.cellWidth * cell.i);
			self.drawImg(sprite, drawCoord, deg, 1);
		});
	},
	drawShoots: function (sprite) {
		var self = this;
		self.shootedCells.forEach(function (cell) {
			var coords = cell.coords;
			if (self.cells[coords.x][coords.y].containBoat) {
				var deg = self.cells[coords.x][coords.y].boatOrientation == HORIZONTAL ? -90 : 0;
				var drawCoord = {
					sx: 6 * self.spriteCellDefaultSize,
					sy: self.cells[coords.x][coords.y].spriteY * self.spriteCellDefaultSize,
					swidth: self.spriteCellDefaultSize,
					x: coords.x * self.cellWidth,
					y: coords.y * self.cellWidth,
					width: self.cellWidth,
				}
				self.drawImg(sprite, drawCoord, deg, 1);
			} else if (cell.touched) {
				self.ctx.strokeStyle = "#000";
				self.ctx.lineWidth = 1;

				var x = self.cellWidth * coords.x;
				var y = self.cellWidth * coords.y;

				self.ctx.moveTo(x, y);
				self.ctx.lineTo(x + self.cellWidth, y + self.cellWidth);

				self.ctx.moveTo(x + self.cellWidth, y);
				self.ctx.lineTo(x, y + self.cellWidth);
				self.ctx.stroke()
			} else {
				self.ctx.fillStyle = '#000';
				self.ctx.fillRect(self.cellWidth * coords.x + 1, self.cellWidth * coords.y + 1, self.cellWidth - 1, self.cellWidth - 1);
			}

			self.ctx.strokeStyle = "#000";
		});
	},
	drawCoords: function () {
		this.ctx.fillStyle = "#000";
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = "bottom";
		var px = parseInt(this.cellWidth / 3);
		this.ctx.font = px + "px Arial";
		var AcharCode = 65;
		for (var n = 0; n < this.iterations; n++) {
			var position = this.cellWidth * n;
			var text = n + '';
			var halfTextWidth = this.ctx.measureText(text).width / 2;
			var halfCellWidth = this.cellWidth / 2;
			var x = position + halfCellWidth - halfTextWidth;
			var y = px;
			var letter = String.fromCharCode(AcharCode + n);
			this.ctx.fillText(letter, x, y);
			y = x + px; // font height
			x = halfTextWidth;
			this.ctx.fillText(text, x, y);
		}
	},
	placeBoat: function (boat, coords) {
		if (this.canPlaceBoat(coords, boat) && !this.allBoatsArePlaced()) {
			this.boats[boat.id].placed = true;
			var coordToChange = boat.orientation == HORIZONTAL ? 'x' : 'y';
			var placeCoord = {
				x: coords.x,
				y: coords.y
			};
			for (var i = 0; i < boat.size; i++) {
				this.cells[placeCoord.x][placeCoord.y].spriteY = this.SPRITE[boat.id].y + i;
				this.cells[placeCoord.x][placeCoord.y].containBoat = true;
				this.cells[placeCoord.x][placeCoord.y].boatId = boat.id;
				this.cells[placeCoord.x][placeCoord.y].boatSize = boat.size;
				this.cells[placeCoord.x][placeCoord.y].boatOrientation = boat.orientation;
				this.cells[placeCoord.x][placeCoord.y].boatPart = i;
				this.cellsContainingBoats.push({
					spriteY: this.SPRITE[boat.id].y + i,
					orientation: boat.orientation,
					coords: JSON.parse(JSON.stringify(coords)),
					i: i,
					x: placeCoord.x,
					y: placeCoord.y,
					boatId: boat.id,
					boatSize: boat.size,
					boatOrientation: boat.orientation
				});

				placeCoord[coordToChange]++;
			}
		}
	},
	removePlacedBoat: function (boatId) {
		var i = this.cellsContainingBoats.length - 1;
		while (i >= 0) {
			var cell = this.cellsContainingBoats;
			if (cell[i].boatId == boatId) {
				this.cells[cell[i].x][cell[i].y].spriteY = null;
				this.cells[cell[i].x][cell[i].y].containBoat = false;
				this.cells[cell[i].x][cell[i].y].boatId = null;
				this.cells[cell[i].x][cell[i].y].boatOrientation = null;
				cell.splice(i, 1);
			}
			i--;
		}
		this.boats[boatId].placed = false;
	},
	rescaleCanvas: function (newWidth, sprite) {
		this.canvas.setAttribute('width', newWidth);
		this.canvas.setAttribute('height', newWidth);
		this.width = newWidth;
		this.cellWidth = newWidth / grid.iterations;
		this.clearCanvas();
		this.renderGrid();
		this.drawPlacedBoats(sprite);
	},
	randomBoatsPosition: function () {
		var self = this;
		var defaultBoats = self.getDefaultBoats();
		for (var key in defaultBoats) {
			if (!defaultBoats.hasOwnProperty(key)) continue;
			if (!defaultBoats[key].placed) {
				var orientations = [HORIZONTAL, VERTICAL];
				var obj = defaultBoats[key];
				var randomMax = self.iterations + 1 - obj['size'];
				var randomMin = 0;

				var name = defaultBoats[key].name;
				var size = defaultBoats[key].size;
				var orientation = orientations[self.getRandom(0, 1, true)];
				var id = defaultBoats[key].id;
				var randomBoat = new Boat(name, size, orientation, id);
				var canPlace = false;
				while (!canPlace) {
					var x = self.getRandom(randomMin, randomMax, false);
					var y = self.getRandom(randomMin, randomMax, false);
					canPlace = self.canPlaceBoat({
						x: x,
						y: y
					}, randomBoat);
					if (canPlace) {
						self.placeBoat(randomBoat, {
							x: x,
							y: y
						}, this.SPRITE[randomBoat.id].y);
					}
				}
			}
		}
	},
	getRandom: function (min, max, round) {
		return round ? Math.round(Math.random() * (max - min) + min) : Math.floor(Math.random() * (max - min) + min);
	},
	getDefaultBoats: function (boatId) {
		if (boatId) {
			return JSON.parse(JSON.stringify(this.boats[boatId]));
		} else {
			return JSON.parse(JSON.stringify(this.boats));
		}
	},
	allBoatsArePlaced: function () {
		return this.cellsContainingBoats.length == 17;
	},
	cellIsShooted: function (coords) {
		var i = 0;
		var found = false;
		while (i < this.shootedCells.length && !found) {
			if (coords.x == this.shootedCells[i].coords.x &&
				coords.y == this.shootedCells[i].coords.y) {
				found = true;
			}
			i++;
		}
		return found;
	}
};