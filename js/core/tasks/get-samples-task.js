// get samples task

getSamplesTask = {

    analyzer: null,  // analyzer for getting samples

    bufferLength: 0, // length of the buffer
    dataArray: null, // array for storing samples

    init(analyzer) {
        this.analyzer = analyzer;
        this.bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Float32Array(this.bufferLength);
    },

    run() {
        if (this.analyzer != null) {
            this.analyzer.getFloatTimeDomainData(this.dataArray);
        } else {
            console.error("Analyzer not initialized");
            return;
        }
    }
}