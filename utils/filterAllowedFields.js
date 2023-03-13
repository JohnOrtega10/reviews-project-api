const filterAllowedFields = (req, ...allowedFields) => {
  const data = {};
  Object.keys(req).forEach((field) => {
    if (allowedFields.includes(field)) {
      data[field] = req[field];
    }
  });

  return data;
};

module.exports = { filterAllowedFields };
