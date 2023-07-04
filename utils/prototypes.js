export default (function typedArrClearPrototype() {
	;[
		Uint8Array,
		Uint8ClampedArray,
		Uint16Array,
		Uint32Array,
		Int8Array,
		Int16Array,
		Int32Array,
		Float32Array,
		Float64Array,
	].forEach(type => {
		type.prototype.clear = function () {
			// Float64Array is faster but since the array may not be a multiple of 8 bytes, we use Int8Array to set the remaining bytes
			const fastView = new Float64Array(
				this.buffer,
				0,
				(this.buffer.byteLength / Float64Array.BYTES_PER_ELEMENT) | 0
			)
			const byteView = new Int8Array(
				this.buffer,
				fastView.byteLength,
				this.buffer.byteLength % Float64Array.BYTES_PER_ELEMENT
			)

			const length1 = fastView.length
			const length2 = byteView.length

			for (let i = 0; i < length1; i++) {
				fastView[i] = 0
			}

			for (let i = 0; i < length2; i++) {
				byteView[i] = 0
			}

			return this
		}
	})
})()
