const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const router = new express.Router();

/** User Model */
const User = require("../Models/User");

/** Auth Middleware */
const auth = require("../Middleware/Auth");

/** Destination for avatars */
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    }
});

/**Endpoint for creating a user using a route pointer*/
router.post("/users", async (req, res) => {
    const user = new User(req.body);
    /** Save user to the database */
    try{
        await user.save();
        // SendWelcomeEmail(user.email, user.name0);

        /** Generate user token on signup */
        const token = await user.GenerateAuthToken();

        res.status(201).send({user, token});
    }catch (e) {
        res.status(400).send(e);
    }
});

/** Endpoint for logging in a user */
router.post("/users/login", async (req, res) => {
    try{
        const user = await User.FindByCredentials(req.body.email, req.body.password);
        const token = await user.GenerateAuthToken();
        res.send({user, token});
    }catch (e) {
        res.status(400).send(e);
    }
});

/** Endpoint for logging out a user */
router.post("/users/logout", auth, async (req, res) => {
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
router.post("/users/logoutall", auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch (e) {
        res.status(500).send();
    }
});

/** Endpoint for uploading files */
router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({width: 250, height: 250})
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res
      .status(400)
      .send({
        error: error.message
      });
});

/** Endpoint for fetching user profile*/
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

/** Endpoint for fetching an avatar */
router.get("/users/:id/avatar", async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) throw new Error();

        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

/** Endpoint for updating a user */
router.patch("/users/me", auth, async (req, res) => {
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
router.delete("/users/me", auth, async(req, res) => {
    try{
        await req.user.remove();
        res.send(req.user);
    }catch (e) {
        res.status(500).send(e);
    }
});

/** Endpoint for deleting an avatar */
router.delete("/users/me/avatar", auth, async (req, res) => {
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;