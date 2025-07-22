// signal view

class SignalView {

    canvas = null;           // canvas for visualization
    pause = false;           // pause flag for visualization
    visible = true;          // visible flag for visualization
    hidden = false;          // hidden for vizualisation
    channel = null;          // channel

    init(canvas, channel) {
        this.canvas = canvas;
        this.channel = channel;
    }

    offsetToVolt(offset) {
        /*var percent = -value / signalRange;
        percent *= signalRange / displayRange; // adjust to display range
        var height = canvasHeight * percent / 2.0;
        height *= this.channel.yScale;
        var offset = canvasHeight / 2 + height;
        offset += this.channel.yOffset;*/

        const canvasHeight = this.canvas.height;
        const signalRange = settings.audioInput.vScale;
        const displayRange = this.getDisplayRange()

        offset -= this.channel.yOffset
        var height = offset - canvasHeight / 2.0
        height /= this.channel.yScale
        var percent = height * 2.0 / canvasHeight
        percent /= signalRange / displayRange
        const value = -percent * signalRange
        return value
    }

    getVoltOffset(value) {
        const canvasHeight = this.canvas.height;
        const signalRange = settings.audioInput.vScale;
        const displayRange = this.getDisplayRange()

        // adjust y position (y multiplier, y position shift, v scale)
        var percent = -value / signalRange;
        percent *= signalRange / displayRange; // adjust to display range
        var height = canvasHeight * percent / 2.0;
        height *= this.channel.yScale;
        var offset = canvasHeight / 2 + height;
        offset += this.channel.yOffset;
        return offset
    }

    getDisplayRange() {
        return settings.oscilloscope.vPerDiv * 5.0
    }

    run() {
        this.channel.markers.setTriggerControlVisibility(this.visible)
        if (!this.visible) return;

        ui.setupCanvasSize(this.canvas);
        const canvasHeight = this.canvas.height;
        const canvasWidth = this.canvas.width;
        const dataArray = this.channel.measures.dataArray;

        if (dataArray != null) {

            var x = -1;
            var y = -1;
            const drawContext = this.canvas.getContext('2d');

            const signalRange = settings.audioInput.vScale
            const displayRange = this.getDisplayRange()        // base

            const timePerDiv = settings.oscilloscope.tPerDiv;
            // full buffer view : scale 1ms/div
            const barWidth = canvasWidth / dataArray.length / timePerDiv;

            const baseI = this.channel.trigger.isOn ?
                this.channel.trigger.checkTrigger(this.channel, dataArray) : 0

            if (this.channel.trigger.isOn
                && !this.channel.markers.isDraggingTrigger()
            ) {
                // setup the trigger marker
                const triggerY = this.getVoltOffset(
                    this.channel.trigger.threshold)
                    + settings.markers.trigger.yRel
                this.channel.markers.setTriggerControlPos(triggerY)
            }

            for (var i = baseI; i < dataArray.length; i += 1) {
                var value = dataArray[i];

                value = valueToVolt(this.channel, value);
                const offset = this.getVoltOffset(value)

                var nx = (i - baseI) * barWidth
                var ny = offset;
                if (x == -1 && y == -1) {
                    x = nx;
                    y = ny;
                }
                drawContext.beginPath();
                drawContext.moveTo(x, y);
                drawContext.lineTo(nx, ny);
                drawContext.strokeStyle = this.channel.color;

                if (this.channel.tempColor) {
                    var col = this.channel.color
                        .replace('rgba(', '')
                        .replace(')', '')
                        .replace(' ', '')
                        .split(',')
                    var r = Number(col[0])
                    var g = Number(col[1])
                    var b = Number(col[2])
                    //var op = Number(col[3])
                    const m = this.channel.measures
                    const absMax = Math.max(Math.abs(m.vMax), Math.abs(m.vMin))
                    const absVal = Math.abs(value)
                    const op = 1.0 - ((absMax - absVal) / absMax)
                    drawContext.strokeStyle =
                        'rgba(' + r + ',' + g + ',' + b + ',' + op + ')'
                }

                drawContext.lineWidth = this.channel.lineWidth;
                drawContext.stroke();

                x = nx;
                y = ny;
            }
            this.channel.isDisplayed = true;
        }
    }


}
