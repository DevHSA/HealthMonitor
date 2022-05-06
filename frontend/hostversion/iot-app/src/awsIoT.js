import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

console.log("Here")
console.log(AWS.config)

export const fetchData = (tableName) => {
    var params = {
        TableName: tableName
    }

    docClient.scan(params, function (err, data) {

        console.log("AM I LOGGING")
        console.log(params)
        
        console.log(err)
        if (!err) {
            console.log("AM I INSIDE")
            console.log(data)
        }
    })
}