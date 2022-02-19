if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}




const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const methodOverride = require("method-override")
const multer = require('multer')
const { storage, cloudinary } = require('./cloudinary');
const upload = multer({ storage })
const Joi = require('joi');

const MongoStore = require("connect-mongo")


const User = require("./model/UserModel");
const Pho = require("./model/Pho36Model");



const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/pho36';
async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(console.log("CONNECTION SUCCESS"))
    .catch(err => console.log(err))



app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


app.use(express.static(path.join(__dirname, "public")))


const secret = process.env.SECRET || "secret";


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfte: 24 * 3600,
    crypto: {
        secret
    }
})

store.on("error", function (e) {
    console.log(e)
})



const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})



const catchAsync = function (func) {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/admin')
    }
    next();
}

const phoSchema = Joi.object({
    admin: Joi.object({
        description: Joi.string().required(),
        open: Joi.string().required(),
        contact: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

const validatePho = (req, res, next) => {
    const { error } = phoSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new Error(msg, 400)
    } else {
        next();
    }
}



app.get("/", catchAsync(async (req, res) => {
    const pho = await Pho.findOne({});
    res.render("home", { pho })
}))

app.get("/admin", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/admin/change')
    } else {
        res.render("admin")
    }
})
app.get("/admin/change", isLoggedIn, catchAsync(async (req, res) => {
    const pho = await Pho.findOne({});
    res.render("change", { pho })
}))
app.post("/admin/change/:id", upload.array("image"), validatePho, catchAsync(async (req, res) => {
    const pho = await Pho.findByIdAndUpdate(req.params.id, req.body.admin);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    pho.images.push(...imgs)
    await pho.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await pho.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    res.redirect("/")
}));


// app.get("/register", catchAsync(async (req, res) => {
//     const username = 'pho36admin';
//     const password = 'phh0709';
//     const user = new User({ username });
//     await User.register(user, password)
//     res.redirect("/")
// }))
// app.get("/seed", isLoggedIn, async (req, res) => {
//     const description = "Founded in 19**, we have more than 20 years of experience about Vietnamese best cuisine - Pho. Our food is always fresh everyday from the red juicy rare steak to the green fresh basil.We have the most special broth that cook with beef bone for hours when we first start open the restaurant, and always keeping it hot and tasty throughout the day.Our chefs and services always make sure that customers will have the best experience eating at our restaurant.It will always be our pleasure to serve you."
//     const open = "All weeks (except Tuesday) from 10a.m - 8p.m"
//     const contact = "875-182-6838"
//     const pho = new Pho({ description, open, contact });
//     await pho.save();
//     res.redirect("/");
// })

app.post("/admin", passport.authenticate("local", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/admin/change")
})

app.all("*", (req, res, next) => {
    next(new Error('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oops, something went wrong"
    res.status(statusCode).render("error", { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
})