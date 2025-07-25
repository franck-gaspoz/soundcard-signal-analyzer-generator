// channels ui
class Channels {

    popupSettings = new PopupChannelSettings()

    setPauseButton(id, pause) {
        const $e = $('#btn_pause_' + id);
        this.setPauseButtonLabel($e, pause)
    }

    setPauseButtonLabel($e, pause) {
        if (!pause) {
            $e.text('⏸');
        } else {
            $e.text('▶');
        }
    }

    init_channel_btns(channel, sigView) {
        // Initialize buttons and other UI elements for a channel

        const id = channel.channelId

        // id pause buttons
        const $e = $('#btn_pause_' + id);
        const fn = () => {
            this.setPauseButton(id, channel.pause)
        }
        fn(); // Set initial button text
        $e.on('click', () => {
            channel.setPause(!channel.pause)
            this.updatePause(channel)
            fn();
        });

        // close
        $('#btn_closech_' + id).on('click', () => {
            app.deleteChannel(id);
        });

        // settings
        $('#btn_chsett_' + id).on('click', () => {
            this.popupSettings.toggleChannelSettings(channel);
        });

        // visible
        const $vb = $('#btn_viewch_' + id);
        $vb.on('click', () => {
            $vb.toggleClass('line-through');
            sigView.visible = !sigView.visible;
            this.popupSettings.paneDisp.updateVisible()
            app.requestAnimationFrame();
        });

        // out
        $('#btn_chout_' + id).on('click', () => {
            this.toggleOut(channel)
        })
    }

    toggleOut(channel) {
        if (channel.pause || oscilloscope.pause) return
        channel.out = !channel.out
        oscilloscope.setOut(channel, channel.out)
        oscilloscope.refreshView()
    }

    pauseAllOuts(pause) {
        // pause all channels output (oscilloscope pause)
        oscilloscope.channels.forEach(channel => {
            if (channel.out || channel.outMute) {
                channel.setPauseOut(pause)
                this.updatePause(channel)
            }
        });
    }

    updatePause(channel) {
        channel.setPause(channel.pause)// apply after binding the proprer method call
        this.setPauseButton(channel.channelId, channel.pause)
        this.popupSettings.updatePause(channel)
    }

    updateVisible(channel) {
        const $vb = $('#btn_viewch_' + channel.channelId);
        if (channel.view.visible)
            $vb.removeClass('line-through');
        else
            $vb.addClass('line-through');
        app.requestAnimationFrame();
    }

    toggleVisible(channel) {
        const $vb = $('#btn_viewch_' + channel.channelId)
        $vb.click()
    }

    setupChannelLabel($channelLabel, id, channel) {
        $channelLabel.text('CH' + id);
        $channelLabel.css('background-color', channel.color);
    }

    addControls(channel) {
        const $model = $('#channel_pane_').clone();
        $model.removeClass('hidden');
        const id = channel.channelId;
        $model.attr('id', $model.attr('id') + id);

        const colors = settings.oscilloscope.channels.colors;
        const colLength = colors.length;
        const colIndex = (id - 1) % colLength;
        const col = colors[colIndex];
        $model.css('color', col);
        channel.color = col;

        const $channelLabel = $model.find('#channel_label_');
        $channelLabel.attr('id', $channelLabel.attr('id') + id);
        this.setupChannelLabel($channelLabel, id, channel);

        const $elems = $model.find('*');
        const $unit = $model.find('.unit');
        $unit.css('color', col);

        $.each($elems, (i, e) => {
            var $e = $(e);
            var eid = $e.attr('id');
            if (eid !== undefined && eid.endsWith('_')) {
                $e.attr('id', eid + id);
            }
            if ($e.hasClass('channel-label')) {
                $e.css('background-color', col);
            }
        });

        $('#channels_infos_deck').append($model);
        const $channelShortcut = $channelLabel.clone();
        $channelShortcut.attr('id', 's_' + $channelLabel.attr('id'));
        $channelShortcut.css('grid-column', id);
        const toggleControls = () => {
            $('#channel_pane_' + id).toggleClass('hidden');
        }
        $channelShortcut.on('click', () => {
            toggleControls();
        });
        $channelLabel.on('click', () => {
            this.popupSettings.toggleChannelSettings(channel)
        });

        $('#channels_shortcuts_deck').append($channelShortcut);
    }

    removeControls(channel) {
        // remove the controls for a channel
        const id = channel.channelId;
        $('#channel_pane_' + id).remove();
        $('#s_channel_label_' + id).remove();
    }
}