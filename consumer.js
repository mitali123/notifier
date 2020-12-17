const controller = require("./controllers/notifier_controller"); 
const { parse_messages } = require("./controllers/watch");
const app = require("./app");

  exports.getKafkaClient = () => {
    kafka_host = process.env.broker1 + ':9092,' + process.env.broker2 + ':9092,' + process.env.broker3 + ':9092'
    var kafka = require('kafka-node');
    var kafka_client = new kafka.KafkaClient({kafkaHost: kafka_host});
    var offset = new kafka.Offset(kafka_client);
    return offset;
}
function getKakfkaConfig(){
    kafka_host = process.env.broker1 + ':9092,' + process.env.broker2 + ':9092,' + process.env.broker3 + ':9092'
    var kafka = require("kafka-node"),
    Consumer = kafka.Consumer,
    client = new kafka.KafkaClient({kafkaHost: kafka_host}),
    consumer = new Consumer
        (
            client, 
        [{ 
            topic: "weather", 
            partition: 0,
            maxWaitTimeInMs:300000
           
        }], 
        {
             autoCommit: false
        });
    return consumer;
  }


  exports.consumeMessage = () => {
      console.log("in consumer");
    consumer = getKakfkaConfig();
    consumer.on("message", function(message) {
        app.message_counter.inc({topic: 'weather',type: 'consume'})
        console.log("Consumer read message from topic:"+message.topic+", partition number:"+message.partition+", message offset id:"+message.offset);
        const data = JSON.parse(message.value);
        console.log("From here: "+data.watch.watch_id);
        parse_messages(data);
    });
} 
 