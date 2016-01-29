module.exports = {
    "fields": {
        "id" : {
          "type": "uuid",
          "default" : { "$db_function": "uuid()" }
        },
        "garage_id" : {
          "type": "varchar",
          "default": null
        },
        "description": {
          "type": "varchar",
          "default": null
        },
        "image_url": {
          "type": "varchar",
          "default": "n/a"
        },
        "category": {
          "type": "varchar",
          "default": null
        },
        "spot": {
          "type": "varchar",
          "default":  null
        },
        "time" : {
          "type": "timestamp",
          "default" : { "$db_function": "dateOf(now())" }
        }
    },
    "key" : ["id"],
    "indexes": ["garage_id"]
}
