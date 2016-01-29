# Instructions

Install the project


```bash
$ npm install
```

Start up the code.

```bash
$ gulp serve
```

To get the All event.
```bash
socket.emit('getAllEvents');
socket.on('getAllEvents', function(msgs){
        console.log("Response:",msgs);
        
      });  
```

To get the All event for a garage, it will get called if any new event will added to system.
```bash
var product = {
   garage_id: "WALTHAM-01"
};
socket.emit('getGarageEvent',product, function(err,data){
    console.log("Response :",data);       
});  
```

To get the All event for a garage.
```bash
var event= {
        "garage_id" :"WALTHAM-03",
        "image_url": "http://images.clipartpanda.com/car-clipart-black-and-white-car-images-clip-art-g4f4nawd.png",
        "description": "WRONG-WAY",
        "category": "WARN",
        "spot": "SPOT002"
};
socket.emit('saveEvent',event, function(err,data){
        console.log("Response :",data);       
});  
```