import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { filter } from "rxjs";
import { UsersRoleDetailComponent } from "./users-role-detail.component";


@Component({
  template: '',
  styleUrls: ['./users-role-detail.component.scss']
})

export class ItemModalEntryComponent implements OnInit {

  bsModalRef!: BsModalRef;

  /** 傳入modal的資訊 */
  config: ModalOptions = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'right-drawer vw-50',
    animated: false,
    initialState: {
      roleId: '',
    }
  };


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
  ) { }

  ngOnInit(): void {
    this.config.initialState = { roleId: this.route.snapshot.params['ruleId'] };
    this.openModal();

    // 關閉dialog, route回列表頁 (加reason因為subscribe不能回傳空)
    this.modalService.onHide.subscribe((res: string) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

  openModal() {
    this.bsModalRef = this.modalService.show(UsersRoleDetailComponent, this.config);
  }
}
