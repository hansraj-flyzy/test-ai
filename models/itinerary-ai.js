const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aiItinerarySchema = new Schema({
  company_id: {
    type: Schema.Types.ObjectId,
    ref: 'company'
  },
  author_id: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  startDate: Date,
  destinationDurationArray: [
    {
      cityString: String,
      duration: Number,
      city: Object,
    }
  ],
  itinerary_description: String,
  itinerary: [
    {
      title: String,
      activities: [{ type: Schema.Types.Mixed }]
    }
  ],
  created_utc_timestamp: Date
});

const aiItinerary = mongoose.models.aiItinerary || mongoose.model("aiItinerary", aiItinerarySchema);
module.exports = aiItinerary;
