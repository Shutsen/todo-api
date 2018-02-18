const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

Todo.findByIdAndRemove({_id: '5a89149b6b1d5e7d90ee9fa3'}).then((todo) => {
  console.log(todo);
});

Todo.findByIdAndRemove('5a89149b6b1d5e7d90ee9fa3').then((todo) => {
  console.log(todo);
});