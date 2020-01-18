export default class Whiteboard {
	constructor(refNode) {
		this.el = document.createElement("canvas");
		this._ref = refNode;

		this.sync();
	}

	sync() {
		let { el } = this;
		let { width, height } = this._ref.getBoundingClientRect();
		if(el.getAttribute("width") !== width.toString() ||
				el.getAttribute("height") !== height.toString()) {
			el.setAttribute("width", width);
			el.setAttribute("height", height);
		}
	}
}
