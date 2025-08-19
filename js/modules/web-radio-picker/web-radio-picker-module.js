/*
    Sound card Oscilloscope | Spectrum Analyzer | Signal Generator
    Copyright(C) 2025  Franck Gaspoz
    find license and copyright informations in files /COPYRIGHT and /LICENCE
*/

const WebRadioPickerDataId = 'all_stations.m3u'

// module: web radio picker

class WebRadioPickerModule extends ModuleBase {

    // ----- module spec ----->

    id = 'web_radio_picker'         // unique id
    author = 'franck gaspoz'        // author
    cert = null                     // certification if any

    views = [                       // module views & styles
        [
            'view.html',
            'styles.css'
        ]
    ]
    settings = ['settings.json']    // module settings
    datas = [WebRadioPickerDataId]  // module data files

    title = 'Web Radio Picker'
    icon = '☄'

    // <----- end module spec -----

    items = []              // all items by group name
    itemsByArtists = []     // item with artist by artist name
    itemsByName = []        // all items by name
    listCount = 0
    grpLisdtIndex = 0
    tabs = ['btn_wrp_tag_list',
        'btn_wrp_art_list',
        'btn_wrp_logo']
    ignoreNextShowImage = false

    init() {
        const mset = settings.modules.web_radio_picker
        const dataUrl = mset.dataUrl
    }

    initTabs() {
        ui.tabs.initTabs(this.tabs)
    }

    initView(viewId) {

        this.initTabs()
        this.buildTagItems()
            .buildArtItems()
            .buildRadItems()

        const readOnly = { readOnly: true, attr: 'text' };

        $('#wrp_img').on('error', () => {
            this.noImage()
        })
        $('#wrp_img').on('load', () => {
            this.showImage()
        })

        ui
            .bindings.bind(ui.bindings.binding(
                'wrp_list_count',
                'app.moduleLoader.getModuleById("' + this.id + '").listCount',
                readOnly))

            // modules are late binded. have the responsability to init bindings
            .bindings.updateBindingTarget('wrp_list_count')
    }

    buildTagItems() {
        const $tag = $('#opts_wrp_tag_list')
        const keys = Object.keys(this.items)
        var i = 0
        keys.forEach(k => {
            const { item, $item } = this.buildListItem(unquote(k), i)
            i++
            $tag[0].appendChild(item)
            this.initTagBtn($item, k)
            //const t = this.items[k]
        })
        return this
    }

    buildArtItems() {
        const $art = $('#opts_wrp_art_list')
        const keys = Object.keys(this.items)
        var i = 0
        keys.forEach(k => {
            i++
            const t = this.items[k]
            var j = 0
            t.forEach(n => {
                const { item, $item } = this.buildListItem(n.name, j)
                j++
                $art[0].appendChild(item)
                //this.initTagBtn($item, k)
            })
        })
        return this
    }

    buildRadItems() {
        const $rad = $('#wrp_radio_list')
        const keys = Object.keys(this.items)
        var i = 0
        keys.forEach(k => {
            i++
            const t = this.items[k]
            var j = 0
            t.forEach(n => {
                const { item, $item } = this.buildListItem(n.name, j)
                j++
                $rad[0].appendChild(item)
                this.initTagRad($rad, $item, n)
            })
        })
        return this
    }

    buildListItem(text, j) {
        var item = document.createElement('div')
        var $item = $(item)
        $item.addClass('wrp-list-item')
        $item.text(text)
        if (j & 1)
            $item.addClass('wrp-list-item-a')
        else
            $item.addClass('wrp-list-item-b')
        return { item: item, $item: $item }
    }

    noImage() {
        const $i = $('#wrp_img')
        $i[0].src = './img/icon.ico'
        $i.addClass('wrp-img-half')
        this.ignoreNextShowImage = true
    }

    showImage() {
        const $i = $('#wrp_img')
        if (!this.ignoreNextShowImage)
            $i.removeClass('wrp-img-half')
        this.ignoreNextShowImage = false
        ui.tabs.selectTab('btn_wrp_logo', this.tabs)
    }

    initTagBtn($item, text) {
        $item.on('click', () => {

        })
    }

    initTagRad($rad, $item, o) {
        $item.on('click', () => {
            $rad.find('.item-selected')
                .removeClass('item-selected')
            $item.addClass('item-selected')
            $('#wrp_radio_url').text(o.url)
            if (o.logo != null && o.logo !== undefined && o.logo != '') {
                $('#wrp_img').attr('src', o.logo)
                const channel = ui.getCurrentChannel()
                if (channel != null && channel !== undefined) {
                    this.loading = o
                    app.updateChannelMedia(
                        ui.getCurrentChannel(),
                        o.url
                    )
                }
            } else {
                this.noImage()
            }
        })
    }

    setData(dataId, text) {
        if (dataId != WebRadioPickerDataId) return
        var t = text.split('\n')
        var j = 1
        var n = t.length
        while (j < n) {
            /*
            #EXTINF:-1 tvg-logo="https://kuasark.com/files/stations-logos/aordreamer.png" group-title="(.*),(.*),",AORDreamer
            http://178.33.33.176:8060/stream1
            #EXTINF:-1 tvg-logo="http://hdmais.com.br/universitariafm/wp-content/themes/theme48301/favicon.ico" group-title="Educacao,Universidade",UFC Rádio Universitária 107.9
            http://200.129.35.230:8081/;?type=http&nocache=2705
            */
            var extinf = t[j]
            var i = extinf.lastIndexOf(',')
            const name = extinf.substr(i + 1)

            extinf = extinf.substr(0, i - 1)
            i = extinf.indexOf('group-title="')
            var groupTitle = extinf.substr(i + 13)

            extinf = extinf.substr(0, i - 1)
            i = extinf.indexOf('tvg-logo="')
            const logo = extinf.substr(i + 10).slice(0, -1)

            const url = t[j + 1]
            if (groupTitle.endsWith(','))
                groupTitle = groupTitle.slice(0, -1)

            if (groupTitle.startsWith('(.*)')
                || groupTitle == ''
                || groupTitle == '"'
                || groupTitle == ',')
                groupTitle = "*"

            const item = {
                name: name,
                groupTitle: groupTitle,
                url: url,
                logo: logo,
                artist: null
            }

            this.itemsByName['"' + name + '"'] = item

            var grps = groupTitle.split(',')
            grps.forEach(grp => {
                var g = grp
                if (g == '"')
                    g = '*'
                g = '"' + g + '"'
                if (g != null && g != '') {
                    if (this.items[g] === undefined)
                        this.items[g] = []
                    try {
                        this.items[g].push(item)
                    } catch (err) {
                        console.log(err)
                    }
                }
                else {
                    console.log(g)
                }
            });

            this.listCount++

            j += 2
        }
    }
}