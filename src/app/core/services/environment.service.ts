import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class EnvironmentService {
  init() {
    return fetch('assets/config-map.json')
    .then(res => res.json())
    .then(config => {
      environment.setEnvironment(config);
      return fetch(`${window.location.origin}/env`);
    })
    .then(res => res.json())
    .then(env => {
      environment.setEnvironment(env);
    })
    .catch(reason => {
      console.warn(reason);
    })
    .finally(() => {
      environment.override();
    });;
  }
}
