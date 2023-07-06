const mongoose = require('mongoose');

const User = mongoose.model('User');
const Category = mongoose.model('Category');

const dashBoard = (req, res) => {
  res.render('admin/adminHome');
};

const allCustomers = async (req, res) => {
  if (req.query.search) {
    const { search } = req.query;
    await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).then((result) => {
      res.render('admin/customers', {
        userList: result,
      });
    });
  } else {
    await User.find({ isAdmin: false }).then((result) => {
      res.render('admin/customers', {
        userList: result,
      });
    });
  }
};

const changeAccess = async (req, res) => {
  const access = req.body.access === 'true';
  const { id } = req.query;
  await User.findByIdAndUpdate(id, { $set: { access } });
  res.redirect('/admin/customers');
};

const displayCategory = async (req, res) => {
  await Category.find({}).then((result) => {
    res.render('admin/category', { result });
    console.log(result);
  });
};

const viewAddCategory = (req, res) => {
  res.render('admin/addCategory');
};

const addCategory = async (req, res) => {
  const { name } = req.body;
  const newCategory = new Category({
    category_name: name,
  });
  await newCategory.save();
  res.redirect('/admin/Category');
};

const displayProducts = (req, res) => {
  res.render('admin/products');
};

const addProducts = (req, res) => {
  res.render('admin/addProducts');
};

const editProducts = (req, res) => {
  res.render('admin/editProducts');
};

module.exports = {
  dashBoard,
  allCustomers,
  changeAccess,
  displayCategory,
  viewAddCategory,
  displayProducts,
  addProducts,
  editProducts,
  addCategory,
};
