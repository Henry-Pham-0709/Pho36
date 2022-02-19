const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
})

const opts = { toJSON: { virtuals: true } }

const PhoSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    open: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    images: [ImageSchema]
}, opts)



module.exports = mongoose.model("Pho", PhoSchema)