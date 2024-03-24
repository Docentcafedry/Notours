class APIFeatures {
  constructor(query, reqQueries) {
    this.query = query;
    this.reqQueries = reqQueries;
  }

  filter() {
    const filterQueries = { ...this.reqQueries };
    const excludedQueries = ['page', 'limit', 'sort', 'fields'];
    excludedQueries.forEach((query) => delete filterQueries[query]);
    let queryString = JSON.stringify(filterQueries);
    queryString = JSON.parse(
      queryString.replace(/\b(gte|gt|lte|lt)\b/g, (value) => `$${value}`)
    );

    this.query = this.query.find(queryString);
    return this;
  }

  sort() {
    if (this.reqQueries.sort) {
      const sortString = this.reqQueries.sort.split(',').join(` `);
      this.query = this.query.sort(sortString);
    } else {
      this.query = this.query.sort('price');
    }

    return this;
  }

  selectFields() {
    if (this.reqQueries.fields) {
      const fieldsString = this.reqQueries.fields.split(',').join(' ');
      this.query = this.query.select(fieldsString);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.reqQueries.page * 1 || 1;
    const limit = this.reqQueries.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
