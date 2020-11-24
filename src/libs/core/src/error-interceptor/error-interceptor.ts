import { ErrorHandler, EventEmitter } from '@angular/core';
import { environment } from '@apollus/environments';

export const LOG = new EventEmitter();
export const THROW = new EventEmitter();

export class ErrorInterceptor extends ErrorHandler {
  log = new LogInterceptor();

  constructor() {
    super();
  }

  handleError(error): void {
    super.handleError(error);
    THROW.emit(error);
  }
}

export class LogInterceptor {
  constructor() {
    if (environment.production) {
      console._log = console.log;
      console._info = console.info;
      console._warn = console.warn;
      console._error = console.error;

      console.log = function() {
        return console._intercept('log', arguments);
      };
      console.info = function() {
        return console._intercept('info', arguments);
      };
      console.warn = function() {
        return console._intercept('warn', arguments);
      };
      console.error = function() {
        return console._intercept('error', arguments);
      };

      console._intercept = function(type, args) {
        console._collect(type, args);
      };

      console._collect = this.collect;
    }
  }

  collect(type, args) {
    var time = new Date().toISOString();

    if (!type) {
      type = 'log';
    }

    if (!args || args.length === 0) return;
    console['_' + type].apply(console, args);

    var stack = null;
    try {
      throw Error('');
    } catch (error) {
      var stackParts = error.stack.split('\n');
      let stack = [];
      for (var i = 0; i < stackParts.length; i++) {
        if (stackParts[i].toUpperCase() === 'Error'.toUpperCase()) {
          continue;
        }

        stack.push(stackParts[i].trim());
      }
    }

    let parametros: string;
    try {
      parametros = JSON.stringify(args);
    } catch {
      parametros = 'Não foi possível obeter os parametros.';
    }

    LOG.emit({ tipoLog: type, dataLog: time, parametros, stackErro: stack, browser: navigator.userAgent });
  }
}

interface Console {
  assert(value: any, message?: string, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  time(label: string): void;
  timeEnd(label: string): void;
  trace(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  _intercept(type: any, args: any): void;
  _collect(type: any, args: any): void;
  _log(message?: any, ...optionalParams: any[]): void;
  _error(message?: any, ...optionalParams: any[]): void;
  _info(message?: any, ...optionalParams: any[]): void;
  _warn(message?: any, ...optionalParams: any[]): void;
}

declare var console: Console;
