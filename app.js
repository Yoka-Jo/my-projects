require("dotenv").config();

//express is a package for nodejs which helps us to reduce the amount of the boilerplate code and make the production easier.
const express = require("express");
//mongodb is the database language i use , and mongoose is like express 
// helps us to reduce the amount of the boilerplate code and make the production easier.
const mongoose = require("mongoose");
//lodash is a package for manipulating the data as we want like i do in this app,
//when the user enter the name of the newList (e.g todo) this package changes the first char to be Todo
const _ = require("lodash");


//here i take an instance of express to use.
const app = express();

//this is used to use the new data that we don't know what it is to use in html code.
app.set('view engine', 'ejs');

//this is used to parse the data.
app.use(express.urlencoded({ extended: true }));
//here we till express to use the files inside public like css to use in every request
app.use(express.static("public"));

//h
mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.esv7l.mongodb.net/todolistDB?retryWrites=true&w=majority`, { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {

      res.render("list", { listTitle: "Today", newListItems: [] });
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });

    }
    });


  });

  app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
      if (!err) {
        if (!foundList) {
          //Create a new list
          const list = new List({
            name: customListName,
            items: []
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show an existing list

          res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
      }
    });



  });

  app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  });

  app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    console.log(listName);

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    }


  });

  app.get("/about", function (req, res) {
    res.render("about");
  });

  let port = process.env.PORT;
if (port == null || port == "") {
  port = 80;
}

  app.listen(port, function () {
    console.log("Server started on port 80");
  });
