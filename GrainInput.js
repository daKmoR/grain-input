import GrainLitElement, { html } from '../grain-lit-element/GrainLitElement.js';
import GrainValidateMixin from '../grain-validate/GrainValidateMixin.js';

export default class GrainInput extends GrainValidateMixin(GrainLitElement) {

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
        value: ''
      },
      rawValue: {
        type: 'Number'
      }
    });
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

  elementToObject(el) {
    let attributes = {};
    el.getAttributeNames().forEach((attributeName) => {
      attributes[attributeName] = el.getAttribute(attributeName);
    });
    attributes = Object.assign({
      id: 'id' + Math.random().toString(36).substr(2, 10)
    }, attributes);
    return {
      tagName: el.tagName.toLowerCase(),
      attributes,
      innerHTML: el.innerHTML
    };
  }

  readLightDom() {
    this.content = [];
    this._otherIds = [];
    for (let i = 0; i < this.children.length; i += 1) {
      let child = this.children[i];
      switch (child.tagName) {
        case 'INPUT':
          this.input = this.elementToObject(child);
          break;
        case 'LABEL':
          this.label = this.elementToObject(child);
          break;
        default:
          let otherObj = this.elementToObject(child);
          this.content.push(otherObj);
          this._otherIds.push(otherObj.attributes.id);
      }
    }
  }

  renderLightDom() {
    return html`
      <label slot="label" for$="${this.input.attributes.id}" ...=${this.label.attributes}>${this.label.innerHTML}</label>
      <input slot="input"
        on-keydown="${e => this._keyDown(e)}"
        on-keyup="${e => this._keyUp(e)}"
        on-input="${e => this._onInput(e)}"
        on-blur="${e => this._onBlur(e)}"
        on-focus="${e => this._onFocus(e)}"
        ...=${this.input.attributes}>
      <p>${this.error ? this.t(this.error.translationKeys, this.error.data) : ''}</p>
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

  getFormattedValue(value) {
    return value;
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
  }

  _onInput(e) {
    this.rawValue = this.getRawValue(this.value);
    this.formattedValue = this.getFormattedValue(this.rawValue);
    this.value = this.formattedValue;
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