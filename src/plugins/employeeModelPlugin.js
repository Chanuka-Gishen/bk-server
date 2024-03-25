export const excludeEmployeeFieldsPlugin = (schema) => {
  schema.options.toJSON = {
    transform: function (doc, ret) {
      // Exclude 'userPassword' and 'userToken' fields from the JSON output
      delete ret.empPassword;
      delete ret.empToken;
    },
  };
};
