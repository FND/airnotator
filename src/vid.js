/* eslint-env browser */
import Whiteboard from "./board.js";

let COMMANDS = {
	fullscreen: self => {
		if(document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			self.requestFullscreen();
		}
		self.refresh(); // XXX: apparent race condition; use resize event instead?
	},
	annotate: self => {
		let active = self.classList.toggle("is-annotating");
		if(active) {
			self.refresh();
		}
	},
	reset: self => {
		self._board.clear();
	},
	speed: (self, el) => {
		// TODO: sync button and field states
		let cls = "is-selected";
		let container = el.parentNode; // XXX: tight coupling
		container.querySelectorAll(`.${cls}`).forEach(el => {
			el.classList.remove(cls);
		});
		if(el.nodeName === "BUTTON") {
			el.classList.add(cls);
		}

		self.speed = parseFloat(el.value);
	},
	color: self => {
		self.color = self.color; // eslint-disable-line no-self-assign
	},
	brush: self => {
		self.brush = self.brush; // eslint-disable-line no-self-assign
	},
	"media-file": (self, field) => {
		let file = field.files[0];
		let vid = self._vid;
		try {
			vid.srcObject = file;
		} catch(err) { // legacy
			vid.src = URL.createObjectURL(file);
		}
	}
};

export default class AirVid extends HTMLElement {
	connectedCallback() {
		let vid = this._vid = document.querySelector("video");
		let controls = this._controls = this.querySelector(".controls");
		let board = this._board = new Whiteboard(this.color, this.brush, vid);
		this.appendChild(board.el);

		controls.addEventListener("click", this.onClick.bind(this));
		controls.addEventListener("change", this.onChange.bind(this));
		document.addEventListener("fullscreenchange", onFullscreen);
	}

	disconnectedCallback() {
		document.removeEventListener("fullscreenchange", onFullscreen);
	}

	onClick(ev) {
		let el = ev.target;
		if(el.matches("button[name]")) { // event delegation
			this.exec(el.name, el);
		}
	}

	onChange(ev) {
		let el = ev.target;
		if(el.matches("input[name]")) { // event delegation
			this.exec(el.name, el);
		}
	}

	exec(name, ...args) {
		let cmd = COMMANDS[name];
		if(!cmd) {
			console.error(`invalid command: ${name}`);
			return;
		}
		cmd(this, ...args);
	}

	refresh() {
		this._board.sync();
	}

	set speed(rate) {
		this._vid.playbackRate = rate;
	}

	get color() {
		return this._controls.querySelector("input[name=color]").value;
	}

	set color(value) {
		this._board.color = value;
	}

	get brush() {
		let value = this._controls.querySelector("input[name=brush]").value;
		return parseInt(value, 10);
	}

	set brush(value) {
		this._board.brush = value;
	}
}

function onFullscreen(ev) {
	let cls = "is-fullscreen";
	let el = document.fullscreenElement;
	if(el) {
		el.classList.add(cls);
		return;
	}

	let nodes = document.querySelectorAll(cls);
	[...nodes].forEach(node => {
		node.classList.remove(cls);
	});
}
