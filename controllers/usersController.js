const User = require('../models/User')
const Note = require('../models/Note')
// const asyncHandler = require ('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res, next) =>{
    try {
        const users = await User.find().select('-password').lean()
        if(!users?.length){
            return res.status(400).json( {message: 'no users found'})
        }
        res.json(users)
    } catch (error) {
        next(error)
    }
}

// @desc create user
// @route POST /users
// @access Private
const createUser = async (req, res, next) =>{
    try {
        const { username, password, roles } = req.body

        if(!username || !password || !Array.isArray(roles) || !roles.length){
            return res.status(400).json({message: 'All fields required'})
        }
        const duplicate = await User.findOne({ username }).lean().exec()

        if(duplicate){
            return res.status(409).json({message: "duplicate username"})
        }

        const hashedPwd = await bcrypt.hash(password, 10)

        const userObject = { username, "password": hashedPwd, roles}

        const user = await User.create(userObject)

        if (user){
            res.status(201).json({ message: `New user ${username} created`})
        }else{
            res.status(400).json({message: 'Invalid user data received'})
        }
    } catch (error) {
        next(error)
    }
    
}

// @desc update a user
// @route Patch /users
// @access Private
const updateUser = async (req, res, next) =>{
    try {
        const {id, username, roles, active, password} = req.body

        if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active != 'boolean'){
            return res.status(400).json({message: 'all fields are required'})
        }

        const user = await User.findById(id).exec()

        if(!user){
            return res.status(400).json({message: 'user not found'})
        }

        const duplicate = await User.findOne({ username }).lean().exec()

        if (duplicate && duplicate?._id.toString() !== id){
            return res.status(409).json({message: 'Duplicate Username'})
        }
        user.username = username
        user.roles = roles
        user.active = active

        if(password) {
            // hash password
            user.password = await bcrypt.hash(password,10)
        }

        const updatedUser = await user.save()

        res.json({message: `${updatedUser.username} updated`})
    } catch (error) {
        next(error)
    }
    
}

// @desc delete a user
// @route Delete /users
// @access Private
const deleteUser = async (req, res, next) =>{
    try {
        const { id } = req.body
        if (!id){
            return res.status(400).json({message:"User id required"})
        }

        const notes = await Note.findOne({ user: id}).lean().exec()
        if(notes){
            return res.status(400).json({ message: 'User has assigned notes'})
        }

        const user = await User.findById(id).exec()

        if(!user){
            return res.status(400).json({message : 'user not found'})
        }

        const result = await user.deleteOne()

        const reply = `Username ${result.username} with ID ${result._id} deleted`
        res.json(reply)
    } catch (error) {
        next(error)
    }
    
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}