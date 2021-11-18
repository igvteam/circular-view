import {getChrColor} from "./chrColor.js";
import IGVColor from "./igv-color.js";

class CircularView {

    static isInstalled() {
        return window["JBrowseReactCircularGenomeView"] !== undefined && window["React"] !== undefined && window["ReactDOM"] !== undefined;
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
        if (CircularView.isInstalled()) {

            this.parent = parent

            // toolbar
            this.createToolbarAndTrackPanel(parent)

            let element

            // circular view container
            element = document.createElement('div')
            element.className = 'jbrowse-circular-genome-view'
            parent.appendChild(element)
            this.container = element


            this.config = config;

            if (config.assembly) {
                this.setAssembly(config.assembly)
            }

            this.tracks = []

        } else {
            console.error("JBrowse circular view is not installed")
        }
    }

    createToolbarAndTrackPanel(parent) {

        let element

        // toolbar
        element = document.createElement('div')
        element.className = 'jbrowse-toolbar'
        parent.appendChild(element)
        this.toolbar = element


        // track panel
        element = document.createElement('div')
        element.className = 'jbrowse-track-panel'
        parent.appendChild(element)
        this.trackPanel = element

        this.trackPanel.style.display = 'none'


        let buttonContainer

        // toolbar button container - Track Options - Clear All
        buttonContainer = document.createElement('div')
        buttonContainer.className = 'jbrowse-toolbar-button-container'
        this.toolbar.appendChild(buttonContainer)

        let button

        // Track Options
        this.trackPanelPresentationButton = document.createElement('button')
        buttonContainer.appendChild(this.trackPanelPresentationButton)
        this.trackPanelPresentationButton.innerText = 'none' === this.trackPanel.style.display ? 'Show Track Options' : 'Hide Track Options'
        this.trackPanelPresentationButton.addEventListener('click', (event) => {

            const trackPanelRows = this.trackPanel.querySelectorAll('div')

            if (trackPanelRows.length > 0) {

                if ('none' === this.trackPanel.style.display) {
                    this.trackPanel.style.display = 'flex'
                    event.target.innerText = 'Hide Track Options'
                } else {
                    this.trackPanel.style.display = 'none'
                    event.target.innerText = 'Show Track Options'
                }

            }

        })

        // Clear All Chords
        button = document.createElement('button')
        buttonContainer.appendChild(button)
        button.innerText = 'Clear All'
        button.addEventListener('click', () => {
            this.clearChords()
        })


        // toolbar button container - Close Window
        buttonContainer = document.createElement('div')
        buttonContainer.className = 'jbrowse-toolbar-button-container'
        this.toolbar.appendChild(buttonContainer)

        // Close Window
        button = document.createElement('button')
        buttonContainer.appendChild(button)
        button.innerText = 'Close Window'
        button.addEventListener('click', () => {
            this.visible = false
        })

    }

    addToTrackPanel(track) {

        const trackPanelRow = document.createElement('div')
        this.trackPanel.appendChild(trackPanelRow)

        let element

        // track name
        element = document.createElement('div')
        trackPanelRow.appendChild(element)
        element.innerText = element.title = `${track.name}-${track.name}-${track.name}`

        // track hide|show
        element = document.createElement('button')
        trackPanelRow.appendChild(element)
        element.innerText = true === track.visible ? 'Hide' : 'Show'
        element.addEventListener('click', event => {

            if (true === track.visible) {
                this.hideTrack(track.id)
                event.target.innerText = "Show"
            } else {
                this.showTrack(track.id)
                event.target.innerText = "Hide"
            }

        })

        // track color & alpha
        const pickerButton = document.createElement('button')
        pickerButton.innerText = 'Color & Alpha'
        trackPanelRow.appendChild(pickerButton)

        const pickerConfig =
            {
                parent: pickerButton,
                popup: 'left',
                editorFormat: 'rgb',
                color:track.color,
                onChange: ({ rgba, rgbString }) => {
                    this.setTrackAlpha(track.id, parseFloat(rgba[ 3 ]))
                    this.setTrackColor(track.id, rgbString)
                },
            }

        new Picker(pickerConfig)

    }

    /**
     * Reset view with a new set of chromosomes.
     *
     * @param igvGenome {name: string, id: string, chromosomes: [{name: string, bpLength: integer, color: string}
     */
    setAssembly(igvGenome) {

        if (this.genomeId === igvGenome.id) {
            return;
        }
        this.tracks = [];
        this.genomeId = igvGenome.id;
        this.chrNames = new Set(igvGenome.chromosomes.map(chr => shortChrName(chr.name)));

        const regions = [];
        const colors = [];
        for (let chr of igvGenome.chromosomes) {
            const shortName = shortChrName(chr.name);
            colors.push(chr.color || getChrColor(shortName));
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
                trackId: igvGenome.id,
                type: 'ReferenceSequenceTrack',
                adapter: {
                    type: 'FromConfigSequenceAdapter',
                    features: regions,
                },
            },
            refNameColors: colors
        }

        this.render();

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

        const name = options.track || options.name || "*";

        let track = this.tracks.find(t => name === t.name);

        // Override track options or create new track
        if (track) {
            if (options.color) {
                track.color = options.color;
            }
            if (options.alpha) {
                track.alpha = options.alpha
            }
        } else {
            track =
                {
                name,
                chords: [],
                color: options.color || "black",
                alpha: options.alpha || 0.5,
                visible: true,
                id: options.id || guid()
            }
            this.tracks.push(track)

            this.addToTrackPanel(track)
        }

