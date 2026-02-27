const mongoose = require("mongoose");

const NotificationEventSchema = new mongoose.Schema({
    user_id : String,
    event_type : String,
    message : String,
    source : String,
    priority_hint : String,
    channel : String,
    metadata : Object,
    dedupe_key : String,
    expires_at : Date,
    status : {
        type : String,
        enum : ["NOW","LATER","NEVER"],
    }
},{
    timestamps : true
});

const NotificationEvent = new mongoose.model("NotificationEvent",NotificationEventSchema);

module.exports = NotificationEvent;
