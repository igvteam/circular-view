import Picker from '../node_modules/vanilla-picker/dist/vanilla-picker.mjs'
import {getChrColor} from "./chrColor.js"
import ChordSetManager from "./chordSetManager.js"

const EXP5 = Math.exp(5)

class CircularView {

    static isInstalled() {
        return window["JBrowseReactCircularGenomeView"] !== undefined && window["React"] !== undefined && window["ReactDOM"] !== undefined
    }

    /**
     * Create a new CircularView
     *
     * @param parent
     * @param config - configuration options
     *   {
     *       assembly: {name: string, id: string, chromosomes: [{name: string, bpLength: integer, color: string}]
     *       onChordClick: function called upon chord click with chord feature as argument
     *   }
     */
    constructor(parent, config) {

        config = config || {}
        this.config = config

        if (CircularView.isInstalled()) {

            this.parent = parent
            this.groupByTrack = config.groupByTrack === true
            this.chordManager = new ChordSetManager(config)

            // wrapper for toolbar and circular-view container
            const wrapper = document.createElement('div')
            wrapper.className = 'igv-circview-container'
            parent.appendChild(wrapper)

            // toolbar
            this.createControls(wrapper)
            this.resetControlPanel()

            // circular view container
            const element = document.createElement('div')
            element.className = 'igv-circview-circular-genome-view'
            wrapper.appendChild(element)
            this.container = element

            if (config.assembly) {
                this.setAssembly(config.assembly)
            }

            this.width = config.width || 500
            this.height = config.height || 500
            this.setSize(this.width, this.height)

        } else {
            console.error("JBrowse circular view is not installed")
        }
    }

    createControls(parent) {

        // toolbar
        const toolbarDiv = document.createElement('div')
        toolbarDiv.className = 'igv-circview-toolbar'
        parent.appendChild(toolbarDiv)
        this.toolbar = toolbarDiv

        // control panel
        const controlPanelDiv = document.createElement('div')
        controlPanelDiv.className = 'igv-circview-track-panel'
        parent.appendChild(controlPanelDiv)
        this.controlPanel = controlPanelDiv
        this.controlPanel.style.display = 'none'


        // toolbar button container - Track Options - Clear All
        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'igv-circview-toolbar-button-container'
        this.toolbar.appendChild(buttonContainer)

        // Show Controls
        this.showControlsButton = document.createElement('div')
        this.showControlsButton.className = 'igv-circview-button'
        buttonContainer.appendChild(this.showControlsButton)
        this.showControlsButton.innerText = 'none' === this.controlPanel.style.display ? 'Show Controls' : 'Hide Controls'
        this.showControlsButton.addEventListener('click', (event) => {
            const panelRows = this.controlPanel.querySelectorAll('div')
            if (panelRows.length > 0) {
                if ('none' === this.controlPanel.style.display) {
                    this.controlPanel.style.display = 'flex'
                    event.target.innerText = 'Hide Controls'
                } else {
                    this.controlPanel.style.display = 'none'
                    event.target.innerText = 'Show Controls'
                }
            }
        })

        // Clear All
        let button = document.createElement('div')
        button.className = 'igv-circview-button'
        buttonContainer.appendChild(button)
        button.innerText = 'Clear All'
        button.addEventListener('click', () => {
            this.clearChords()
        })

        // Close
        if (false !== this.config.showCloseButton) {
            button = document.createElement('div')
            button.className = 'igv-circview-button'
            buttonContainer.appendChild(button)
            button.innerText = 'Close'
            button.addEventListener('click', () => {
                this.visible = false
            })
        }
    }

    resetControlPanel() {
        this.controlPanel.innerHTML = ''
        this.controlPanel.appendChild(this.createGroupByCB())
        const chordSets = this.groupByTrack ? this.chordManager.tracks : this.chordManager.chordSets
        for(let cs of chordSets) {
            this.addToControlPanel(cs)
        }
    }

