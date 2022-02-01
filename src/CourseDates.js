import { LitElement, css, html } from 'lit';
import '@lrnwebcomponents/date-card/date-card.js';

class CourseDates extends LitElement {
  constructor() {
    super();
    this.dates = [];
    this.loadData = false;
    this.view = 'card';
  }

  static get properties() {
    return {
      view: { type: String, reflect: true },
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
      // when dates changes, fire an event for others to react to if they wish
      else if (propName === 'dates') {
        this.dispatchEvent(
          new CustomEvent('results-changed', {
            detail: {
              value: this.dates,
            },
          })
        );
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
        // this line prevents the linter from being mad since this is kinda a crappy old way of doing this :)
        // details: https://masteringjs.io/tutorials/eslint/ignore#:~:text=You%20can%20use%20comments%20to%20disable%20all%20ESLint,root%20directory..eslintignore%20syntax%20is%20similar%20to%20that%20of.gitignore.
        /* eslint-disable */
        for (let i = 0; i < data.length; i++) {
          // the API we're drawing in is confusing, let's simplify for internal usage to our element
          const eventInfo = {
            name: data[i].details,
            location: data[i].location,
            start: data[i].start_time,
            end: data[i].end_time,
            order: data[i].order,
          };
          // brute force; just pull what looks like a date off the front for 01-31-22 format
          const startDate = new Date(eventInfo.start.split('T')[0]);
          // I googled "javascript ow to convert date string into..." and skipped around
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
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
          // so you can see object printed to console
          console.log(eventInfo);
          this.dates.push(eventInfo);
        }
        // tell the browser to wait for 1 second before setting this back to what it was
        setTimeout(() => {
          this.loadData = false;
        }, 1000);
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
        border: 2px solid black;
        min-height: 100px;
      }
      date-card {
        display: inline-flex;
      }
      :host([view='list']) ul {
        margin: 20px;
      }
    `;
  }

  render() {
    return html`
      ${this.view === 'list'
        ? html`
            <ul>
              ${this.dates.map(
                item => html`
                  <li>
                    ${item.location} - ${item.month} - ${item.day} ${item.date}
                    - ${item.name} - ${item.start} - ${item.end}
                  </li>
                `
              )}
            </ul>
          `
        : html`
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
          `}
    `;
  }
}

customElements.define('course-dates', CourseDates);
