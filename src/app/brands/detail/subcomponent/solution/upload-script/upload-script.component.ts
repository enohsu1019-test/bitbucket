import { Component, Input, OnInit } from '@angular/core';
import { InTableConfig } from '@sysage/in-table';
import _ from 'lodash';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApiService } from 'src/app/core/services/api.service';
import { ScriptData } from '../../../../brands';
import { BrandsApiService } from '../../../../brands-api.service';

@Component({
  selector: 'app-upload-script',
  templateUrl: './upload-script.component.html',
  styleUrls: ['./upload-script.component.scss']
})
export class UploadScriptComponent implements OnInit {
  @Input() brandId!: string;
  @Input() solutionId!: string;

  constructor(
    private api: ApiService,
    private alert: AlertService,
    private brandsAPI: BrandsApiService,
  ) { }

  fileData: any;

  // intable設定
  intableConfig = new InTableConfig();
  // intable資料
  intableDatas: ScriptData[] = [];

  ui = {
    isLoading: false,
  }

  ngOnInit(): void {
    this.getScriptList();
  }


  deleteScriptFile(script: ScriptData, index: number) {
    const id = script.id;

    this.brandsAPI.deleteScriptList(this.brandId, this.solutionId, id).subscribe({
      next: (res) => {
        console.log('[solution] deleteScript done', res);
        this.alert.successAlert('檔案刪除成功');
        this.intableDatas.splice(index,1);

      },
      error: (err) => {
        console.error('[solution] deleteScript fail', err);
        this.alert.errorAlert('[solution] deleteScript fail' + err);
        // this.ui.isLoading = false;
      },
    });

  }

  getScriptList() {
    this.ui.isLoading = true;
    this.intableDatas = [];
    this.brandsAPI.getScriptList(this.brandId, this.solutionId).subscribe({
      next: (res) => {
        console.log('[solution] getScript done', res);
        this.intableDatas = res.data;
        this.ui.isLoading = false;
      },
      error: (err) => {
        console.error('[solution] getScriptList fail', err);
        this.alert.errorAlert('[solution] getScriptList fail' + err);
        this.ui.isLoading = false;
      },
    });
  }
  test(event: any) {
    this.fileData = event;

  }

  uploadScript(event: any) {
    // 檢查是否重複檔名
    if (this.intableDatas.findIndex(intableItem => intableItem.filename === event.target.files[0].name) >= 0) {
      this.alert.errorAlert('檔案重複');
      return;
    }
    this.uploadTemplateFile(event, '/script');
  }

  uploadTemplateFile(event: any, folder: string) {
    const fileList = event.target.files;
    const name = event.target.files[0].name
    this.brandsAPI
      .addSolutionFiles(this.brandId, this.solutionId,fileList,folder,name).subscribe({
        next: (res) => {
          if (res.info.success && res?.data) {
            console.log('[script-content] uploadTemplateFile done', res);
            this.alert.successAlert('上傳腳本成功');
            this.getScriptList();

          } else {

          }
        },
        error: (err) => {
          console.error('[brands] uploadScript fail', err);
          this.alert.errorAlert('[brands] uploadScript fail' + err);

        },
      });
  }

}
