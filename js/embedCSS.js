function embedCSS() {

    const css =  '.jbrowse-container {\n  z-index: 2048;\n  position: absolute;\n  box-sizing: content-box;\n  border-color: dimgray;\n  border-style: solid;\n  border-width: thin;\n  display: flex;\n  flex-direction: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: flex-start;\n  width: fit-content;\n  height: fit-content;\n  color: dimgray;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: 12px;\n  background-color: white; }\n\n.jbrowse-toolbar {\n  position: relative;\n  width: 100%;\n  height: 32px;\n  background-color: lightgrey;\n  border-bottom-style: solid;\n  border-bottom-color: dimgray;\n  border-bottom-width: thin;\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: space-between;\n  align-items: center; }\n\n.jbrowse-toolbar-button-container {\n  height: 100%;\n  width: fit-content;\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: center; }\n  .jbrowse-toolbar-button-container button {\n    cursor: pointer;\n    margin-left: 4px;\n    margin-right: 4px; }\n\n.jbrowse-track-panel {\n  z-index: 1024;\n  position: absolute;\n  top: 33px;\n  left: 0;\n  width: 100%;\n  height: fit-content;\n  border-bottom-style: solid;\n  border-bottom-color: dimgray;\n  border-bottom-width: thin;\n  display: flex;\n  flex-flow: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: center; }\n  .jbrowse-track-panel > div {\n    width: 100%;\n    height: fit-content;\n    background-color: white;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    align-items: center; }\n    .jbrowse-track-panel > div > button {\n      cursor: pointer;\n      margin: 8px; }\n    .jbrowse-track-panel > div > div {\n      font-weight: 700;\n      margin-left: 4px;\n      vertical-align: middle;\n      padding-left: 4px;\n      padding-right: 4px;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      height: fit-content;\n      width: 160px; }\n  .jbrowse-track-panel > div:hover {\n    background-color: #f4f4f4; }\n\n/*# sourceMappingURL=circular-view.css.map */\n'

    const style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.innerHTML = css
    document.head.insertBefore(style, document.head.childNodes[ document.head.childNodes.length - 1 ]);
}

export default embedCSS
