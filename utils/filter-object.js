function filterObjectForUpdate(object, ...fields) {
  const objectForUpdate = {};
  Object.keys(object).forEach((field) => {
    if (fields.includes(field)) {
      objectForUpdate[field] = object[field];
    }
  });
  return objectForUpdate;
}

module.exports = filterObjectForUpdate;
