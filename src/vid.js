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
		let board = this._board = new Whiteboard(vid);
		this.appendChild(board.el);

		let controls = this.querySelector(".controls");
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
			this.exec(el.name);
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
