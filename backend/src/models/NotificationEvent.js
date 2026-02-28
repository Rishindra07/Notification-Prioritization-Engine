
const mongoose = require("mongoose");


/**
 * Possible event types for notifications.
 * Should match the enum in Rule.js for consistency.
 */
const EVENT_TYPE_ENUM = [
    "message",
    "reminder",
    "update",
    "alert",
    "promotion",
    "system_event",
    "security_alert"
];

/**
 * NotificationEvent Schema
 * - user_id: User receiving the notification (required)
 * - event_type: Type of event (required, enum)
 * - message: Notification message (required)
 * - source: Source/service of notification (optional)
 * - priority_hint: Optional priority hint (optional)
 * - channel: Notification channel (required)
 * - metadata: Context-specific fields (optional)
 * - dedupe_key: Used for deduplication (optional)
 * - expires_at: Expiry timestamp (optional)
 * - status: NOW/LATER/NEVER (required)
 */
const NotificationEventSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    event_type: {
        type: String,
        enum: EVENT_TYPE_ENUM,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    source: String,
    priority_hint: String,
    channel: {
        type: String,
        required: true
    },
    metadata: Object,
    dedupe_key: String,
    expires_at: Date,
    status: {
        type: String,
        enum: ["NOW", "LATER", "NEVER"],
        required: true
    }
}, {
    timestamps: true
});

const NotificationEvent = mongoose.model("NotificationEvent", NotificationEventSchema);

module.exports = NotificationEvent;