    createGroupByCB() {
        const groupByCB = document.createElement('input')
        groupByCB.type = 'checkbox'
        groupByCB.id = 'groupByCB'
        groupByCB.style.width = '1.4em'
        groupByCB.style.height = '1.4em'
        groupByCB.checked = this.groupByTrack

        groupByCB.onclick = (evt) => {
            this.groupByTrack = evt.target.checked
            this.resetControlPanel()
            this.render()
        }

        const groupByLabel = document.createElement('label')
        groupByLabel.for = 'groupByCB'
        groupByLabel.innerText = 'Group by track'
        groupByLabel.style.color = 'black'
        groupByLabel.style.paddingLeft = '10px'
        const trackPanelRow = document.createElement('div')
        trackPanelRow.style.width = '100%'
        trackPanelRow.style.paddingTop = '5px'
        trackPanelRow.style.paddingBottom = '5px'
        trackPanelRow.style.background = 'rgb(216, 230, 234)'
        trackPanelRow.appendChild(groupByCB)
        trackPanelRow.appendChild(groupByLabel)
        return trackPanelRow
    }

    addToControlPanel(chordSet) {

        // single track row - container for hide-button | color-picker-swatch | track-name
        const row = document.createElement('div')
        this.controlPanel.appendChild(row)


        // track hide|show
        const hideShowButton = document.createElement('div')
        hideShowButton.className = 'igv-circview-button'
        row.appendChild(hideShowButton)
        hideShowButton.innerText = true === chordSet.visible ? 'Hide' : 'Show'
        hideShowButton.addEventListener('click', event => {
            if (true === chordSet.visible) {
                this.hideChordSet(chordSet.name)
                event.target.innerText = "Show"
            } else {
                this.showChordSet(chordSet.name)
                event.target.innerText = "Hide"
            }
        })

        // The alpha range slider.  Create this here so we can reference it from the color picker
        const alphaSlider = document.createElement('input')
        const valueToAlpha = (value) => Math.exp(value / 200) / EXP5
        const alphaToValue = (alpha) => 200 * Math.log(alpha * EXP5)

        // color
        const colorPickerButton = document.createElement('div')
        colorPickerButton.className = 'igv-circview-button'
        colorPickerButton.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'   // <- important for button to size properly
        row.appendChild(colorPickerButton)
        colorPickerButton.style.backgroundColor = setAlpha(chordSet.color, 1)
        const pickerConfig =
            {
                parent: colorPickerButton,
                popup: 'right',
                editorFormat: 'rgb',
                color: chordSet.color,
                onChange: ({rgbaString}) => {
                    colorPickerButton.style.backgroundColor = setAlpha(rgbaString, 1)
                    this.setColor(chordSet.name, rgbaString)
                    alphaSlider.value = alphaToValue(getAlpha(chordSet.color))
                }
            }
        const picker = new Picker(pickerConfig)

        // alpha transparency
        alphaSlider.setAttribute('title', 'Adjust transparency of arcs')
        alphaSlider.type = 'range'
        //alphaSlider.className = 'igv-circview-alpha-slider'
        alphaSlider.style.width = '100px'
        alphaSlider.style.marginRight = '10px'
        alphaSlider.setAttribute('class', 'range')
        alphaSlider.setAttribute('min', '0')
        alphaSlider.setAttribute('max', '1000')
        alphaSlider.value = alphaToValue(getAlpha(chordSet.color))
        alphaSlider.oninput = () => {
            const v = valueToAlpha(alphaSlider.value)
            this.setColor(chordSet.name, setAlpha(chordSet.color, v))
            picker.setColor(chordSet.color)
        }
        row.appendChild(alphaSlider)

        // track name
        const trackNameDive = document.createElement('div')
        trackNameDive.style.color = 'black'
        row.appendChild(trackNameDive)
        trackNameDive.innerText = trackNameDive.title = chordSet.name

    }

