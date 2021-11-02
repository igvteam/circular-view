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
     *       chromosomes: <array of chromosome objects {name, bpLength, color (optional)}>  *OPTIONAL
     *       onChordClick: function called upon chord click with chord feature as argument  *OPTIONAL
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

        } else {
            console.error("JBrowse circular view is not installed");
        }
    }

    /**
     * Reset view with a new set of chromosomes.
     *
     * @param igvGenome
     * {
     *     name: <string>,
     *     id: <string>,
     *     chromosomes: [
     *         {
     *             name, <string>,
     *             bpLength: <integer>,
     *             color: <string>  *OPTIONAL
     *         }
     *     ]
     *
     * }
     */
    setAssembly(igvGenome) {

        if(this.genomeId === igvGenome.id) {
            return;
        }

        const {
            createViewState,
            JBrowseCircularGenomeView,
        } = JBrowseReactCircularGenomeView;

        // Remove all children from possible previously assemblies.  React might do this for us when we render, but just in case.
        ReactDOM.unmountComponentAtNode(this.container);

        this.genomeId = igvGenome.id;
        this.chrNames = new Set();
        const regions = [];
        const colors = [];

        for (let chr of igvGenome.chromosomes) {
            const shortName = shortChrName(chr.name);
            this.chrNames.add(shortName);
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

        this.viewState = createViewState({
            assembly: {
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
            },
            tracks: [
                {
                    trackId: 'firstTrack',
                    name: 'A Track',
                    assemblyNames: ['forIGV'],
                    type: 'VariantTrack',
                    adapter: {
                        type: 'FromConfigAdapter',
                        features: [],
                    },
                },
            ],
        });

        // Set view colors
        this.viewState.config.tracks[0].displays[0].renderer.strokeColor.set("jexl:get(feature, 'color') || 'black'");
        //this.viewState.config.tracks[0].displays[0].renderer.strokeColorSelected.set("jexl:get(feature, 'highlightColor') || 'red'");

        if (this.config.onChordClick) {
            this.onChordClick(this.config.onChordClick)
        }

        this.element = React.createElement(JBrowseCircularGenomeView, {viewState: this.viewState});
        this.setSize(this.container.clientWidth);

        ReactDOM.render(this.element, this.container);

        this.hideTrackSelectButton();
    }


    /**
     * Set the nominal size of the view in pixels.  Size is reduced some aribtrary amount to account for borders and margins
     */
    setSize(size) {
        if(this.viewState) {
            size -= 45;
            const view = this.viewState.session.view;
            view.setWidth(size);
            view.setHeight(size /* this is the height of the area inside the border in pixels */);
            view.setBpPerPx(view.minBpPerPx);
        }
    }


    /**
     * Append or replace current set of chords
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
     *   },
     *   ....
     * ]
     * @param append
     */
    addChords(newChords, append) {
        const chords = append ? [...this.viewState.config.tracks[0].adapter.features.value] : [];
        const currentIDs = new Set(chords.map(c => c.uniqueId));
        for (let c of newChords) {
            if (!currentIDs.has(c.uniqueId) &&
                this.chrNames.has(shortChrName(c.refName)) &&
                this.chrNames.has(shortChrName(c.mate.refName))) {
                chords.push(c);
                currentIDs.add(c.uniqueId);
            }
        }
        this.viewState.config.tracks[0].adapter.features.set(chords);
        this.viewState.session.view.showTrack(this.viewState.config.tracks[0].trackId);
    }

    //
    addTrack(name, chords) {
        const track = {
            trackId: name,
            name: name,
            assemblyNames: ['forIGV'],
            type: 'VariantTrack',
            adapter: {
                type: 'FromConfigAdapter',
                features: chords,
            }
        }
        this.viewState.config.tracks.push(track);  // <<< DOESN't WORK
    }

    clearChords() {
        this.viewState.config.tracks[0].adapter.features.set([]);
        this.viewState.session.view.showTrack(this.viewState.config.tracks[0].trackId);
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

    onChordClick(callback) {
        this.viewState.pluginManager.jexl.addFunction('onChordClick', callback);
        this.viewState.config.tracks[0].displays[0].onChordClick.set(
            'jexl:onChordClick(feature, track, pluginManager)'
        );
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
    }

    hideTrackSelectButton() {
        // Hack to hide track menu, which has no relevance to IGV.   The "render" function is async and takes time,
        // with no way to be notified when its finished (the callback argument is called immediately).
        setTimeout(() => {
            let trackButton = this.container.querySelector("button[data-testid='circular_track_select']");
            if (trackButton) {
                trackButton.style.display = 'none';
            } else {
                if(CircularView.hideTrackSelectedAttempts++ < 5) {
                    this.hideTrackSelectButton();
                }
            }
        }, 100);
    }

    static hideTrackSelectedAttempts = 0;

}

function shortChrName(chrName) {
    return chrName.startsWith("chr") ? chrName.substring(3) : chrName;
}

function defaultOnChordClick(feature, chordTrack, pluginManager) {
    console.log(feature);
}


export default CircularView;