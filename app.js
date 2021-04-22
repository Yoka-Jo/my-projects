const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-yousef:test123@cluster0.esv7l.mongodb.net/todolistDB?retryWrites=true&w=majority" , {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item" , itemsSchema);

const firstItem = new Item({
  name: "First Item"
});

const secondItem = new Item({
  name: "Second Item"
});

const thirdItem = new Item({
  name: "Third Item"
});

const defaultItems = [firstItem ,secondItem , thirdItem];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/", function(req, res) {
Item.find({} , function(err , foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Inserted SuccessFully");
      }
    });
   res.redirect("/");
  }
  else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem; //TodoContent
  const listName = req.body.list; //TodoTitle

  const item = new Item({name: itemName});
  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete" , function(req , res){
  const checkedItemId =req.body.checkBox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(!err){
        console.log("Deleted Successfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName} , {$pull:{items:{_id:checkedItemId}}} , function(err , foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:newTodo" , function(req , res){
  const todoTitle = _.capitalize(req.params.newTodo);
  List.findOne({name: todoTitle} , function(err , foundList){
    if(!err){
      if(!foundList){
        const list = new List({name:todoTitle ,  items: defaultItems});
        list.save();
        res.redirect("/"+todoTitle);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started on port 3000");
});