    /**
     * Reset view with a new set of chromosomes.
     *
     * @param igvGenome {name: string, id: string, chromosomes: [{name: string, bpLength: integer, color: string}
     */
    setAssembly(igvGenome) {

        const id = this.genomeId || guid()

        if (this.genomeId === id) {
            return
        }
        this.chordManager.clearChords()
        this.genomeId = id
        this.chrNames = new Set(igvGenome.chromosomes.map(chr => shortChrName(chr.name)))

        const regions = []
        const colors = []
        for (let chr of igvGenome.chromosomes) {
            const shortName = shortChrName(chr.name)
            colors.push(chr.color || getChrColor(shortName))
            regions.push(
                {
                    refName: shortName,
                    uniqueId: shortName,
                    start: 0,
                    end: chr.bpLength
                }
            )
        }

        this.assembly = {
            name: igvGenome.name,
            sequence: {
                trackId: id,
                type: 'ReferenceSequenceTrack',
                adapter: {
                    type: 'FromConfigSequenceAdapter',
                    features: regions,
                },
            },
            refNameColors: colors
        }

        this.render()

    }

    /**
     * Append or replace current set of chords to the global set or a specific track.
     *
     * @param newChords array of chord feature objects.  Example:
     * [
     *   {
     *     "uniqueId": "chr1:129763372-129763376_chr1:129806775-129806790",
     *     "color": "rgba(0, 0, 255, 0.1)",
     *     "refName": "1",
     *     "start": 129763372,
     *     "end": 129763376,
     *     "mate": {
     *       "refName": "2",
     *       "start": 129806775,
     *       "end": 129806790
     *     }
     *   }
     * ]
     * @param options {
     *     name: string,    // Track name
     *     color: string,   // Track color
     *     append: boolean  // Replace or append chords to current set.  Default is append (true)
     * }
     */

    addChords(newChords, options = {}) {

        const tmp = options.name || options.track || "*"
        const trackName = tmp.split(' ')[0].replaceAll("%20", " ")
        const chordSetName = tmp.replaceAll("%20", " ")

        const chordSet =  {
            name: chordSetName,
            trackName: trackName,
            chords: newChords,
            color: options.color || "black",
            trackColor: options.trackColor || options.color || "black",
            visible: true,
            id: options.id || guid()
        }

        this.chordManager.addChordSet(chordSet)

        this.resetControlPanel();

        this.render()
    }

    /**
     * Set the nominal size of the view in pixels.  Size is reduced some aribtrary amount to account for borders and margins
     */
    setSize(width, height) {

        height = height || width

        this.width = width
        this.height = height
        if (this.viewState) {
            const view = this.viewState.session.view
            view.setWidth(width)
            view.setHeight(height /* this is the height of the area inside the border in pixels */)
            view.setBpPerPx(view.minBpPerPx)
        }
    }

    getSize() {
        return Math.min(this.width, this.height)
    }

    clearChords() {
        //this.tracks = []
        this.chordManager.clearChords()
        this.resetControlPanel()
        this.render()
    }

    clearSelection() {
        this.viewState.pluginManager.rootModel.session.clearSelection()
    }

    /**
     * Deprecated, use "visible" property
     */
    show() {
        this.parent.style.display = 'block'
    }

    /**
     * Deprecated, use "visible" property
     */
    hide() {
        this.parent.style.display = 'none'
    }

    get visible() {
        return this.parent.style.display !== 'none'
    }

    set visible(isVisible) {
        this.parent.style.display = isVisible ? 'block' : 'none'
    }

    hideChordSet(trackName) {
        let cs = this.getChordSet(trackName)
        if (cs) {
            cs.visible = false
            this.render()
        } else {
            console.warn(`No track with name: ${name}`)
        }
    }

    showChordSet(name) {
        let cs = this.getChordSet(name)
        if (cs) {
            cs.visible = true
            this.render()
        } else {
            console.warn(`No track with name: ${name}`)
        }
    }

