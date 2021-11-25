function embedCSS() {

    const css =  '.igv-circview-container {\n  z-index: 2048;\n  position: absolute;\n  width: fit-content;\n  height: fit-content;\n  box-sizing: content-box;\n  color: dimgray;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: 12px;\n  background-color: white;\n  border-color: dimgray;\n  border-style: solid;\n  border-width: thin;\n  display: flex;\n  flex-direction: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: flex-start; }\n\n.igv-circview-toolbar {\n  position: relative;\n  width: 100%;\n  height: 32px;\n  background-color: lightgrey;\n  border-bottom-style: solid;\n  border-bottom-color: dimgray;\n  border-bottom-width: thin;\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: space-between;\n  align-items: center; }\n\n.igv-circview-toolbar-button-container {\n  height: 100%;\n  width: fit-content;\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: center; }\n  .igv-circview-toolbar-button-container > div {\n    margin: 4px; }\n\n.igv-circview-track-panel {\n  z-index: 1024;\n  position: absolute;\n  top: 33px;\n  left: 0;\n  width: 100%;\n  height: fit-content;\n  border-bottom-style: solid;\n  border-bottom-color: dimgray;\n  border-bottom-width: thin;\n  background-color: white;\n  display: flex;\n  flex-flow: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: flex-start; }\n  .igv-circview-track-panel > div {\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    align-items: center; }\n    .igv-circview-track-panel > div > div {\n      margin: 4px; }\n\n.igv-circview-swatch-button {\n  cursor: pointer;\n  padding: 5px;\n  width: 8px;\n  height: 8px;\n  border: 1px solid #8d8b8b;\n  border-radius: 16px; }\n\n.igv-circview-button {\n  cursor: pointer;\n  padding: 5px;\n  color: #444;\n  vertical-align: middle;\n  text-align: center;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: 12px;\n  border: 1px solid #8d8b8b;\n  border-radius: 4px;\n  background: #efefef;\n  box-shadow: 0 0 5px -1px rgba(0, 0, 0, 0.2); }\n\n.igv-circview-button:hover {\n  background: #efefef;\n  box-shadow: 0 0 5px -1px rgba(0, 0, 0, 0.6); }\n\n.igv-circview-button:active {\n  color: #007bff;\n  box-shadow: 0 0 5px -1px rgba(0, 0, 0, 0.6); }\n\n/*# sourceMappingURL=circular-view.css.map */\n'

    const style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.innerHTML = css
    document.head.insertBefore(style, document.head.childNodes[ document.head.childNodes.length - 1 ]);
}

export default embedCSS
