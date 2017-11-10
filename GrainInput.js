import GrainLitElement, { html } from '../grain-lit-element/GrainLitElement.js';

let minLength = function(value, minLength) {
  console.log(value);
  let stringValue = String(value);
}


export default class GrainInput extends GrainLitElement(HTMLElement) {

  static get properties() {
    return {
      value: {
        type: String,
        value: 'test',
        reflectToAttribute: 'value',
        observer: '_valueChanged'
      }
    };
  }

  constructor() {
    super();
    this.bla = ['a', 'b'];
  }

  _valueChanged(a, b) {
    // console.log(a);
    // console.log(b);
  }

  required(value) {
    return typeof value !== 'undefined';
  }

  validate(a) {
    let validators = this.$.meh.validators;
    console.log('go', validators);
    
    for (let i=0; i < validators.length; i++) {
      let validator = validators[i];
      if (Array.isArray(validator)) {
        console.log(validator[1]);
      }
      if (typeof validator === 'function') {
        console.log(validator(this.value));
      }
    }
  }

  render() {
    return html`
      <div id="meh" validators=${[this.required, [minLength, 10] ]}> meh </div>
      <button on-click="${this.validate.bind(this)}">validate</button>
    `;
      // <div id="meh2" validators=${this.bla}> meh2 </div>
      // <input type="text" validators="minLength(this.value, 10)" valid="${this.validate(this.value)}" value$="${this.value}" />
    }
}


