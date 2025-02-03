class NativePopup {
    static defaultOptions = {
        width: 400,
        height: 300
    };

    constructor(html = '', buttons = [], options = {}) {
        this.options = { ...NativePopup.defaultOptions, ...options };
        this.id = `sp-popup-${Math.floor(Math.random() * 100000)}`;
        this.html = html;
        this.buttons = Array.isArray(buttons) ? buttons : [];
        
        this._createPopupElements();
        this._applyStyles();
        this._updatePopupDimensions();
        window.addEventListener('resize', this._updatePopupDimensions);
    }

    _createPopupElements() {
        this.blurScreen = this._createElement('div', `${this.id}-blur`, document.body);
        this.popup = this._createElement('div', `${this.id}-window`, document.body);
        this.closePopupButton = this._createElement('div', `${this.id}-close`, this.popup, 'X');
        this.popupContent = this._createElement('div', `${this.id}-content`, this.popup, this.html);
        this.popupButtonsWrapper = this._createElement('div', `${this.id}-buttons`, this.popup);

        this.closePopupButton.title = 'Close';
        this.closePopupButton.addEventListener('click', () => this.close());
        
        this._createButtons();
    }

    _createElement(tag, id, parent, innerHTML = '') {
        const elem = document.createElement(tag);
        elem.id = id;
        elem.innerHTML = innerHTML;
        parent.appendChild(elem);
        return elem;
    }

    _createButtons() {
        this.popupButtonsWrapper.innerHTML = '';
        this.buttons.forEach(({ caption, callback }) => {
            const button = this._createElement('button', '', this.popupButtonsWrapper, caption);
            if (typeof callback === 'function') {
                button.addEventListener('click', () => callback(this));
            }
        });
    }

    _applyStyles() {
        Object.assign(this.blurScreen.style, {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: '#FFF', opacity: 0.85, zIndex: 1001
        });
        
        const { width, height } = this.options;
        Object.assign(this.popup.style, {
            position: 'fixed', border: '1px solid #CCC', boxShadow: '0 0 5px rgba(0,0,0,0.3)',
            width: `${width}px`, height: `${height}px`, background: '#FFF', zIndex: 1002,
            overflow: 'hidden'
        });

        Object.assign(this.closePopupButton.style, {
            float: 'right', width: '20px', height: '20px', lineHeight: '20px', textAlign: 'center',
            color: '#CCC', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Verdana, monospace'
        });
    }

    _updatePopupDimensions = () => {
        const { clientWidth: sw, clientHeight: sh } = document.documentElement;
        this.popup.style.top = `${(sh - this.popup.clientHeight) / 2}px`;
        this.popup.style.left = `${(sw - this.popup.clientWidth) / 2}px`;
    };

    show() {
        this.blurScreen.style.display = 'block';
        this.popup.style.display = 'block';
    }

    close() {
        window.removeEventListener('resize', this._updatePopupDimensions);
        [this.blurScreen, this.popup].forEach(el => el.remove());
    }
}

// Export globally
window.NativePopup = NativePopup;
