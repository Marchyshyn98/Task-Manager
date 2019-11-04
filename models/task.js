const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');
const tr = require('transliter');
const autopopulate = require('mongoose-autopopulate');

const schema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String
    },
    owner: [
        {
            type: Schema.Types.ObjectId, 
            ref: "User",
            autopopulate: true
        }
    ]   
},
    {
        timestamps: true
    }
);

schema.plugin(
    URLSlugs('title', { // бере заголовок поста
        field: 'url', // створює поле url...також плагін робить url унікальним
        generator: text => tr.slugify(text) // генерує нову url з назви заголовка ...за допомогою транслітератора
    })
);

schema.set("toJSON", {
    virtuals: true
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("Task", schema);