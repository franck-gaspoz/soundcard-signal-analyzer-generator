// signal view

class SignalView {

    canvas = null;           // canvas for visualization
    pause = false;           // pause flag for visualization
    channel = null;          // channel

    init(canvas, channel) {
        this.canvas = canvas;
        this.channel = channel;
    }

    run() {

        ui.setupCanvasSize(this.canvas);
        const canvasHeight = this.canvas.height;
        const canvasWidth = this.canvas.width;
        const drawContext = this.canvas.getContext('2d');

        var x = -1;
        var y = -1;

        const dataArray = this.channel.measures.dataArray;

        if (dataArray != null)
            for (var i = 0; i < dataArray.length; i += 1) {
                var value = dataArray[i];
                value = float32ToByteRange(value);

                // adjust y position (y multiplier, y position shift)
                var relval = (value - 128) * this.channel.yScale;

                var percent = relval / 128;
                var height = canvasHeight * percent / 2.0;
                var offset = canvasHeight / 2 + height;
                offset += this.channel.yOffset;
                var barWidth = canvasWidth / dataArray.length;

                var nx = i * barWidth;
                var ny = offset;
                if (x == -1 && y == -1) {
                    x = nx;
                    y = ny;
                }
                drawContext.beginPath();
                drawContext.moveTo(x, y);
                drawContext.lineTo(nx, ny);
                drawContext.strokeStyle = this.channel.color;
                drawContext.lineWidth = this.channel.lineWidth;
                drawContext.stroke();

                x = nx;
                y = ny;
            }
    }

}
