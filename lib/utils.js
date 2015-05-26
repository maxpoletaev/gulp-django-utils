function format(str, vars) {
  if (~str.indexOf('{')) {
    for (var key in vars) {
      if (vars.hasOwnProperty(key)) {
        var re = new RegExp('\{' + key + '\}', 'g');
        str = str.replace(re, vars[key]);
      }
    }
  }
  return str;
}

module.exports = {
  format: format
};
