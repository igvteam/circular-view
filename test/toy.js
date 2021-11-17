import CircularView from "../js/circularView.js";
import hg19 from "./hg19.js";
import mm10 from "./mm10.js"
import snifflesTrack from "./snifflesTrack.js";
import dellyTrack from "./dellyTrack.js";

document.addEventListener('DOMContentLoaded', () => main())

let circularView

function main () {

    const config =
        {
            onChordClick: feature => {
            const f1 = feature.data;
            const f2 = f1.mate;
            const flanking = 2000;
            const s1 = Math.max(0, f1.start - flanking);
            const e1 = f1.end + flanking;
            const s2 = Math.max(0, f2.start - flanking);
            const e2 = f2.end + flanking;
            const searchString = `goto ${f1.refName}:${s1}-${e1} ${f2.refName}:${s2}-${e2}\r\n`
            console.log(searchString);
        },
        }

    // circularView = new CircularView(document.getElementById('jbrowse-circular-genome-view'), config);
    circularView = new CircularView(document.querySelector('.jbrowse-container'), config);

    document.getElementById("hg19").addEventListener("click", e => circularView.setAssembly(hg19));
    document.getElementById("mm10").addEventListener("click", e => circularView.setAssembly(mm10));
    document.getElementById("sniffles").addEventListener("click", e => toggleTrack(e, snifflesTrack));
    document.getElementById("delly").addEventListener("click", e => toggleTrack(e, dellyTrack));

}

function toggleTrack(e, track) {

    const t = circularView.getTrack(track.name)

    if(!t) {
        e.target.style.backgroundColor = track.color;
        circularView.addChords(track.chords, {track: track.name, color: track.color})
    } else {
        true === t.visible ? circularView.hideTrack(track.name) : circularView.showTrack(track.name)
    }
}
