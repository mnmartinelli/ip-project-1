import { LitElement, css, html } from 'lit';
import '@lrnwebcomponents/date-card/date-card.js';

class CourseDates extends LitElement {
  constructor() {
    super();
    this.dates = [];
    this.loadData = false;
  }

  static get properties() {
    return {
      dates: {
        type: Array,
      },
      loadData: {
        type: Boolean,
        reflect: true,
        attribute: 'load-data',
      },
    };
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'loadData' && this[propName]) {
        this.getData();
      }
    });
  }

  getData() {
    // special JS capability to resolve a URL path relative to the current file
    const file = new URL('./response.json', import.meta.url).href;
    // go get our data from the file
    fetch(file)
      .then(response =>
        // convert to json; I skip the .ok here because it's a local file
        // but remote requests should check for a valid response
        response.json()
      )
      .then(data => {
        this.dates = [];
        // many ways to loop here -- https://www.codespot.org/ways-to-loop-through-an-array-in-javascript/#:~:text=6%20Ways%20to%20Loop%20Through%20an%20Array%20in,callback%20function%20for%20each%20element%20in%20the%20array.
        // for loop runs synchronously though
        for (let i = 0; i < data.length; i++) {
          // eslint-disable-line
          // the API we're drawing in is confusing, let's simplify for internal usage to our element
          const eventInfo = {
            name: data[i].details,
            location: data[i].location,
            start: data[i].start_time,
            end: data[i].end_time,
            order: data[i].order,
          };
          // I googled "javascript ow to convert date string into..." and skipped around
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
          const startDate = new Date(eventInfo.start.split('T')[0]);
          eventInfo.month = new Intl.DateTimeFormat(document.lang, {
            month: 'short',
          }).format(startDate);
          eventInfo.day = new Intl.DateTimeFormat(document.lang, {
            weekday: 'short',
          }).format(startDate);
          eventInfo.date = startDate.getDate();
          // this is very lazy and very brute force
          eventInfo.start = eventInfo.start.split('T')[1].replace('-5:00', '');
          eventInfo.end = eventInfo.end.split('T')[1].replace('-5:00', '');
          console.log(eventInfo); // eslint-disable-line
          this.dates.push(eventInfo);
        }
        setTimeout(() => {
          this.loadData = false;
        }, 100);
      });
  }

  resetData() {
    this.dates = [];
    this.loadData = false;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      date-card {
        display: inline-flex;
      }
    `;
  }

  render() {
    return html`
      ${this.dates.map(
        item => html`
          <date-card
            location="${item.location}"
            month="${item.month}"
            day="${item.day}"
            date="${item.date}"
            title="${item.name}"
            start-time="${item.start}"
            end-time="${item.end}"
          ></date-card>
        `
      )}
    `;
  }
}

customElements.define('course-dates', CourseDates);
