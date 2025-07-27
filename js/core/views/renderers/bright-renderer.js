// renderer for bright renderer
class BrightRenderer {

    render(channel, drawContext, props) {
        if (channel.bright) {
            const t = parseRgba(props.col)
            var r = t.r
            var g = t.g
            var b = t.b
            if (props.op !== undefined) {
                const pop = props.op
                r *= pop
                g *= pop
                b *= pop
            }

            const fop = props.op * settings.renderers.bright.ampFactor * 255
                + settings.renderers.bright.baseLum
            r = addLight(r, fop)
            g = addLight(g, fop)
            b = addLight(b, fop)

            const col = toRgba(r, g, b, 1)
            drawContext.strokeStyle = col
            props.col = col

            return props
        }
        return props
    }
}
