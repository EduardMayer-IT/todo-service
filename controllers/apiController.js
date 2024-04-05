var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
var TodoModel = require('../models/todoModel');

module.exports = function (app, cache) {

    // Diese Zeile stellt die API ein, dass die Requests(Anfragen) und Responses(Antworten) das JSON-Format verwenden
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Diese GET-Methode gibt uns alle ToDos aus dem NodeCache zurück
    app.get('/api/todo/all', function (req, res) {

        try {
            var ids = cache.keys();
            var todos = cache.mget(ids);

            res.status(200).send(todos);
        } catch (error ){
            res.status(400).send(error);
        }
    });

    // Erstellung eines Todos und Speichern im NodeCache
    app.post('/api/todo', function (req, res) {

        try {
            var id = uuidv4();
            var description = req.body.description;
            var completed = req.body.completed;

            var todo = new TodoModel(id, description, completed);

            cache.set(id, todo);

            res.status(201).send(todo);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    // Abholung eines ToDos durch seine Id
    app.get('/api/todo', function (req, res) {

        try {
            var id = req.query.id;
            var todo = cache.get(id);

            if (!todo)
            {
                res.status(400).send({"error": "Das Todo konnte nicht gefunden werden."});
                return;
            }

            res.status(200).send(todo);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    // Aktualisierung eines ToDos
    app.put('/api/todo/:id', function (req, res) {

        try {
            var id = req.params.id;
            var todo = cache.take(id);

            if (!todo)
            {
                res.status(400).send({"error": "Das Todo konnte nicht gefunden werden."});
                return;
            }

            todo.description = req.body.description;
            todo.completed = req.body.completed;

            cache.set(id, todo);

            res.status(200).send(todo);
        } catch (error) {
            console.log(error)
            res.status(400).send(error);
        }
    });

    // Löschung eines ToDos
    app.delete('/api/todo/:id', function (req, res) {

        try {
            var id = req.params.id;
            cache.del(id);
            
            res.status(204).send();
        } catch (error) {
            res.status(400).send(error);
        }
    });
};