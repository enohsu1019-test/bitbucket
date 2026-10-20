import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-users-role-detail',
  templateUrl: './users-role-detail.component.html',
  styleUrls: ['./users-role-detail.component.scss']
})
export class UsersRoleDetailComponent implements OnInit {
  roleId: string = '';

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
    console.log(this.roleId);

  }

}
