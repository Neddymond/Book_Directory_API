const express = require("express");
const router = new express.Router();

/** User Model */
const User = require("../models/User");

/** Auth Middleware */
const auth = require("../Middleware/auth");

/**Endpoint for creating a user using a route pointer*/
router.post("/user", async (req, res) => {
    const user = new User(req.body);
    /** Save user to the database */
    try{
        await user.save();

        /** Generate user token on signup */
        const token = await user.GenerateAuthToken();

        res.status(201).send({user, token});
    }catch (e) {
        res.status(400).send(e);
    }
});

/** Endpoint for logging in a user */
router.post("/user/login", async (req, res) => {
    try{
        const user = await User.FindByCredentials(req.body.email, req.body.password);
        const token = await user.GenerateAuthToken();
        res.send({user, token});
    }catch (e) {
        res.status(400).send(e);
    }
});

/** Endpoint for logging out a user */
router.post("/user/logout", auth, async (req, res) => {
    try{
        req.user.tokens = req.user
          .tokens
          .filter((token) => {
            return token.token !== req.token
          });

        await req.user.save();
        res.send();
    }catch (e) {
        res.status(500).send();
    }
});

/** Endpoint for logging out all sessions of a particular user */
router.post("/user/logoutAll", auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch (e) {
        res.status(500).send();
    }
});

/** Endpoint for fetching user profile*/
router.get("/user/profile", auth, async (req, res) => {
    res.send(req.user);
});

/** Endpoint for updating a user */
router.put("/user/profile", auth, async (req, res) => {
    /** Get the property names of the request body as an array */
    const reqBody = Object.keys(req.body);

    /** List of things allowed to be updated */
    const allowedUpdates = ["name", "email", "age", "password"];

    /** Check if each of the "reqBody" is among the things allowed to be updated*/
    const isAllowedUpdates = reqBody.every((body) => allowedUpdates.includes(body));

    /** If the above test failed, return a 404 error */
    if(!isAllowedUpdates){
        return res.status(400).send({Error: "Invalid update"});
    }
    
    try{
        /** Fetch and update a document */
        const user = req.user;
        reqBody.forEach((body) => user[body] = req.body[body]);
        await user.save();
        res.send(user);
    }catch (e) {
        res.status(500).send(e);
    }
});

/** Endpoint for deleting a user */
router.delete("/user/profile", auth, async(req, res) => {
    try{
        await req.user.remove();
        res.send(req.user);
    }catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;