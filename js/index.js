import CircularView from './circularView.js'
import embedCSS from './embedCSS.js'

if(typeof document !== 'undefined') {

    if (!stylesheetExists("circular-view.css")) {
        embedCSS()
    }

    function stylesheetExists(stylesheetName) {
        for (let ss of document.styleSheets) {
            ss = ss.href ? ss.href.replace(/^.*[\\\/]/, '') : '';
            if (ss === stylesheetName) {
                return true;
            }
        }
        return false;
    }
}

export { CircularView }
