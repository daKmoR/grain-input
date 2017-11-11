import GrainLitElement, { html } from '../grain-lit-element/GrainLitElement.js';

export default class GrainInput extends GrainLitElement(HTMLElement) {

  static get properties() {
    return {
      validators: {
        type: Array
      },
      errors: {
        type: Array,
        value: []
      }
    };
  }

  get value() {
    return this.$_.input.value;
  }

  connectedCallback() {
    super.connectedCallback();
    this.$_ = {};
    this.$_.input = this.querySelector('#input');
  }

  /**
   * a Validator can be
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
          errors.push({
            name: validatorFunction.name,
            value,
            params: validatorParams
          });
        }
      }
    }
    this.errors = errors;
  }

  render() {
    return html`
      <slot></slot>
      <ul>
        ${this.errors.map((error) => { return html`<li>${error.name}</li>`; })}
      </ul>
    `;
  }
}