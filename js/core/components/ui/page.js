/*
    Sound card Oscilloscope | Signal Analyser Generator
    Copyright(C) 2025  Franck Gaspoz
    find licence and copyright informations in files /COPYRIGHT and /LICENCE
*/

// page ui

page = {

    init() {
        $('#app_ver').text(settings.app.version)
        $('#app_ver_date').text(settings.app.verDate)
        this.initButtons()
    },

    initButtons() {
        $('#bt_home').on('click', () => this.loadPage('pages/home.html'))
        $('#bt_lic').on('click', () => this.loadPage('doc/licence.html'))
        $('#bt_man').on('click', () => this.loadPage('pages/manual.html'))

        $('#lnk_intro').on('click', () => this.loadPage('pages/intro.html'))
        $('#lnk_funcs').on('click', () => this.loadPage('pages/functions.html'))
        $('#lnk_calibr').on('click', () => this.loadPage('pages/calibration.html'))

        $('#bt_fs').on('click', () => {
            settings.ui.fullscreen = !settings.ui.fullscreen
            cui.setFullscreen(
                settings.ui.fullscreen,
                '☐',
                '⛶',
                'bt_fs')
        })
    },

    loadPage(url) {
        var p = $('#page')[0]
        var s = null
        if (p === undefined)
            s = window.location.href
        else
            s = p.src
        var t = s.split('/')
        t[t.length - 2] = url
        t[t.length - 1] = ''
        t = t.slice(0, t.length - 1)
        const u = t.join('/')
        if (p != null)
            p.src = u
        else
            window.location = u
    }
}

document.addEventListener('DOMContentLoaded', function () {
    page.init()
}, false)
