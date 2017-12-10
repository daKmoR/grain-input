import GrainLitElement, { html } from '../grain-lit-element/GrainLitElement.js';
import GrainValidateMixin from '../grain-validate/GrainValidateMixin.js';
import { unsafeHTML } from '../lit-html/lib/unsafe-html.js';

export default class GrainInput extends GrainValidateMixin(GrainLitElement) {
  static get translateDefaults() {
    return {
      loadNamespaces: ['grain-validate']
    };
  }

  static get properties() {
    return Object.assign(super.properties, {
      fieldName: {
        type: 'String',
        reflectToAttribute: 'field-name'
      },
      overlay: {
        type: 'Boolean',
        reflectToAttribute: 'overlay'
      },
      formattedValue: {
        type: 'String',
      },
      rawValue: {
        type: 'String',
      },
      jsValue: {
        type: 'String',
      },
    });
  }

  constructor() {
    super();
    this.inputId = 'id' + Math.random().toString(36).substr(2, 10);
    this.validationMessageId = `${this.inputId}-validation-message`;
  }

  getFieldName() {
    if (this.fieldName) {
      return this.fieldName;
    }
    if (this.$$slot.label) {
      return this.$$slot.label.innerText;
    }
    return this.$$slot.input.name;
  }

  elementToObject(el, i) {
    let attributes = {};
    el.getAttributeNames().forEach((attributeName) => {
      attributes[attributeName + '$'] = el.getAttribute(attributeName);
    });
    attributes = Object.assign({
      'id$': `${this.inputId}-${i}`
    }, attributes);
    return {
      tagName: el.tagName.toLowerCase(),
      attributes,
      innerHTML: el.innerHTML
    };
  }

  objectElementToString(obj) {
    let attributesString = '';
    Object.keys(obj.attributes).forEach((attribute) => {
      const value = obj.attributes[attribute];
      attributesString += ' ' + attribute.slice(0, -1) + '="' + value + '"';
    });
    return `<${obj.tagName}${attributesString}>${obj.innerHTML}</${obj.tagName}>`;
  }

  readLightDom() {
    this.content = [];
    this._otherIds = [];
    for (let i = 0; i < this.children.length; i += 1) {
      let child = this.children[i];
      switch (child.tagName) {
        case 'INPUT':
          this.input = this.elementToObject(child, i);
          this.input.attributes.id$ = this.inputId;
          break;
        case 'LABEL':
          this.label = this.elementToObject(child, i);
          break;
        default:
          let otherObj = this.elementToObject(child, i);
          this.content.push(otherObj);
          this._otherIds.push(otherObj.attributes.id$);
      }
    }
    this.contentString = '';
    this.content.forEach((obj) => {
      this.contentString += this.objectElementToString(obj);
    });
  }

  renderLightDom() {
    return html`
      <label slot="label" for$="${this.input.attributes.id$}" ...=${this.label.attributes}>${this.label.innerHTML}</label>
      <input slot="input"
        on-keydown="${e => this._keyDown(e)}"
        on-keyup="${e => this._keyUp(e)}"
        on-input="${e => this._onInput(e)}"
        on-blur="${e => this._onBlur(e)}"
        on-focus="${e => this._onFocus(e)}"
        aria-describedby$="${this._otherIds.join(' ') + ' ' + this.validationMessageId}"
        ...=${this.input.attributes}>

      ${unsafeHTML(this.contentString)}

      <div id$="${this.validationMessageId}">
        ${this.validationMessage ? this.t(this.validationMessage.translationKeys, this.validationMessage.data) : ''}
      </div>
    `;
  }

  get value() {
    return this.$$slot ? this.$$slot.input.value : '';
  }

  set value(newValue) {
    this.$$slot.input.value = newValue;
    this.update();
  }

  getRawValue(value) {
    return value;
  }

  getJsValue(value) {
    return value;
  }

  getFormattedValue(value) {
    return value;
  }

  _guessFormat() {}

  calculateValues(value) {
    let startValue = value ? value : this.value;
    this.rawValue = this.getRawValue(startValue);
    this.jsValue = this.getJsValue(this.rawValue);
    this._guessFormat();
    this.formattedValue = this.getFormattedValue(this.jsValue, this.rawValue);
  }

  _onFocus(e) {
    this.value = this.formattedValue;
    this.overlay = false;
    console.log('focus', this.value);
  }

  _onBlur(e) {
    this.overlayValue = this.formattedValue;
    this.overlay = true;
    this.value = this.rawValue;
    console.log('blur', this.value);
    super._onBlur();
  }

  _onInput(e) {
    this.calculateValues();
    this.value = this.formattedValue;
    super._onInput();
  }

  _keyDown(e) {
    // console.log(e);
    // this.value = this.formattedValue;
    // this.overlay = true;
  }

  _keyUp(e) {
    // console.log(e);
    // e.preventDefault();

    // this.value = this.formattedValue;
    // this.overlay = false;
  }

  connectedCallback() {
    this.readLightDom();
    super.connectedCallback();
  }

  afterFirstLightDomRender() {
    super.afterFirstLightDomRender();
    this.calculateValues();
  }

  afterFirstShadowDomRender() {
    super.afterFirstShadowDomRender();
    // this.$name.input.addEventListener('slotchange', (e) => {
    //   console.log('fired');
    // });
  }

  renderShadowDom() {
    return html`
      <style>
        #overlay {
          color: transparent;
        }
        :host([overlay]) #overlay {
          color: inherit;
        }
        :host([overlay]) #inputwrapper ::slotted(input) {
          color: transparent;
        }
        #inputwrapper {
          position: relative;
        }
        #overlay {
          position: absolute;
          pointer-events: none;
          border-color: transparent;
          background: transparent;
        }
      </style>
      <div id="labelwrapper">
        <slot name="label"></slot>
      </div>
      <div id="inputwrapper">
        <input id="overlay" value="${this.formattedValue}" tabindex="-1" aria-hidden="true" />
        <slot name="input"></slot>
      </div>
      <slot id="slot"></slot>
    `;
  }

}