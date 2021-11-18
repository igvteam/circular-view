function embedCSS() {

    const css =  '_CSS_'

    const style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.innerHTML = css
    document.head.insertBefore(style, document.head.childNodes[ document.head.childNodes.length - 1 ]);
}

export default embedCSS
