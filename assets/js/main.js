"use strict";

const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 4;

const ITEMS_VERTICAL = 4;
const ITEMS_HORIZONTAL = 4;

class Fifteen_game {
	constructor(parent_node) {
		var this_game = this;
		var field_width = ITEMS_HORIZONTAL * 125 + "px";
		var field_height = ITEMS_VERTICAL * 125 + "px";
		this.finished = false;
		this.animation_style = document.head.appendChild(
			document.createElement("style")
		);
		this.map = [];
		for (var i = 0; i < ITEMS_HORIZONTAL; i++) {
			this.map[i] = [];
		}

		this.container_node = parent_node.appendChild(
			document.createElement("div")
		);
		this.container_node.classList.add("fifteen_container");
		this.container_node.style.width = field_width;

		this.main_node = this.container_node.appendChild(
			document.createElement("div")
		);
		this.main_node.classList.add("fifteen_field");
		this.main_node.style.width = field_width;
		this.main_node.style.height = field_height;

		this.refresh_button_node = this.container_node.appendChild(
			document.createElement("button")
		);
		this.refresh_button_node.classList.add("refresh");
		this.refresh_button_node.addEventListener("click", function () {
			this_game.refresh_click(this_game);
		});

		for (var y = 0; y < ITEMS_VERTICAL; y++) {
			for (var x = 0; x < ITEMS_HORIZONTAL; x++) {
				this.animation_style.innerText += `
				.fifteen_field.win .item[data-x="${x}"][data-y="${y}"]{
					transition-duration: ${rnd_num(10, 30)}s;
					transform: translateX(${rnd_num(-500, 500)}px) translateY(${rnd_num(
					-500,
					500
				)}px) translateZ(${rnd_num(-500, 500)}px) rotate3d(${rnd_num(
					5,
					10
				)}, ${rnd_num(-4, 4)}, ${rnd_num(-4, 4)}, ${rnd_num(
					90,
					270
				)}deg);
					opacity: 0;
				}`;

				if (x === ITEMS_HORIZONTAL - 1 && y === ITEMS_VERTICAL - 1) {
					this.map[x][y] = null;
					continue;
				}
				var cur_item = this.main_node.appendChild(
					document.createElement("div")
				);
				cur_item.textContent = ITEMS_HORIZONTAL * y + x + 1;
				cur_item.classList.add("item");
				cur_item.dataset.x = x;
				cur_item.dataset.y = y;
				cur_item.addEventListener("click", function () {
					this_game.click(this, this_game);
				});
				this.map[x][y] = {
					n: ITEMS_HORIZONTAL * y + x + 1,
					node: cur_item,
				};
			}
		}

		this.congratulations_node = this.main_node.appendChild(
			document.createElement("div")
		);
		this.congratulations_node.classList.add("congratulations");
		this.congratulations_text_node = this.congratulations_node.appendChild(
			document.createElement("div")
		);
		this.congratulations_text_node.classList.add("text");
		this.congratulations_text_node.textContent = "Congratulations!";

		this.move_audio = this.container_node.appendChild(
			document.createElement("audio")
		);
		this.move_audio.src = "./assets/audio/move.mp3";
	}

	start() {
		this.flush();
		this.update_layout();
		this.finished = false;
		this.main_node.classList.remove("win");
	}

	flush() {
		shuffle_x2_array(this.map);
	}

	click(target, this_game) {
		if (this.finished) return false;
		var x = +target.dataset.x;
		var y = +target.dataset.y;
		var empty = this_game.get_empty();
		if (x !== empty.x && y !== empty.y) return false;

		if (x < empty.x) this_game.move(x, y, DIRECTION_RIGHT);
		if (x > empty.x) this_game.move(x, y, DIRECTION_LEFT);
		if (y < empty.y) this_game.move(x, y, DIRECTION_DOWN);
		if (y > empty.y) this_game.move(x, y, DIRECTION_UP);

		this_game.update_layout();
		if (this.is_completed())
			setTimeout(function () {
				this_game.finish();
			}, 500);

		setTimeout(function () {
			this_game.move_audio.play();
		}, 0);
		return true;
	}

	move(x, y, direction) {
		if (x === ITEMS_HORIZONTAL - 1 && direction === DIRECTION_RIGHT) return;
		if (x === 0 && direction === DIRECTION_LEFT) return;
		if (y === 0 && direction === DIRECTION_UP) return;
		if (y === ITEMS_VERTICAL - 1 && direction === DIRECTION_DOWN) return;
		var next_x, next_y;

		switch (direction) {
			case DIRECTION_LEFT: {
				next_x = x - 1;
				next_y = y;
				break;
			}
			case DIRECTION_RIGHT: {
				next_x = x + 1;
				next_y = y;
				break;
			}
			case DIRECTION_UP: {
				next_x = x;
				next_y = y - 1;
				break;
			}
			case DIRECTION_DOWN: {
				next_x = x;
				next_y = y + 1;
				break;
			}
			default: {
				return;
			}
		}

		if (this.map[next_x][next_y] !== null)
			this.move(next_x, next_y, direction);
		[this.map[x][y], this.map[next_x][next_y]] = [
			this.map[next_x][next_y],
			this.map[x][y],
		];
		return true;
	}

	update_layout() {
		for (var x in this.map) {
			for (var y in this.map[x]) {
				if (this.map[x][y] === null) continue;
				this.map[x][y].node.dataset.x = x;
				this.map[x][y].node.dataset.y = y;

				this.map[x][y].node.style.width =
					"calc(" + 100 / ITEMS_HORIZONTAL + "% - 4px)";
				this.map[x][y].node.style.height =
					"calc(" + 100 / ITEMS_VERTICAL + "% - 4px)";
				this.map[x][y].node.style.left =
					x * (100 / ITEMS_HORIZONTAL) + "%";
				this.map[x][y].node.style.top =
					y * (100 / ITEMS_VERTICAL) + "%";
			}
		}
	}

	get_empty() {
		for (var x = 0; x < this.map.length; x++) {
			for (var y = 0; y < this.map[x].length; y++) {
				if (this.map[x][y] === null) return { x: x, y: y };
			}
		}
	}

	is_completed() {
		for (var y = 0; y < ITEMS_VERTICAL; y++) {
			for (var x = 0; x < ITEMS_HORIZONTAL; x++) {
				if (this.map[x][y] === null) continue;
				if (this.map[x][y].n !== y * ITEMS_HORIZONTAL + x + 1)
					return false;
			}
		}
		return true;
	}

	finish() {
		this.finished = true;
		this.main_node.classList.add("win");
	}

	refresh_click(this_game) {
		this_game.flush();
		this_game.update_layout();
	}
}

function shuffle_x2_array(array) {
	for (var i = array.length * array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		[
			array[Math.floor(i / array.length)][i % array.length],
			array[Math.floor(j / array.length)][j % array.length],
		] = [
			array[Math.floor(j / array.length)][j % array.length],
			array[Math.floor(i / array.length)][i % array.length],
		];
	}
}

function rnd_num(min, max) {
	return min + Math.round(Math.random() * (max - min + 1) - 0.5);
}

var a = new Fifteen_game(document.body);
a.start();
