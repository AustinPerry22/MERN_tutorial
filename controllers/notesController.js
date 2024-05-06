const Note = require("../models/Note")
const User = require("../models/User")

const getAllNotes = async(req, res, next) => {
    try {
        const notes = await Note.find().lean()
        if(!notes?.length){
            return res.status(400).json( {message: 'no notes found'})
        }
    } catch (error) {
        next(error)
    }
}

const createNote = async(req, res, next) =>{
    try {
        const { user, title, text } = req.body
        if (!user || !title || !text){
            return res.status(400).json( {message: 'All fields required'})
        }

        const duplicate = await Note.findOne({ title }).lean().exec()

        if(duplicate){
            return res.status(409).json({message: "duplicate note"})
        }

        const note = await Note.create({user, title, text})
        if (note){
            res.status(201).json({ message: `New note ${title} created`})
        }else{
            res.status(400).json({message: 'Invalid note data'})
        }
    } catch (error) {
        next(error)
    }
}

const updateNote = async(req, res, next) =>{
    try {
        const {id, user, title, text, completed} = req.body
        if(!id||!user||!title||!text || typeof completed !== 'boolean'){
            res.status(400).json({message: 'All fields required'})
        }

        const note = await Note.findById(id).exec()

        if(!note){
            return res.status(400).json({message: 'note not found'})
        }

        const duplicate = await Note.findOne({ title }).lean().exec()

        if (duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate note' })
        }

        note.user = user
        note.title = title
        note.text = text
        note.completed = completed

        const updateNote = await note.save()
        res.json(`${updateNote.title} updated`)
    } catch (error) {
        next(error)
    }
}

const deleteNote = async(req,res,next)=>{
    try {
        const{id} = req.body
        if(!id){
            res.status(400).json({message: 'ID required'})
        }
        const note = await Note.findById(id).exec()
        if(!note){
            res.status(400).json({message: 'No Note'})
        }
        const result = await note.deleteOne()
        const reply = `Note ${result.title} with id ${result._id} deleted`
        res.json(reply)
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}