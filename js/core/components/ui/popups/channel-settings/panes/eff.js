// channel settings pane EFF
class ChannelSettingsPaneEff {

    channelSettings = null

    init(channelSettings) {
        this.channelSettings = channelSettings

        ui.toggles.initToggle('btn_ch_eff_onoff',
            () => { }
        )
        return this
    }
}
