const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");








const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const MONGO_URL = "mongodb+srv://stuffynaan:stuffyji@stuffy.vuhd2se.mongodb.net/todolistDB";

mongoose.connect(MONGO_URL);
const itemSchema = new mongoose.Schema({
  name:String
})

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name:"Invite to the todo list"
})

const item2 = new Item({
  name:"use + button to add item to todoList"
})
const item3 = new Item({
  name:"<---Hit this button to delete item"
})
    const defaultItems = [item1, item2, item3];

// Item.deleteMany({name:"Invite to the todo list"})


 async function addItem() {
  try {
   await Item.insertMany(defaultItems);

    console.log("Items added successfully");
  }
  catch (err) {
    console.log("Error detected :",err);
    
  }
  finally {
    // mongoose.connection.close();
  }
 
}


app.get("/", function (req, res) {
  Item.find({}).then(function (foundItem) {
    if (foundItem.length === 0) {
     
addItem();
      res.redirect("/")
    }
    else {
      res.render("list", {
        listTitle: "Today",
        listItems: foundItem
      });
    }
    
})
  
});

const listSchema = {
  name: String,
  item:[itemSchema]
}
const List = mongoose.model("List", listSchema);

app.get("/:customList", function (req, res) {
  const customListName =_.capitalize(req.params.customList);
  List.findOne({ name: customListName }).then(function (foundList) {
    if (!foundList) {
    const list = new List({
    name: customListName,
    item: defaultItems
  })
      list.save();
      res.redirect("/" + customListName);
    }
    else {
      res.render("list", {
        listTitle: foundList.name,
        listItems: foundList.item
      })
    }
 })
  

});

app.post("/", function(req, res){
  const itemName = req.body.newTodo;
  const listName = req.body.listSubmit;
  
  const newItem = new Item({
    name: itemName
  });
  if (listName === "Today") {
      newItem.save();
  res.redirect("/");
  }
  else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.item.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});


app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  // console.log(checkItemId);
  if (listName === "Today") {
     async function deleteItems() {
  try {
  await Item.findByIdAndRemove(checkItemId);

    console.log("Item deleted successfully");
  }
  catch (err) {
    console.log("Error detected :",err);
    
  }
  finally {
    // mongoose.connection.close();
      
  }
 
  }
  
  deleteItems();
res.redirect("/");
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: checkItemId } } }).then(function (foundList) {
      res.redirect("/" + listName);
    })
  }
  
 
});

app.listen(3000, function() {
  console.log("Server running on port 3000.");
});
// mongoose.connection.close();
