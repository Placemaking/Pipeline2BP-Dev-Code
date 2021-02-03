const express = require('express')
const router = express.Router()
const Map = require('../models/stationary_maps.js')
const Project = require('../models/projects.js')
const Team = require('../models/teams.js')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const { models } = require('mongoose')

router.post('', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    project = await Project.findById(req.body.project)

    if(await Team.isAdmin(project.team,user._id)){
    
        let newMap = new Map({
            owner: req.body.owner,
            claimed: req.body.claimed,
            area: req.body.area,
            project: req.body.project,
            start_time: req.body.start_time,
            end_time: req.body.end_time

        })

        const map = await Map.addMap(newMap)

        await Project.addActivity(req.body.project,map._id,'stationary')

        res.status(201).json(map)

    }
    else{
        res.json({msg:'unauthorized'})
    }   
})

router.get('/:id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    res.json(await Map.findById(req.params.id))
})

router.put('/:id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    map = await Map.findById(req.params.id)
    
    let newMap = new Map({
        owner: (req.body.owner ? req.body.owner : map.owner),
        claimed: (req.body.claimed ? req.body.claimed : map.claimed),
        start_time: (req.body.start_time ? req.body.start_time : map.start_time),
        end_time: (req.body.end_time ? req.body.end_time : map.end_time),
        area: (req.body.area ? req.body.area : map.area)
    })

    project = await Project.findById(map.project)

    if (await Team.isAdmin(project.team,user._id)){
        res.status(201).json(await Map.updateMap(req.params.id,newMap))
    }

    else{
        res.json({
            msg: 'unauthorized'
        })
    }
    
})

router.delete('/:id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    map = await Map.findById(req.params.id)
    project = await Project.findById(map.project)
    if(await Team.isAdmin(project.team,user._id)){
        res.json(await Project.removeActivity(map.project,map._id))
        await Map.deleteMap(map._id)
    }
    else{
        res.json({
            msg: 'unauthorized'
        })
    }

})

router.post('/:id/data', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    map = await Map.findById(req.params.id)
    if(map.owner.toString() == user._id.toString()){
        if(req.body.entries){
            for(var i = 0; i < req.body.entries.length; i++){
                await Map.addEntry(map._id,req.body.entries[i])
            }
            res.status(201).json(await Project.findById(req.params.id))
        }
        else{
            res.json(await Map.addEntry(map._id,req.body))
       }
    }
    else{
        res.json({
            msg: 'unauthorized'
        })
    }
})

router.put('/:id/data/:data_id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user   
    map = await Map.findById(req.params.id)

    oldData = await Map.findData(map._id, req.params.data_id)

    const newData = {
        _id: oldData._id,
        location: (req.body.location ? req.body.location : oldData.location),
        age: (req.body.age ? req.body.age : oldData.age),
        posture: (req.body.posture ? req.body.posture : oldData.posture),
        activity: (req.body.activity ? req.body.activity : oldData.activity),
        time: (req.body.time ? req.body.time : oldData.time)
    }

    if (map.owner.toString() == user._id.toString()){
        res.status(201).json(await Map.updateData(map._id,oldData._id,newData))
    }  
    else{
        res.json({
            msg: 'unauthorized'
        })
    }  
})

router.delete('/:id/data/:data_id',passport.authenticate('jwt',{session:false}), async (req, res, next) => { 
    user = await req.user
    map = await Map.findById(req.params.id)
    if(map.owner.toString() == user._id.toString()){
        res.json(await Map.deleteEntry(map._id,req.params.data_id))
    }
    else{
        res.json({
            msg: 'unauthorized'
        })
    }
})

module.exports = router