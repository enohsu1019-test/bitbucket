import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MetaService } from '../core/services/meta.service';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading: Boolean = false;
  saveLoading = false;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private alert: AlertService,
    private metaService: MetaService,
  ) {
    this.registerForm = this.fb.group({
      company: ['', Validators.required],
      department: ['', Validators.required],
      job: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: ['', Validators.required],
      ext: [''],
      mobilePhone: ['', Validators.required],
    });
  }

  ngOnInit() {
    console.log('register');
  }

  cancel() {
    this.location.back();
  }

  save() {
    this.saveLoading = true;
    if (this.registerForm.valid) {
      this.isLoading = true;
      const data = {
        company: this.registerForm.value.company,
        department: this.registerForm.value.department,
        job: this.registerForm.value.job,
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        mobilePhone: this.registerForm.value.mobilePhone,
        telephone: {
          number: this.registerForm.value.phone,
          ext: this.registerForm.value.ext,
        },
      };
      this.metaService.register(data).subscribe(
        (res: any) => {
          if (res.info && res.info.success) {
            this.alert.successAlert(this.translate.instant('register success'));
            console.log('[MetaMatch] register done: ', res.info.success);
            this.router.navigate(['/']);
          }
          this.isLoading = false;
        },
        (err: any) => {
          this.alert.errorAlert('[MetaMatch] register fail: ' + err);
          this.isLoading = false;
        },
      );
    }
  }
}
