import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../core/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  error = '';
  token = '';
  refreshToken = '';
  decodedToken: any;

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    // redirect to main if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/main']);
    } else {
      if (!this.route.snapshot.queryParams['token']) {
        this.oauthLogin();
      }
    }
  }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/main'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main';

    // 透過 route query parameter 判斷目前是 list 或 folder view
    this.route.queryParams.subscribe((value) => {
      this.token = value['token'];
      this.refreshToken = value['refresh'];
      const jwt = new JwtHelperService();
      this.decodedToken = jwt.decodeToken(this.token);
      // console.log('[login] token: ' + this.token, this.decodedToken);
      if (this.token && this.refreshToken) {
        this.onOauthLoginWithToken(this.token, this.refreshToken);
      }
    });
  }

  // onSubmit() {
  //   this.submitted = true;

  //   // stop here if form is invalid
  //   if (this.loginForm.invalid) {
  //     return;
  //   }

  //   this.isLoading(true);
  //   this.authService.login(this.f['email'].value, this.f['password'].value)
  //     // 為何這邊使用 pipe(first())？
  //     // 1. first() 會取得第一個元素後，直接「complete」該 observable，不需要自己 unsubscribe()。
  //     // 2. first() 與 take(1) 都會取得第一個元素，但差異是：前者若取不到元素，會觸發 error，但後者不會。
  //     // [ref] https://stackoverflow.com/a/42346203/1702774
  //     // 但其實也可以不需要這一行，為什麼？
  //     // 1. angular 的 HttpClient 會自動執行 complete()，所以其實也不需要我們自己 unsubscribe。
  //     // 2. api 如果找不到正確用戶，會回拋錯誤訊息，觸發 error。
  //     .pipe(first())

  //     .subscribe(
  //       data => {
  //         this.router.navigate([this.returnUrl]);
  //       },
  //       error => {
  //         this.error = error;
  //         this.isLoading(false);
  //       });
  // }

  isLoading(loading: boolean) {
    if (loading) {
      this.loading = true;
      this.f['email'].disable();
      this.f['password'].disable();
    } else {
      this.loading = false;
      this.f['email'].enable();
      this.f['password'].enable();
    }
  }

  oauthLogin() {
    const url = environment['oauthMetaUrl'] + '?redirectUrl=' + environment['loginUrl'];
    window.location.href = url;
  }

  onOauthLoginWithToken(token: string, refreshToken: string) {
    this.isLoading(true);
    this.authService.loginWithToken(token, refreshToken);
    setTimeout(() => {
      const isCloudRole = this.authService.currentUserValue?.role?.brand.id === '290ebb3e-ad5d-42e1-8b02-836de25b0807' ? true : false;
      // 非雲市集角色跳轉到home
      if (!isCloudRole) {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main/home';
      }
      this.router.navigate([this.returnUrl]);
    }, 300);
  }
}
