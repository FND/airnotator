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
		// improve scrubbing performance
		// cf. https://kitchen.vibbio.com/blog/optimizing-html5-video-scrubbing/
		vid.addEventListener("seeking", ev => {
			context.seeking = true;
		});
		vid.addEventListener("seeked", ev => {
			context.seeking = false;
			let { target, video } = context;
			if(target && video.currentTime !== target) {
				video.currentTime = target;
				context.target = null;
			}
		});
	}

	onChange(ev) {
		let vid = this.video;
		let { duration } = vid;
		if(duration) {
			let time = (this.field.value / this.max) * duration;
			if(this.seeking) {
				this.target = time;
			} else {
				vid.currentTime = time;
			}
		}
	}

	onUpdate(ev) {
		let { currentTime, duration } = this.video;
		this.field.value = currentTime / duration * this.max;
	}
}
