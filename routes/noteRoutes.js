const express = require('express')
const router = express.Router()
const usersController = require('../controllers/notesController')

router.route('/')
    .get(usersController.getAllNotes)
    .post(usersController.createNote)
    .patch(usersController.updateNote)
    .delete(usersController.deleteNote)

module.exports = router