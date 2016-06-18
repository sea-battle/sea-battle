function Grid(canvas, playerId) {
	var self = this;
	this.playerId = playerId || null;
	this.canvas = canvas;
	this.container = this.canvas.parentNode;
	this.canvas.width = parseInt(getComputedStyle(this.container).width);
	this.canvas.height = this.canvas.width;
	this.ctx = this.canvas.getContext('2d');
	this.width = this.canvas.width;
	this.iterations = 10;
	this.cellWidth = this.width / this.iterations;
	this.cells = [];
	this.cellsContainingBoats = [];
	this.borderColor = '#000000';
	this.spriteCellDefaultSize = 32;
	this.shootedCells = [];

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
	this.renderGrid();
	//this.drawCoords();
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
					shootedBy: []
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
			}
		}
	},
	getMouseCoord: function (pos) {
		return {
			x: Math.floor(pos.x / this.cellWidth),
			y: Math.floor(pos.y / this.cellWidth)
		};
	},
	renderGrid: function () {
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

			this.ctx.stroke();
		}
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
		this.ctx.fillStyle = "#F00";
		this.ctx.fillRect(this.cellWidth * coords.x + 1, this.cellWidth * coords.y + 1, this.cellWidth - 1, this.cellWidth - 1);
	},
	clearCell: function (coords) {
		this.ctx.clearRect(this.cellWidth * coords.x + 3, this.cellWidth * coords.y + 3, this.cellWidth - 2, this.cellWidth - 2);
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
	drawPreviewBoat: function (sprite, boat, spriteY, gridInfo, alpha) {
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
		var sy = spriteY;

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
			//self.clearCell(coords);
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
				self.ctx.fillStyle = '#F00';
				self.ctx.fillRect(self.cellWidth * coords.x + 1, self.cellWidth * coords.y + 1, self.cellWidth - 1, self.cellWidth - 1);
			} else {
				self.ctx.fillStyle = '#000';
				self.ctx.fillRect(self.cellWidth * coords.x + 1, self.cellWidth * coords.y + 1, self.cellWidth - 1, self.cellWidth - 1);
			}
		});
	},
	drawCoords: function () {
		this.ctx.fillStyle = "#000";
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = "bottom";
        this.ctx.font="20px Arial";
        console.log('this.iterations:', this.iterations);
		for (var n = 0; n < this.iterations; n++) {
			var position = this.cellWidth * n;
			var text = n + '';
			var halfTextWidth = this.ctx.measureText(text).width / 2;
			var halfCellWidth = this.cellWidth / 2;
			var x = position + halfCellWidth - halfTextWidth;
			var y = 20;
			this.ctx.fillText(text, x, y);
            y = x + 15; // font height
			x = 0 + halfTextWidth;
            this.ctx.fillText(text, x, y);
		}
	},
	placeBoat: function (boat, coords, spriteY) {
		var coordToChange = boat.orientation == HORIZONTAL ? 'x' : 'y';
		var placeCoord = {
			x: coords.x,
			y: coords.y
		};
		for (var i = 0; i < boat.size; i++) {
			this.cells[placeCoord.x][placeCoord.y].spriteY = spriteY + i;
			this.cells[placeCoord.x][placeCoord.y].containBoat = true;
			this.cells[placeCoord.x][placeCoord.y].boatId = boat.id;
			this.cells[placeCoord.x][placeCoord.y].boatSize = boat.size;
			this.cells[placeCoord.x][placeCoord.y].boatOrientation = boat.orientation;
			this.cellsContainingBoats.push({
				spriteY: spriteY + i,
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
	randomBoatsPosition: function (defaultBoats) {
		var self = this;
		for (var key in defaultBoats) {
			if (!defaultBoats.hasOwnProperty(key)) continue;
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
					}, SPRITE[randomBoat.id].y);
				}
			}

		}
	},
	getRandom: function (min, max, round) {
		return round ? Math.round(Math.random() * (max - min) + min) : Math.floor(Math.random() * (max - min) + min);
	},
	allBoatsArePlaced: function () {
		return this.cellsContainingBoats.length == 17;
	}
};