        // Append chords to track
        const currentIDs = new Set(track.chords.map(c => c.uniqueId));
        for (let c of newChords) {
            if (!currentIDs.has(c.uniqueId) &&
                this.chrNames.has(shortChrName(c.refName)) &&
                this.chrNames.has(shortChrName(c.mate.refName))) {
                track.chords.push(c);
                currentIDs.add(c.uniqueId);
            }
        }
        this.render();
    }

    /**
     * Set the nominal size of the view in pixels.  Size is reduced some aribtrary amount to account for borders and margins
     */
    setSize(size) {

        this.container.style.width =  `${ size }px`
        this.container.style.height = `${ size }px`

        if (this.viewState) {
            size -= 45;
            const view = this.viewState.session.view;
            view.setWidth(size);
            view.setHeight(size /* this is the height of the area inside the border in pixels */);
            view.setBpPerPx(view.minBpPerPx);
        }
    }

    getSize() {
        return this.container.clientWidth;
    }

    clearChords() {
        this.tracks = [];
        this.render();
    }

    clearSelection() {
        this.viewState.pluginManager.rootModel.session.clearSelection();
    }

    getFeature(featureId) {

        // TODO -- broken
        // const display = this.viewState.pluginManager.rootModel.session.view.tracks[0].displays[0]
        // const feature = display.data.features.get(featureId)
        // return feature;

        const features = [...this.viewState.config.tracks[0].adapter.features.value];
        for (let f of features) {
            if (featureId === f.uniqueId) {
                return f;
            }
        }
    }

    /**
     * Deprecated, use "visible" property
     */
    show() {
        this.parent.style.display = 'block';
    }

    /**
     * Deprecated, use "visible" property
     */
    hide() {
        this.parent.style.display = 'none';
    }

    get visible() {
        return this.parent.style.display !== 'none';
    }

    set visible(isVisible) {
        this.parent.style.display = isVisible ? 'block' : 'none';
    }

    hideTrack(trackID) {
        let track = this.tracks.find(t => trackID === t.id);
        if (track) {
            track.visible = false;
            this.render();
        } else {
            console.warn(`No track with name: ${name}`)
        }
    }

    showTrack(trackID) {
        let idx = this.tracks.findIndex(t => trackID === t.id);
        if (idx >= 0) {
            const track = this.tracks[idx];
            track.visible = true;
            this.tracks.splice(idx, 1);   // Change z-order
            this.tracks.push(track);
            this.render();
        } else {
            console.warn(`No track with name: ${name}`)
        }
    }

    deleteTrack(trackID) {
        let idx = this.tracks.findIndex(t => trackID === t.id);
        if (idx >= 0) {
            this.tracks.splice(idx, 1);
        }
        this.render();
    }

    getTrack(trackID) {
        return this.tracks.find(t => trackID === t.id);
    }

    setTrackColor(trackID, color) {
        const t = this.getTrack(trackID);
        if (t) {
            t.color = color;
            this.updateTrackColorAlpha(t)
        }
    }

    setTrackAlpha(trackID, alpha) {
        const t = this.getTrack(trackID);
        if (t) {
            t.alpha = alpha;
            this.updateTrackColorAlpha(t)
        }
    }

    updateTrackColorAlpha(t) {
        const trackID = t.id;
        let color = t.color || "black";
        if (t.alpha) {
            color = IGVColor.addAlpha(color, t.alpha);
        }

        for (let jbrowseTrack of this.viewState.config.tracks) {
            if (trackID === jbrowseTrack.trackId) {
                jbrowseTrack.displays[0].renderer.strokeColor.set(color);
                break;
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
        } = JBrowseReactCircularGenomeView;

        // Remove all children from possible previous renders.  React might do this for us when we render, but just in case.
        ReactDOM.unmountComponentAtNode(this.container);

        const visibleTracks = this.tracks.filter(t => false !== t.visible);

        const jbrowseTracks = [];
        const colors = [];

        for (let trackConfig of visibleTracks) {
            jbrowseTracks.push({
                trackId: trackConfig.id,
                name: trackConfig.name,
                assemblyNames: ['forIGV'],
                type: 'VariantTrack',
                adapter: {
                    type: 'FromConfigAdapter',
                    features: trackConfig.chords,
                }
            })
            colors.push(trackConfig.color);

        }

        this.viewState = createViewState({
            assembly: this.assembly,
            tracks: jbrowseTracks,
        });

        // Set view colors
        for (let i = 0; i < visibleTracks.length; i++) {
            this.viewState.config.tracks[i].displays[0].renderer.strokeColor.set(colors[i]);
            //this.viewState.config.tracks[i].displays[0].renderer.strokeColor.set("jexl:get(feature, 'color') || 'black'");
            //this.viewState.config.tracks[i].displays[0].renderer.strokeColorSelected.set("jexl:get(feature, 'highlightColor') || 'red'");
        }

        this.element = React.createElement(JBrowseCircularGenomeView, {viewState: this.viewState});
        this.setSize(this.container.clientWidth);

        ReactDOM.render(this.element, this.container);

        for (let i = 0; i < visibleTracks.length; i++) {
            this.viewState.session.view.showTrack(this.viewState.config.tracks[i].trackId);
            if (this.config.onChordClick) {
                this.viewState.pluginManager.jexl.addFunction('onChordClick', this.config.onChordClick);
                this.viewState.config.tracks[i].displays[0].onChordClick.set(
                    'jexl:onChordClick(feature, track, pluginManager)'
                );
            }
        }
    }
}

function shortChrName(chrName) {
    return chrName.startsWith("chr") ? chrName.substring(3) : chrName;
}

function defaultOnChordClick(feature, chordTrack, pluginManager) {
    console.log(feature);
}

function guid() {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}

export default CircularView;