    // showTrack(trackID) {
    //     let idx = this.tracks.findIndex(t => trackID === t.id)
    //     if (idx >= 0) {
    //         const track = this.tracks[idx]
    //         track.visible = true
    //         this.tracks.splice(idx, 1)   // Change z-order
    //         this.tracks.push(track)
    //         this.render()
    //     } else {
    //         console.warn(`No track with name: ${name}`)
    //     }
    // }

    // TODO -- remove corresponding row from track panel
    deleteTrack(trackID) {
        let idx = this.tracks.findIndex(t => trackID === t.name)
        if (idx >= 0) {
            this.tracks.splice(idx, 1)
        }
        this.render()
    }

    getChordSet(name) {
        return this.groupByTrack ? this.chordManager.getTrack(name) : this.chordManager.getChordSet(name)
    }

    setColor(name, color) {
        const t = this.getChordSet(name)
        if (t) {
            t.color = color
            const trackID = t.id
            for (let jbrowseTrack of this.viewState.config.tracks) {
                if (trackID === jbrowseTrack.trackId) {
                    jbrowseTrack.displays[0].renderer.strokeColor.set(color)
                    break
                }
            }
        }
    }

    /**
     * The main render function.  Render here means build the React DOM.  Trying to change react state dynamically
     * has been buggy, so we completely rebuild the DOM ("render") on any state change.
     */
    render() {

        const {
            createViewState,
            JBrowseCircularGenomeView,
        } = JBrowseReactCircularGenomeView

        // Remove all children from possible previous renders.  React might do this for us when we render, but just in case.
        ReactDOM.unmountComponentAtNode(this.container)

        const visibleChordSets =
            (this.groupByTrack ? this.chordManager.tracks : this.chordManager.chordSets).filter(t => t.visible)

        const jbrowseTracks = []
        const colors = []

        for (let chordSet of visibleChordSets) {

            jbrowseTracks.push({
                trackId: chordSet.id,
                name: chordSet.name,
                assemblyNames: ['forIGV'],
                type: 'VariantTrack',
                adapter: {
                    type: 'FromConfigAdapter',
                    features: chordSet.chords,
                }
            })
            colors.push(chordSet.color)
        }

        this.viewState = createViewState({
            assembly: this.assembly,
            tracks: jbrowseTracks,
        })

        // Set view colors
        for (let i = 0; i < visibleChordSets.length; i++) {
            this.viewState.config.tracks[i].displays[0].renderer.strokeColor.set(colors[i])
            //this.viewState.config.tracks[i].displays[0].renderer.strokeColor.set("jexl:get(feature, 'color') || 'black'");
            //this.viewState.config.tracks[i].displays[0].renderer.strokeColorSelected.set("jexl:get(feature, 'highlightColor') || 'red'");
        }

        this.element = React.createElement(JBrowseCircularGenomeView, {viewState: this.viewState})
        this.setSize(this.width, this.height)

        ReactDOM.render(this.element, this.container)

        const onChordClick = this.config.onChordClick || defaultOnChordClick
        for (let i = 0; i < visibleChordSets.length; i++) {
            this.viewState.session.view.showTrack(this.viewState.config.tracks[i].trackId)
            if (onChordClick) {
                this.viewState.pluginManager.jexl.addFunction('onChordClick', onChordClick)
                this.viewState.config.tracks[i].displays[0].onChordClick.set(
                    'jexl:onChordClick(feature, track, pluginManager)'
                )
            }
        }
    }
}

function setAlpha(rgba, alpha) {
    const [a, b, c, ignore] = rgba.split(',') // rgba(r g b alpha)
    return `${a},${b},${c},${alpha})`
}

function getAlpha(rgba) {
    if (rgba.startsWith("rgba(")) {
        return Number(rgba.split(',')[3].replace(')', ''))
    } else {
        return 1
    }
}

function shortChrName(chrName) {
    return chrName.startsWith("chr") ? chrName.substring(3) : chrName
}

function defaultOnChordClick(feature, chordTrack, pluginManager) {
    console.log(feature)
}

function guid() {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
}

export default CircularView
