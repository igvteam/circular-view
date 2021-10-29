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
     *       chromosomes: <array of chromosome objects {name, bpLength, color (optional)}>  *REQUIRED
     *       onChordClick: function called upon chord click with chord feature as argument  *OPTIONAL
     *   }
     */
    constructor(div, config) {

        if (CircularView.isInstalled()) {

            const {createElement} = React
            const {render} = ReactDOM
            const {
                createViewState,
                JBrowseCircularGenomeView,
            } = JBrowseReactCircularGenomeView;

            this.container = div;

            this.chrNames = new Set();
            const regions = [];
            const colors = [];
            for (let chr of config.chromosomes) {
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
                    name: 'forIGV',
                    sequence: {
                        trackId: 'refSeqTrack',
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

            if(config.onChordClick) {
                this.onChordClick(config.onChordClick)
            }

            const element = createElement(JBrowseCircularGenomeView, {viewState: this.viewState});
            this.setSize(div.clientWidth);
            render(element, div);

        } else {
            console.error("JBrowse circular view is not installed");
        }
    }

    /**
     * Set the nominal size of the view in pixels.  Size is reduced some aribtrary amount to account for borders and margins
     */
    setSize(size) {
        size -= 45;
        const view = this.viewState.session.view;
        view.setWidth(size);
        view.setHeight(size /* this is the height of the area inside the border in pixels */);
        view.setBpPerPx(view.minBpPerPx);
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
    // addTrack(name, chords) {
    //     const track = {
    //         trackId: name,
    //         name: name,
    //         assemblyNames: ['forIGV'],
    //         type: 'VariantTrack',
    //         adapter: {
    //             type: 'FromConfigAdapter',
    //             features: chords,
    //         }
    //     }
    //     this.viewState.config.tracks.push(track);  // <<< DOESN't WORK
    // }

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

    show() {
        this.container.style.display = 'block'
    }

    hide() {
        this.container.style.display = 'none'
    }

}

function shortChrName(chrName) {
    return chrName.startsWith("chr") ? chrName.substring(3) : chrName;
}

function defaultOnChordClick(feature, chordTrack, pluginManager) {
    console.log(feature);
}


export default CircularView;