// channel settings pane FFT
class ChannelSettingsPaneFFT {

    channelSettings = null

    init(channelSettings) {
        this.channelSettings = channelSettings

        ui.initToggle('btn_ch_fft_onoff',
            () => { }
        )
    }
}
