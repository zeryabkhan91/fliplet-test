const axios = require("axios");
const pick = require('lodash.pick')

// var sampleData = {
// 	apps: [
//     { id: 1, title: 'Lorem', published: true, userId: 123 },
//     { id: 2, title: 'Ipsum', published: false, userId: 123 },
//     { id: 3, title: 'Dolor', published: true, userId: 456 },
//     { id: 4, title: 'Sit', published: true, userId: 789 },
//     { id: 5, title: 'Amet', published: false, userId: 123 },
//     { id: 6, title: 'Et', published: true, userId: 123 }
//   ],
//   organizations: [
//   	{ id: 1, name: 'Google', suspended: true, userId: 123 },
//     { id: 2, name: 'Apple', suspended: false, userId: 456 },
//     { id: 3, name: 'Fliplet', suspended: false, userId: 123 }
//   ]
// }

const BACKEND_API_URL = "http://localhost:3000";

// @TODO: This is the model/class you should work out
class User {
  constructor({ id }) {
    this.id = id;
  }

  select(appName) {
    this.appName = appName;
    return this;
  }

  attributes(toShowAttribute) {
    this.toShowAttribute = toShowAttribute;
    return this;
  }

  where(condition) {
    this.conditionParams = condition;
    return this;
  }

  order(columns) {
    this.columnsToSort = columns;
    return this;
  }

  showSelectedAttributes(selectedAttibutes, records) {
    if (!selectedAttibutes?.length) return records || [];
    return records.map((record) => pick(record, selectedAttibutes));
  }

  convertToParams() {
    let params = {};

    if (this.columnsToSort?.length) {
      params = { ...params, _sort: this.columnsToSort.join(",") };
    }

    if (Object.keys(this.conditionParams).length) {
      Object.keys(this.conditionParams).forEach((key) => {
        params = { ...params, [key]: this.conditionParams[key] };
      });
    }

    return params;
  }

  async findAll() {
    const appName = this.appName;
    const attributes = this.toShowAttribute;
    try {
      const params = this.convertToParams();

      this.resetAttributes();

      const response = await axios.get(
        `${BACKEND_API_URL}/${appName}`,
        { params }
      );

      const data = response.data;

      return this.showSelectedAttributes(attributes, data);
    } catch (error) {
      throw error;
    }
  }

  async findOne() {
    const appName = this.appName;
    const attributes = this.toShowAttribute;

    try {
      const params = this.convertToParams();

      this.resetAttributes();

      const response = await axios.get(
        `${BACKEND_API_URL}/${appName}`,
        { params }
      );
      const data = response.data;

      return this.showSelectedAttributes(attributes, data).find((record) => record);
    } catch (error) {
      throw error;
    }
  }

  resetAttributes() {
    this.records = [];
    this.toShowAttribute = [];
    this.columnsToSort = []
    this.appName = '';
  }
}

// ------------------------------------------
// You shouldn't need to edit below this line

var user = new User({
	id: 123
});

// Mimic what a ORM-like query engine would do by filtering the
// "sampleData" based on the query and the expected result example.
// Hint: lodash can be quite handly in dealing with this.
user
	.select('apps')
  .attributes(['id', 'title'])
  .where({ published: true })
  .order(['title'])
  .findAll()
  .then(function (apps) {
    // The expected result is for the "apps" array is:
    // [ { id: 6, title: 'Et' }, { id: 1, title: 'Lorem' } ]
    console.log(apps);
  })
  
user
	.select('organizations')
  .attributes(['name'])
  .where({ suspended: false })
  .findOne()
  .then(function (organization) {
    // The expected result is for the "organization" object is:
    // { id: 3, name: 'Fliplet' }
    console.log(organization);
  })