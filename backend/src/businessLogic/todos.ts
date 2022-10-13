import * as uuid from 'uuid'
import { TodoAccess } from "../dataAccess/TodoAccess";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';


const todoAccess = new TodoAccess();

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId);
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()
    const s3BucketName = process.env.S3_BUCKET_NAME;


    return todoAccess.createTodo({
        userId,
        todoId, 
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest
    });
}

export function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
    return todoAccess.updateTodo(userId, todoId, updateTodoRequest);
}

export function deleteTodo(userId: string, todoId: string): Promise<void> {
    return todoAccess.deleteTodo(userId, todoId);
}

export function createAttachmentPresignedUrl(userId:string, todoId: string): Promise<string> {
    return todoAccess.createAttachmentPresignedUrl(userId, todoId);
}