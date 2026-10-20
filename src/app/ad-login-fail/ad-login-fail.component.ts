import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SingleSignOnService } from '../core/services/single-sign-on.service';

@Component({
  selector: 'app-ad-login-fail',
  templateUrl: './ad-login-fail.component.html',
  styleUrls: ['./ad-login-fail.component.scss']
})
export class AdLoginFailComponent  {

  singlesignon: any;
  constructor(private sso: SingleSignOnService) 
  {
    this.singlesignon = environment['singleSignOn'];
  }

  relogin() {
    const ssoUrl = this.sso.getUrl('adLogout');
    console.log(ssoUrl);
    window.location.href = ssoUrl;
  }

}
