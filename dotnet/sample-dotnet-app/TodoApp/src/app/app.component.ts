import { Component, OnInit } from '@angular/core';
import {Todo} from './todo';
import {TodoDataService} from './todo-data.service';

import { OAuthService } from 'angular-oauth2-oidc';

import { JwksValidationHandler } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

import { RbacService } from './rbac.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'TodoApp';
  todos: Todo[] = [];

  newTodo = new Todo;

  constructor(private todoDataService: TodoDataService, private rbac: RbacService, private oauthService: OAuthService) {
    this.configureOpenIDConnect();
  }

  public ngOnInit() {
    this.todoDataService
      .getAllTodos()
      .subscribe(
        (todos) => {
          this.todos = todos;
        }
      );
  }

  onAddTodo(todo) {
    this.todoDataService
      .addTodo(this.newTodo)
      .subscribe(
        (newTodo) => {
          this.todos = this.todos.concat(newTodo);
        }
      );
  }

  onToggleTodoComplete(todo) {
    this.todoDataService
      .toggleTodoComplete(todo)
      .subscribe(
        (updatedTodo) => {
          todo = updatedTodo;
          todo.isComplete = ! todo.isComplete;
          this.todoDataService.updateTodoById(todo.id, todo).subscribe();
        }
      );
  }

  onRemoveTodo(todo) {
    this.todoDataService
      .deleteTodoById(todo.id)
      .subscribe(
        (_) => {
          this.todos = this.todos.filter((t) => t.id !== todo.id);
        }
      );
  }

/*
  addTodo() {
    this.todoDataService.addTodo(this.newTodo);
  }
  */

  /*
  removeTodo(todo) {
    this.todoDataService.deleteTodoById(todo.id);
  }
  */

/*
  get todos() {
    return this.todoDataService.getAllTodos();
  }
  */

  /*
  toggleTodoComplete(todo) {
    this.todoDataService.toggleTodoComplete(todo);
  }
  */

  public get role() {
    if (!this.rbac.rbac) {
       return null;
    }
    return this.rbac.rbac.roles['app-1'];
  }
  public get first() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.first_name;
  }
  public get last() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.last_name;
  }
  public get email() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.email;
  }
  public get provider() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.provider;
  }

  public login() {
    this.oauthService.initImplicitFlow();
  }

  public logout() {
    this.rbac.logout();
    this.oauthService.logOut();
  }

  private configureOpenIDConnect() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin({
      onTokenReceived: context => {
        this.rbac.getRbac(context.idToken).subscribe(
          v => {
            this.rbac.rbac = v;
          }
        );
      }
    });
  }

}
