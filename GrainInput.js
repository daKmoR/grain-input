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
    return this.$_.input.value;
  }

  get name() {
    return this.$_.input.name;
  }

  getFieldName() {
    return this.fieldName ? this.fieldName : this.name;
  }

  connectedCallback() {
    super.connectedCallback();
    this.$_ = {};
    this.$_.input = this.querySelector('#input');
  }

  getErrorTranslationsKeys(data) {
    return [`errors.${data.validator}`, `global-errors:errors.${data.validator}`]
  }

  /**
   * a Validator can be
   * - special
   *     required, optional
   * - function
   *     e.g. required, isEmail, isEmpty
   * - array
   *     e.g. [isLength, {min: 10}], [isLength, {min: 5, max: 10}], [contains, 'me']
   */
  validate() {
    let validators = this.validators;
    let errors = [];
    let value = this.value;
    
    for (let i=0; i < validators.length; i++) {
      let validatorArray = Array.isArray(validators[i]) ? validators[i] : [validators[i]];
      let validatorFunction = validatorArray[0];
      let validatorParams = validatorArray[1];

      if (typeof validatorFunction === 'function') {
        if (!validatorFunction(value, validatorParams)) {
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