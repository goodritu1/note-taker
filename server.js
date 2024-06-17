
const express = require("express");
const app = express();
const path = require('path');
const fs = require("fs");
const util = require("util");
const uuid =require("./helpers/uuid")

const PORT = process.env.PORT || 3000;


const dbPath = path.join(__dirname,'db','db.json');
app.use(express.static("public"));

app.use(express.json()); // parse JSON request bodies



app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});


// api route for notes
app.get('/api/notes', (req, res) => {
    fs.readFile(dbPath, (err, data) => {
        //error handling
        if (err) {
            console.log(err);
            res.status(500).json('Error reading db.json');
        } else {
            //we parse the JSON data and return the notes
            const notes = JSON.parse(data);
            res.json(notes);

        }
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = uuid();
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json('Error reading db.json');
        } else {
            const notes = JSON.parse(data);
            notes.push(newNote);
            fs.writeFile(dbPath, JSON.stringify(notes), (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).json('Error writing to db.json');
                } else {
                    res.json(newNote);
                }
            });
        }
    });
});


app.get('*', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id; // Get the note ID from the URL parameter
    fs.readFile(dbPath, (err, data) => {  //read the db.jason file
      if (err) {  //error handling
        console.log(err);
        res.status(500).json('Error reading db.json');
      } else {
        const notes = JSON.parse(data);   //parse the JSON data from file
        const noteToDelete = notes.find((note) => note.id === id);
        if (!noteToDelete) {
          res.status(404).json('Note not found');
        } else {
          notes.splice(notes.indexOf(noteToDelete), 1);
          fs.writeFile(dbPath, JSON.stringify(notes), (err) => {
            if (err) {
              console.log(err);
              res.status(500).json('Error writing to db.json');
            } else {
              res.status(204).json({ // 204 status stands for no content
                status: 'success',
                data: null
              });
            }
          });
        }
      }
    });
  });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
