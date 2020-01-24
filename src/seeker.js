/* eslint-env browser */
export default class VidSeeker extends HTMLElement {
	connectedCallback() {
		let slider = this.querySelector("input[type=range]");
		let vid = this.closest("air-vid")._vid; // FIXME: breaks encapsulation
		let context = {
			field: slider,
			video: vid,
			max: parseInt(slider.max, 10) // optimization
		};
		slider.addEventListener("input", this.onChange.bind(context));
		vid.addEventListener("timeupdate", this.onUpdate.bind(context));
	}

	onChange(ev) {
		let vid = this.video;
		let { duration } = vid;
		if(duration) {
			vid.currentTime = (this.field.value / this.max) * duration;
		}
	}

	onUpdate(ev) {
		let { currentTime, duration } = this.video;
		this.field.value = currentTime / duration * this.max;
	}
}
