const sls = require("serverless-http");
const app = require("./app");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
var kms = new AWS.KMS();
const log = require("lambda-log");
const taskModel = require("./models/task");
const notificationModel = require('./models/user-notification');
const moment = require("moment");
const userModel = require("./models/user");
const preRegistrationModel = require("./models/preregistration");

// Cache
let handler;
let cachedDb = null;
async function connectToDatabase() {
  log.info("=> connect to database");
  if (cachedDb) {
    log.info("=> using cached database instance");
    return Promise.resolve(cachedDb);
  }
  try {
    log.info("=> using new instance");
    let db;
    if (process.env.NODE_ENV.toLowerCase().includes("dev")) {
      mongoose.set("strictQuery", false);
      db = await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME,
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
    } else {
      mongoose.set("strictQuery", false);
      db = await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME,
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
    }
    dbTest = db;
    cachedDb = db.connections[0].readyState;
    return cachedDb;
  } catch (err) {
    log.error(`Unable to connect to MongoDb - ${err}`);
    throw err;
  }
}

mongoose.connection.on("error", (err) => {
  log.error(`ErrorLog::Connection error with mongo ${err}`);
  throw err;
});

module.exports.run = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectToDatabase();
  handler = sls(app);
  const result = await handler(event, context);
  return result;
};


module.exports.TaskNotifications = async (event) => {
  try {
    await connectToDatabase();

    ///
    // add fake pre-registrations
    let now = new Date()
    // let fakeRegs = Math.floor(now.getHours() % 12) % 6 / 2;
    let fakeRegs = 9 + (Math.random() * 1000) % 6;
    let entry;
    for (i = 0; i < fakeRegs; i++) {
      entry = new preRegistrationModel({ email: "fakeemail@gmail.com" })
      await entry.save();
    }
    ///


    let nowDate = moment(new Date()).utc();
    let afterTenMinutes = moment(new Date()).add({ minutes: 10 }).utc();
    log.info(`Timings of pushing notification for task`, { "from": nowDate, "to": afterTenMinutes });
    let tasks = await taskModel.find({ due_date: { $gte: new Date(nowDate), $lte: new Date(afterTenMinutes) } });
    if (tasks && tasks.length > 0) {
      log.info(`Task Scheduled added notification to ${tasks.length}`);
      for (let task of tasks) {
        let user = await userModel.findOne({ 'user_info.email': task.assignee.email, disabled: false })
        if (user) {
          let receiver = user._id;
          const notificationDoc = await notificationModel({
            notificationMessage: `${user.user_info.display_name} has scheduled task for you on `,
            receiver: receiver,
            task_id: task._id,
          });
          await notificationDoc.save();
        }
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Notifications removed successfully",
          input: event
        },
      )
    };
  } catch (err) {
    log.error(err, "Error Occured");
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: "Error Occured While deleting notifications",
          input: event
        },
      )
    };
  }
};