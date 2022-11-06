import {Injectable} from '@angular/core';
import {HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Todo} from './todo';

@Injectable()
export class TodoDataService {

  apiUrl = '/api/todo';
  // Placeholder for last id so we can simulate
  // automatic incrementing of ids
  lastId = 0;

  // Placeholder for todos
  todos: Todo[] = [];

  constructor(private http: HttpClient) {
  }

  // Simulate POST /api/todo
  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post(this.apiUrl, todo).pipe(
      map(response => new Todo(response) )
    );
  }

  // Simulate DELETE /api/todo/:id
  deleteTodoById(id: number): Observable<null> {
    return this.http.delete<null>(this.apiUrl + '/' + id);
  }

  // Simulate PUT /api/todo/:id
  updateTodoById(id: number, todo: Todo): Observable<Todo> {
    return this.http.put(this.apiUrl + '/' + id, todo).pipe(
      map(response => new Todo(response))
    );
  }

  public getAllTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  // Simulate GET /todos/:id
  getTodoById(id: number): Observable<Todo> {
    return this.http.get(this.apiUrl + '/' + id).pipe(
      map(response => new Todo(response) )
    );
  }

  // Toggle todo complete
  toggleTodoComplete(todo: Todo): Observable<Todo> {
    return this.http.get(this.apiUrl + '/' + todo.id).pipe(
      map(response => new Todo(response) )
    );
  }

}