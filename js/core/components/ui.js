// ui

ui = {

    oscilloscope: null,     // reference to the oscilloscope manager
    uiInitialized: false,   // indicates if ui is already globally initialized
    popupId: null,          // any id of an html popupId currently opened/showed

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
            this.togglePopup('#btn_oset', 'pop_settings');
        });
    },

    toggleMenu() {
        $('#top-right-menu-body').toggleClass('hidden');
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
            this.togglePopup(control, p, false);
        }
        const $popup = $('#' + popupId);
        const visible = !$popup.hasClass('hidden');
        this.popupId = null;
        if (showState === undefined) {
            $popup.toggleClass('hidden');
            if (!visible)
                this.popupId = popupId;
        } else {
            if (!showState)
                $popup.addClass('hidden');
            else {
                $popup.removeClass('hidden');
                this.popupId = popupId;
            }
        }
        if (this.popupId != null && control != null) {
            const $ctrl = $(control);
            var pos = $ctrl.offset();
            const w = $popup.width();
            const h = $popup.height();
            pos.left -= w;
            pos.left -= settings.ui.menuContainerWidth; // 3*1em
            $popup.css('left', pos.left + 'px');
            $popup.css('top', pos.top + 'px');
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
        var $model = $('#channel-pane').clone();
        $model.removeClass('hidden');
        const id = channel.channelId;
        $model.attr('id', 'channel-pane_' + id);
        const colors = settings.oscilloscope.channels.colors;
        const colLength = colors.length;
        const colIndex = (id - 1) % colLength;
        const col = colors[colIndex];
        $model.css('color', col);
        channel.color = col;
        $model.find('#channel-label').text('CH' + channel.channelId);
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
        $('#top-panes').append($model);
    },

    removeControls(channel) {
        // remove the controls of a channel
        var $ctlr = $('#channel-pane_' + channel.channelId);
        $ctlr.remove();
    },

    editChannelSettings(channel) {

    },

    setupCanvasSize(canvas) {
        const html = document.querySelector('html');
        const htmlWidth = html.clientWidth;
        const htmlHeight = html.clientHeight;
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
