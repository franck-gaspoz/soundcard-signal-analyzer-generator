// ui

ui = {

    oscilloscope: null,     // reference to the oscilloscope manager
    uiInitialized: false,   // indicates if ui is already globally initialized
    popupId: null,          // any id of an html popupId currently opened/showed
    popupCtrlId: null,      // popup control placement if any else null
    bindings: [], // array of bindings for controls

    init(oscilloscope) {
        this.oscilloscope = oscilloscope;
        this.oscilloscope.channels.forEach(channel => {
            if (!channel.ui) {
                this.init_btns(channel.channelId, channel.view);
                channel.ui = true;
            }
        });
        if (!this.uiInitialized) {
            this.init_ui();
            this.uiInitialized = true;
        }
        console.log("UI initialized");
    },

    init_btns(channel, sigView) {
        // Initialize buttons and other UI elements for a channel

        // channel pause buttons
        const $e = $('#btn_pause_' + channel);
        const fn = () => {
            if (!sigView.pause) {
                $e.text('⏸');
            } else {
                $e.text('▶');
            }
        }
        fn(); // Set initial button text
        $e.on('click', () => {
            sigView.pause = !sigView.pause;
            fn();
        });

        // close
        $('#btn_closech_' + channel).on('click', () => {
            app.deleteChannel(channel);
        });

        // settings
        $('#btn_chsett_' + channel).on('click', () => {
            this.editChannelSettings(channel);
        });
    },

    init_ui() {
        // events
        $(window).resize(() => {
            if (oscilloscope.pause)
                app.requestAnimationFrame();
        });
        // properties
        $('input').attr('autocomplete', 'off');
        // menus & popups
        this.init_right_menu();
        this.init_popups();
    },

    init_popups() {
        $('.popup-close').on('click', () => {
            const p = this.popupId;
            this.popupId = null;
            this.control = null;
            this.togglePopup(null, p, false);
        });
        this.init_popup_settings();
    },

    init_popup_settings() {

        const refresh = () => app.requestAnimationFrame();

        // groups
        this.initTabs(
            'btn_os_grid',
            'btn_os_disp',
            'btn_os_in',
            'btn_os_out');

        // display
        this.bind(
            'opt_os_clientWidthBorder',
            'settings.ui.clientWidthBorder',
            null, refresh);
        this.bind(
            'opt_os_clientHeightBorder',
            'settings.ui.clientHeightBorder',
            null, refresh);
        this.bind(
            'opt_os_menuContainerWidth',
            'settings.ui.menuContainerWidth',
            null, refresh);

        // input
        this.bind(
            'opt_os_smpfrqcy',
            'app.audioInputChannel.streamSource.context.sampleRate',
            null, null, true);
        this.bind(
            'opt_os_inputChannelsCount',
            'settings.audioInput.channelsCount',
            null, null, true);
        this.bind(
            'opt_os_frequencyBinCount',
            'app.audioInputChannel.analyzer.frequencyBinCount',
            null, null, true);
        this.bind(
            'opt_os_inputVscale',
            'settings.audioInput.vScale',
            null, null);

        // output
        this.bind(
            'opt_os_outputChannelsCount',
            'oscilloscope.audioContext.destination.maxChannelCount',
            null, null, true);
        this.bind(
            'opt_os_channelInterpretation',
            'oscilloscope.audioContext.destination.channelInterpretation',
            null, null, true);

        // grid
        this.bind(
            'opt_os_dv',
            'settings.oscilloscope.vPerDiv',
            null, null);
        this.bind(
            'opt_os_dt',
            'settings.oscilloscope.tPerDiv',
            null, null);
        this.bind(
            'opt_os_hdiv',
            'settings.oscilloscope.grid.hDivCount',
            null, null);
        this.bind(
            'opt_os_vdiv',
            'settings.oscilloscope.grid.vDivCount',
            null, null);
    },

    initBindedControls() {
        // Initialize bindings for UI controls
        this.bindings.forEach(b => {
            if (b.init != null) {
                b.init();
            }
        });
        app.updateDisplay();
    },

    bind(controlId, valuePath, sym, onChanged, readOnly) {
        if (readOnly == null)
            readOnly = false;
        const $c = $('#' + controlId);

        if (readOnly) {
            $c.addClass('read-only');
            $c.attr('readonly', '');
        }

        const fn = () => {
            $c.attr('value', eval(valuePath));
        };
        app.addOnStartUI(() => {
            fn();
        });
        this.bindings.push({ init: fn });

        if (!readOnly) {
            const t = this;
            $c.on('change', () => {
                if (settings.debug.trace)
                    console.trace('value changed: ' + controlId);
                const $v = $c[0].value;
                if (sym == null)
                    sym = '';
                if (onChanged != null)
                    onChanged();
                else
                    eval(valuePath + '=' + sym + $v + sym);
                this.initBindedControls();
            });
        }
    },

    initTabs(...tabs) {
        const t = this;
        tabs.forEach(e => {
            const $c = $('#' + e);
            $c.on('click', () => {
                if (!$c.hasClass('selected'))
                    t.selectTab($c.attr('id'), tabs);
            });
        });
    },

    selectTab(selectedTabId, tabs) {
        const panes = [...tabs];
        const btIdToPaneId = t => t.replace('btn_', 'opts_');
        panes.forEach((v, i) => {
            panes[i] = btIdToPaneId(panes[i]);
        });
        const selectedPane = btIdToPaneId(selectedTabId);
        tabs.forEach(e => {
            const $t = $('#' + e);
            const pId = btIdToPaneId(e);
            const $p = $('#' + pId);
            if ($t.hasClass('selected')) {
                $t.removeClass('selected');
                $p.addClass('hidden');
            }
            if ($t.attr('id') == selectedTabId) {
                $t.addClass('selected');
                $p.removeClass('hidden');
            }
        });
    },

    init_right_menu() {
        // menu buttons
        $('#btn_menu').on('click', () => {
            this.toggleMenu();
        });
        $('#btn_add_ch').on('click', async () => {
            if (app.powerOn)
                await app.addChannel();
        });
        $('#btn_restart').on('click', () => {
            if (app.powerOn)
                window.location.reload(false);
        });
        $('#btn_power').on('click', () => {
            app.togglePower();
        });
        $('#btn_opause').on('click', () => {
            app.toggleOPause();
        });
        $('#btn_oset').on('click', () => {
            this.togglePopup(/*'#btn_oset'*/null, 'pop_settings');
        });
    },

    toggleMenu() {
        const $mb = $('#top-right-menu-body');
        $mb.toggleClass('hidden');
        const visible = !$mb.hasClass('hidden');
        $('#btn_menu').text(visible ? '▼' : '▲');
        if (visible)
            this.initBindedControls();

        if (this.popupId != null) {
            const p = this.popupId;
            this.popupId = null;
            this.togglePopup(null, p, false);
        }
    },

    togglePopup(control, popupId, showState) {
        if (this.popupId != null && this.popupId != popupId) {
            // change popup
            const p = this.popupId;
            this.popupId = null;
            this.control = null;
            this.togglePopup(control, p, false);
        }
        const $popup = $('#' + popupId);
        const visible = !$popup.hasClass('hidden');
        this.popupId = null;
        this.popupCtrlId = null;
        if (showState === undefined) {
            $popup.toggleClass('hidden');
            if (!visible) {
                this.popupId = popupId;
                this.popupCtrlId = control;
                this.initBindedControls();
            }
        } else {
            if (!showState)
                $popup.addClass('hidden');
            else {
                $popup.removeClass('hidden');
                this.popupId = popupId;
                this.popupCtrlId = control;
                this.initBindedControls();
            }
        }
        if (this.popupId != null) {
            const w = $popup.width();
            const h = $popup.height();
            var left = 0;
            var top = 0;
            if (control != null) {
                // left align
                const $ctrl = $(control);
                var pos = $ctrl.offset();
                pos.left -= w;
                pos.left -= settings.ui.menuContainerWidth; // 3*1em
                left = pos.left;
                top = pos.top;
            } else {
                // center
                const vs = this.viewSize();
                left = (vs.width - w) / 2.0;
                top = (vs.height - h) / 2.0;
            }
            this.popupCtrlId = control;
            $popup.css('left', left);
            $popup.css('top', top);
        }
    },

    turnOffMenu() {
        const t = ['#btn_add_ch', '#btn_restart', '#btn_opause'];
        t.forEach(b => {
            $(b)
                .toggleClass('menu-item-disabled');
        });
    },

    reflectOscilloPauseState() {
        $('#btn_opause').text(oscilloscope.pause ? '▶' : '⏸');
    },

    addControls(channel) {
        var $model = $('#channel_pane').clone();
        $model.removeClass('hidden');
        const id = channel.channelId;
        $model.attr('id', 'channel_pane_' + id);
        const colors = settings.oscilloscope.channels.colors;
        const colLength = colors.length;
        const colIndex = (id - 1) % colLength;
        const col = colors[colIndex];
        $model.css('color', col);
        channel.color = col;
        $channelLabel = $model.find('#channel_label');
        $channelLabel.text('CH' + id);
        var $elems = $model.find('*');
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
        $channelShortcut = $channelLabel.clone();
        $channelShortcut.attr('id', 's_' + $channelLabel.attr('id') + '_' + id);
        $channelShortcut.css('grid-column', id);
        const toggleControls = () => {
            $('#channel_pane_' + id).toggleClass('hidden');
        }
        $channelShortcut.on('click', () => {
            toggleControls();
        });
        $channelLabel.on('click', () => {
            toggleControls();
        });

        $('#channels_shortcuts_deck').append($channelShortcut);
    },

    removeControls(channel) {
        // remove the controls of a channel
        const id = channel.channelId;
        $('#channel_pane_' + id).remove();
        $('#s_channel_label_' + id).remove();
    },

    editChannelSettings(channel) {

    },

    viewSize() {
        const html = document.querySelector('html');
        return { width: html.clientWidth, height: html.clientHeight };
    },

    setupCanvasSize(canvas) {
        const vs = this.viewSize();
        const htmlWidth = vs.width;
        const htmlHeight = vs.height;
        var updated = false;
        // auto size canvas (maximize)
        if (canvas.width !== htmlWidth - settings.ui.clientWidthBorder) {
            canvas.width = htmlWidth - settings.ui.clientWidthBorder;
            updated = true;
        }
        if (canvas.height !== htmlHeight - settings.ui.clientHeightBorder) {
            canvas.height = htmlHeight - settings.ui.clientHeightBorder;
            updated = true;
        }
        return updated;
    },

    checkSizeChanged() {
        const html = document.querySelector('html');
        const htmlWidth = html.clientWidth;
        const htmlHeight = html.clientHeight;
        var updated =
            canvas.width !== htmlWidth - settings.ui.clientWidthBorder
            || canvas.height !== htmlHeight - settings.ui.clientHeightBorder;
        return updated;
    }
}
