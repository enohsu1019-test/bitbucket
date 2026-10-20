import { Injectable } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  idleSecondsCount = 30 * 60;
  timeoutSecoundsCount = 5;

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date;

  constructor(private idle: Idle, private keepalive: Keepalive, private router: Router) {
    idle.setIdle(this.idleSecondsCount);
    idle.setTimeout(this.timeoutSecoundsCount);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
      console.log(this.idleState);
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      // this.childModal.hide();
      this.idleState = 'Timed out!';
      this.timedOut = true;
      console.log(this.idleState);
      this.router.navigate(['/logout']);

    });

    idle.onIdleStart.subscribe(() => {
        this.idleState = 'You\'ve gone idle!';
        console.log(this.idleState);
        // this.childModal.show();
    });

    idle.onTimeoutWarning.subscribe((countdown: number) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!';
      console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    // keepalive.interval(15);

    // keepalive.onPing.subscribe(() => this.lastPing = new Date());
  }

  private reset() {
    this.idle.watch();
    // this.idleState = 'Started.';
    this.timedOut = false;

  }

  start() {
    this.idle.watch();
    this.timedOut = false;
  }

  stop() {
    this.idle.stop();
  }
}
