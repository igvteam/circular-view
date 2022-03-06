class ChordSetManager {

    constructor(config) {
        this.tracks = []
        this.chordSets = []
    }

    addChordSet(chordSet) {

        // If a chord set with this name exists replace it (same track, same region)
        this.chordSets = this.chordSets.filter(g => g.name !== chordSet.name)
        this.chordSets.push(chordSet)

        let track = this.tracks.find(t => chordSet.trackName === t.name)
        if (track) {
            track.chordSets = track.chordSets.filter(cs => cs.name !== chordSet.name)
            track.chordSets.push(chordSet)
        }
        if (!track) {
            track = new IGVTrack(chordSet)
            this.tracks.push(track)
        }
    }

    clearChords() {
        this.tracks = []
        this.chordSets = []
    }

    getTrack(name) {
        return this.tracks.find(t => name === t.name)
    }

    getChordSet(name) {
        return this.chordSets.find(cs => name === cs.name)
    }

}

class IGVTrack {
    constructor(chordSet) {
        this.name = chordSet.trackName
        this.color = chordSet.trackColor
        this.visible = true
        this.chordSets = [chordSet]
        this.id = guid()
    }

    get chords() {
        if (this.chordSets.length === 1) {
            return this.chordSets[0].chords
        }
        const chords = []
        for (let cs of this.chordSets) {
            for (let c of cs.chords) {
                chords.push(c)
            }
        }
        return chords
    }
}


function guid() {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
}

export default ChordSetManager


