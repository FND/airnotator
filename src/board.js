export default class Whiteboard {
	constructor(refNode) {
		// XXX: hard-coded values
		this.color = "#F0F";
		this.stroke = 2;

		let cv = this.el = document.createElement("canvas");
		this._ref = refNode;

		this.sync();

		[
			"onTouchStart", "onTouchEnd", "onTouchMove",
			"onPointerStart", "onPointerEnd", "onPointerMove"
		].forEach(name => {
			this[name] = this[name].bind(this);
		});
		cv.addEventListener("mousedown", this.onPointerStart);
		cv.addEventListener("touchstart", this.onTouchStart);
	}

	onTouchStart(ev) {
		ev.preventDefault();

		let { el } = this;
		el.addEventListener("touchend", this.onTouchEnd);
		el.addEventListener("touchmove", this.onTouchMove);

		let { clientX, clientY } = ev.changedTouches[0];
		this.onPointerStart({ clientX, clientY }); // XXX: hacky
	}

	onTouchEnd(ev) {
		ev.preventDefault();

		let { clientX, clientY } = ev.changedTouches[0];
		this.onPointerEnd({ clientX, clientY }); // XXX: hacky

		let { el } = this;
		el.removeEventListener("mouseup", this.onPointerEnd);
		el.removeEventListener("mousemove", this.onPointerMove);
	}

	onTouchMove(ev) {
		ev.preventDefault();

		let { clientX, clientY } = ev.changedTouches[0];
		this.onPointerMove({ clientX, clientY }); // XXX: hacky
	}

	onPointerStart(ev) {
		let { el } = this;
		el.addEventListener("mouseup", this.onPointerEnd);
		el.addEventListener("mousemove", this.onPointerMove);

		this.sync();

		let ctx = this._scene = el.getContext("2d", { desynchronized: true });
		ctx.strokeStyle = this.color;
		ctx.lineWidth = this.stroke;
		this._lastPos = this.relPos(ev.clientX, ev.clientY);
	}

	onPointerEnd(ev) {
		let { el } = this;
		el.removeEventListener("mouseup", this.onPointerEnd);
		el.removeEventListener("mousemove", this.onPointerMove);

		this.render(this.relPos(ev.clientX, ev.clientY));
		this._lastPos = null;
		this._box = null;
	}

	onPointerMove(ev) {
		this.render(this.relPos(ev.clientX, ev.clientY));
	}

	render({ x, y }) {
		let prev = this._lastPos;
		this._lastPos = { x, y };
		let ctx = this._scene;
		ctx.moveTo(prev.x, prev.y);
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	relPos(x, y) {
		let { left, top } = this._box;
		return {
			x: x - left,
			y: y - top
		};
	}

	sync() {
		let { el } = this;
		let { width, height } = this._box = this._ref.getBoundingClientRect();
		if(el.getAttribute("width") !== width.toString() ||
				el.getAttribute("height") !== height.toString()) {
			el.setAttribute("width", width);
			el.setAttribute("height", height);
		}
	}
}
