import GrainLitElement, { html } from '../grain-lit-element/GrainLitElement.js';
import GrainTranslateMixin from '../grain-translate/GrainTranslateMixin.js';

export default class GrainInput extends GrainTranslateMixin(GrainLitElement(HTMLElement)) {

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

  get value() {
    return this.nativeInput.value;
  }

  get name() {
    return this.nativeInput.name;
  }

  getFieldName() {
    if (this.fieldName) {
      return this.fieldName;
    }
    if (this.nativeLabel) {
      return this.nativeLabel.innerText;
    }
    return this.name;
  }

  connectedCallback() {
    super.connectedCallback();
    this.nativeInput = this.querySelector('input');
    this.nativeLabel = this.querySelector('label');
    if (!this.nativeInput.hasAttribute('id')) {
      let id = 'id' + Math.random().toString(36).substr(2, 10);
      this.nativeInput.setAttribute('id', id);
      this.nativeLabel.setAttribute('for', id);
    }
  }

  getErrorTranslationsKeys(data) {
    return [`errors.${data.validator}`, `global-errors:errors.${data.validator}`]
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
    let value = this.value;
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
            name: this.name,
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

  render() {
    return html`
      <slot></slot>
      <p>${this.error ? this.t(this.error.translationKeys, this.error.data) : ''}</p>
      <ul>
        ${this.errors.map((error) => { return html`
          <li>
            ${JSON.stringify(error)}<br />
            ${this.t(error.translationKeys, error.data)}
          </li>
        `; })}
      </ul>
    `;
  }
}