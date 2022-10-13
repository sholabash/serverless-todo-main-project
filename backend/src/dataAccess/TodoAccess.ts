import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from "aws-sdk/clients/s3";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import * as AWSXRay from 'aws-xray-sdk'
import { TodoImageUpdate } from "../models/TodoImageUpdate";

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = new (AWSXRay.captureAWS(AWS)).DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly s3Client: Types = new (AWSXRay.captureAWS(AWS)).S3({ signatureVersion: 'v4' }),
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET
    ) {}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        console.log("Getting all todo");

        const options = {
            TableName: this.todoTable,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            },
            ScanIndexForward: false
        };

        const result = await this.docClient.query(options).promise();
        console.log(result);
        
        const items = result.Items;
        return items as TodoItem[];
    }


    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Creating new todo");

        const options = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(options).promise();
        console.log(result);

        return todoItem as TodoItem;
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        console.log("Updating todo");

        const options = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #1 = :1, #2 = :2, #3 = :3",
            ExpressionAttributeNames: {
                "#1": "name",
                "#2": "dueDate",
                "#3": "done"
            },
            ExpressionAttributeValues: {
                ":1": todoUpdate['name'],
                ":2": todoUpdate['dueDate'],
                ":3": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(options).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        console.log("Deleting todo");

        const options = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(options).promise();
        console.log(result);
    }

    async createAttachmentPresignedUrl(userId:string, todoId: string): Promise<string> {
        console.log("Generating URL");

        await this.updateImage(userId, todoId);
        
        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: Number(this.urlExpiration),
        });
        console.log(url);

        return url as string;
    }

    private async updateImage(userId:string, todoId:string): Promise<TodoImageUpdate> {
        console.log("Updating todo");

        const options = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #1 = :1",
            ExpressionAttributeNames: {
                "#1": "attachmentUrl",
            },
            ExpressionAttributeValues: {
                ":1": `https://${this.s3BucketName}.s3.amazonaws.com/${todoId}`,
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(options).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoImageUpdate;
    }

}