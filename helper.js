const validationChecker = (flashes, path) => {
  if (!flashes.errorObject) {
    console.log('1');
    return false;
  }
  const message = flashes.errorObject.find((err) => err.path === path);
  console.log(message);
  if (!message) {
    return false;
  }
  console.log('3');
  return message.msg;
};

module.exports = {
  validationChecker,
};
