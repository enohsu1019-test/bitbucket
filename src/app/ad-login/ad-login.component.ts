import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-ad-login',
  templateUrl: './ad-login.component.html',
  styleUrls: ['./ad-login.component.scss']
})
export class AdLoginComponent {

  code: string | null = null;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router) { }

}
