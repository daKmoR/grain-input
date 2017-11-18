import GrainLitElement, { html } from '../grain-lit-element/GrainLitElement.js';
import { directive } from '../lit-html/lit-html.js';
import GrainTranslateMixin from '../grain-translate/GrainTranslateMixin.js';

export default class GrainInput extends GrainTranslateMixin(GrainLitElement) {

  static get properties() {
    return {
      validators: {
        type: Array
      },
      errors: {
        type: Array,
        value: []
      },
      fieldName: {
        type: String,
        reflectToAttribute: 'field-name'
      }
    };
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
      <input slot="input" ...=${this.input.attributes}>
      <p>${this.error ? this.t(this.error.translationKeys, this.error.data) : ''}</p>
    `;
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

  getErrorTranslationsKeys(data) {
    return [`errors.${data.validator}`, `global-errors:errors.${data.validator}`]
  }

  renderShadowDom() {
    return html`
      <div id="labelwrapper">
        <slot name="label"></slot>
      </div>
      <div id="inputwrapper">
        <slot name="input"></slot>
      </div>
      <slot id="slot"></slot>
    `;
  }

  /**
   * a Validator can be
   * - special
   *     e.g. 'required', 'optional'
   * - function
   *     e.g. required, isEmail, isEmpty
   * - array
   *     e.g. [isLength, {min: 10}], [isLength, {min: 5, max: 10}], [contains, 'me']
   */
  validate() {
    let validators = this.validators;
    let errors = [];
    let value = this.$$slot.input.value;
    let optional = false;
    let required = function(value) {
      return (typeof value === 'string' && value !== '') || (typeof value !== 'string' && typeof value !== 'undefined');
    }
    
    for (let i=0; i < validators.length; i++) {
      if (typeof validators[i] === 'string') {
        optional = validators[i] === 'optional';
        if (validators[i] === 'required') {
          validators[i] = required;
        }
      }
      let validatorArray = Array.isArray(validators[i]) ? validators[i] : [validators[i]];
      let validatorFunction = validatorArray[0];
      let validatorParams = validatorArray[1];

      if (typeof validatorFunction === 'function') {
        if (!validatorFunction(value, validatorParams) && !(optional === true && typeof value === 'string' && value === '')) {
          let data = Object.assign({}, validatorParams, {
            validator: validatorFunction.name,
            fieldName: this.getFieldName(),
            name: this.$$slot.input.name,
            value
          });
          errors.push({
            data,
            translationKeys: this.getErrorTranslationsKeys(data)
          });
        }
      }
    }
    this.errors = errors;
    this.error = this.errors.length > 0 ? this.errors[0] : {};
  }
}