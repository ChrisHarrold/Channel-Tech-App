
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html', { title: 'IBM Analytics ESA Recruitment Tracking Application' });
};