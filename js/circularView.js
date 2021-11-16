import {getChrColor} from "./chrColor.js";

class CircularView {

    static isInstalled() {
        return window["JBrowseReactCircularGenomeView"] !== undefined && window["React"] !== undefined && window["ReactDOM"] !== undefined;
    }

    /**
     * Create a new CircularView
     *
     * @param div
     * @param config - configuration options
     *   {
     *       assembly: {name: string, id: string, chromosomes: [{name: string, bpLength: integer, color: string}]
     *       onChordClick: function called upon chord click with chord feature as argument
     *   }
     */
    constructor(div, config) {
        config = config || {}
        if (CircularView.isInstalled()) {

            this.container = div;
            this.config = config;

            if (config.assembly) {
                this.setAssembly(config.assembly)
            }

            this.tracks = [];

        } else {
            console.error("JBrowse circular view is not installed");
        }
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
        const color = options.color || "black";

        let track = this.tracks.find(t => name === t.name);
        if (track && options.color) {
            track.color = options.color;  // Override
        } else if (!track) {
            track = {name: name, chords: [], color: color, visible: true, id: options.id || guid()}
            this.tracks.push(track);
        }
        const chords = false !== options.append ? track.chords : [];

        const currentIDs = new Set(chords.map(c => c.uniqueId));
        for (let c of newChords) {
            if (!currentIDs.has(c.uniqueId) &&
                this.chrNames.has(shortChrName(c.refName)) &&
                this.chrNames.has(shortChrName(c.mate.refName))) {
                chords.push(c);
                currentIDs.add(c.uniqueId);
            }
        }
        this.render();
        // this.viewState.config.tracks[0].adapter.features.set(chords);
        // this.viewState.session.view.showTrack(this.viewState.config.tracks[0].trackId);
    }


    /**
     * Set the nominal size of the view in pixels.  Size is reduced some aribtrary amount to account for borders and margins
     */
    setSize(size) {
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
        this.container.style.display = 'block';
    }

    /**
     * Deprecated, use "visible" property
     */
    hide() {
        this.container.style.display = 'none';
    }

    get visible() {
        return this.container.style.display === 'block';
    }

    set visible(isVisible) {
        this.container.style.display = isVisible ? 'block' : 'none';
        if (isVisible) {
            this.render();
        }
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
        if(idx >= 0) {
            this.tracks.splice(idx, 1);
        }
    }

    getTrack(trackID) {
        return this.tracks.find(t => trackID === t.id);
    }

    setTrackColor(trackID, color) {
        console.log("Set track color not implemented")
    }

    setTrackAlpha(trackID, alpha) {
        console.log("Set track alpha not implemented");
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

        //this.hideTrackSelectButton();
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