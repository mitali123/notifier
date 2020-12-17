var kafka = require('kafka-node');
const models = require('../models');
var jsonStr;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var userId;
var res_json;
var watch_json;
const kafka_topic = 'watch';
var forEach = require('async-foreach').forEach;


var parse_messages = function(req, res, next) {
        console.log("API call to notifier");

    let zipcode = req.watch.zipcode;
    let alert = req.watch.alert;
    let temp = req.weather.temp;
    let feels_like = req.weather.feels_like;
    let temp_min= req.weather.temp_min;
    //console.log(zipcode + "\n" + temp + "\n" + feels_like + "\n" + temp_min );
    //store watch details in db
    models.Watch.create({
      watch_id: req.watch.watch_id,
      user_id: req.watch.user_id,
      zipcode: req.watch.zipcode,
    })
    .then( res => {
        models.Alert.create({
          watch_id: res.watch_id,
          field_type: alert.field_type,
          operator: alert.operator,
          value: alert.value
        })
        .catch(err => {console.error(err)});
    })
    .catch(err=>{ console.error(err)});
 
    // let alert_json = (JSON.parse(JSON.stringify(alerts)));
    // for(var i=0;i<alert_json.length;i++)
    // {

    //     var alert = alert_json[i];
        //for each alert find fieldtype
        var field_type = alert.field_type;
        //scan weather and find that field_type value
        var field_type_val = req.weather[field_type];
        //get operator from alert
        var opr = alert.operator;
        //compare
        if( opr == 'gt')
        {
          if(field_type_val > alert.value)
          {
            console.log("send alert");
            send_alert(req.watch.user_id,alert.alert_id,field_type,opr,alert.value);
          } 
        }
        else if( opr == 'lt')
        {
          if(field_type_val < alert.value)
          {
            console.log("send alert");
            send_alert(req.watch.user_id,alert.alert_id,field_type,opr,alert.value);
          } 
        }
        else if( opr == 'ge')
        {
          if(field_type_val >= alert.value)
          {
            console.log("send alert");
            send_alert(req.watch.user_id,alert.alert_id,field_type,opr,alert.value);
          }
        }
        else if( opr == 'le')
        {
          if(field_type_val <= alert.value)
          {
            console.log("send alert");
            send_alert(req.watch.user_id,alert.alert_id,field_type,opr,alert.value);
          }
        }
        else if( opr == 'ne')
        {
          if(field_type_val != alert.value)
          {
            console.log("send alert");
            send_alert(req.watch.user_id,alert.alert_id,field_type,opr,alert.value);
          }
        }
        else if( opr == 'eq')
        {
          if(field_type_val == alert.value)
          {
            console.log("send alert");
            send_alert(req.watch.user_id,alert.alert_id,field_type,opr,alert.value);
          }
        }
}

var send_alert = function(userId,alertId,fieldType,opr,val) {
      //check db if alert already sent
      console.log("API call to send_Alert");
      //check for duplicate
      models.AlertStatus.findOne({ where: { 
                                      alert_id: alertId, 
                                      user_id: userId, 
                                      status: "ALERT_SEND", 
                                      field_type: fieldType, 
                                      operator: opr, 
                                      value: val
                                      }})
      .then(res => {
        if(res != null)
        {
              //check 1hr interval
              var createdAt = res.createdAt;
              if((createdAt + (60 * 60 * 1000) > new Date(Date.now())))
              {
                  //send alert 
                  models.AlertStatus.create({ alert_id: alertId, status:'ALERT_SEND', user_id: userId, field_type: fieldType, operator: opr, value: val});
              }
              else
              {
                  //set duplicate
                  models.AlertStatus.create({ alert_id: alertId, status:'ALERT_IGNORED_DUPLICATE', user_id: userId, field_type: fieldType, operator: opr, value: val});
              }
        }
        else 
        {
          models.AlertStatus.findOne({ where: { user_id: userId, status:'ALERT_SEND'}})
          .then(result => {
              if(result == null)
              {
                //1st alert for the user in anytime
                models.AlertStatus.create({ alert_id: alertId, status:'ALERT_SEND', user_id: userId, field_type: fieldType, operator: opr, value: val});
              }
              else 
              {
                      //calculate time interval 
                      var createdAt = result.createdAt;
                      if((createdAt + (60 * 60 * 1000) >  new Date(Date.now())))
                      {
                          //send alert
                          models.AlertStatus.create({ alert_id: alertId, status:'ALERT_SEND', user_id: userId, field_type: fieldType, operator: opr, value: val});
                      }
                      else
                      {
                          //set duplicate
                          models.AlertStatus.create({ alert_id: alertId, status:'ALERT_IGNORED_THRESHOLD_REACHED', user_id: userId, field_type: fieldType, operator: opr, value: val});
                      }
                  }
              })
              .catch(err=>{console.error(err)});
        }  
      })
      .catch(err => {console.error(err)});
      
}
exports.parse_messages = parse_messages;
exports.send_alert = this.send_alert;






